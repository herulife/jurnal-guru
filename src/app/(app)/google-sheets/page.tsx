"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/useApi";

interface SheetsInfo {
  spreadsheetUrl: string;
  serviceAccountEmail: string | null;
  scopes: string[];
}

export default function GoogleSheetsPage() {
  const [info, setInfo] = useState<SheetsInfo | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "er"; text: string } | null>(null);

  useEffect(() => {
    apiGet<SheetsInfo>("/api/sheets").then((r) => {
      if (r.ok && r.data) {
        setInfo(r.data);
        setUrl(r.data.spreadsheetUrl);
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setLoading(true);
    const res = await apiPost("/api/sheets", { spreadsheetUrl: url });
    setLoading(false);
    if (res.ok) {
      setMsg({ type: "ok", text: res.msg || "URL spreadsheet disimpan" });
      const r = await apiGet<SheetsInfo>("/api/sheets");
      if (r.ok && r.data) setInfo(r.data);
    } else {
      setMsg({ type: "er", text: res.msg || "Gagal menyimpan" });
    }
  }

  async function handleSync() {
    setSyncing(true);
    setMsg(null);
    const res = await apiPost("/api/sheets", { action: "sync", spreadsheetUrl: url });
    setSyncing(false);
    if (res.ok && res.data) {
      const d = res.data as { msg: string };
      setMsg({ type: "ok", text: d.msg });
    } else {
      setMsg({ type: "er", text: res.msg || "Sinkronisasi gagal" });
    }
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Google Sheets</h1>
      </header>

      {msg && (
        <div className={`p-3 mb-4 rounded-xl border text-sm ${msg.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">1. Share spreadsheet ke service account</h3>
        {info?.serviceAccountEmail ? (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            Data Anda tersinkron ke <b>Google Spreadsheet pribadi</b> — sehingga privasi terjaga dan data tetap milik Anda.
            Buat spreadsheet baru di Google Sheets, lalu klik <b>Share</b> dan beri akses <b>Editor</b> ke email berikut:
          </p>
        ) : (
          <p className="text-sm text-amber-700 mb-3">Service account belum dikonfigurasi di server.</p>
        )}
        {info?.serviceAccountEmail && (
          <div className="flex items-center gap-2 p-3 bg-[#F5F3EF] rounded-xl mb-3">
            <i className="fas fa-envelope text-[#0D7C66]"></i>
            <code className="text-sm text-[#0D7C66] font-semibold break-all">{info.serviceAccountEmail}</code>
            <button
              className="btn btn-outline btn-sm ml-auto"
              onClick={() => { navigator.clipboard.writeText(info.serviceAccountEmail || ""); setMsg({ type: "ok", text: "Email disalin" }); }}
            >
              <i className="fas fa-copy"></i> Salin
            </button>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">2. Tempel URL spreadsheet Anda</h3>
        <div className="space-y-3">
          <input
            type="text"
            className="input"
            placeholder="https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxx/edit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              <i className="fas fa-save"></i> Simpan URL
            </button>
            <button className="btn btn-accent" onClick={handleSync} disabled={syncing || !url}>
              {syncing ? <><i className="fas fa-spinner fa-spin"></i> Menyinkronkan...</> : <><i className="fas fa-sync"></i> Sinkronkan ke Sheets</>}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Data yang disinkronkan</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(info?.scopes || []).map((s) => (
            <div key={s} className="flex items-center gap-2 p-3 bg-[#F5F3EF] rounded-xl">
              <i className="fas fa-check-circle text-[#0D7C66]"></i>
              <span className="text-sm font-semibold text-gray-700">{s}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Setiap kali Anda klik "Sinkronkan ke Sheets", seluruh data terbaru (kelas, siswa, jadwal, absensi, nilai, jurnal,
          surat, kelompok, LCKH, LKB) ditulis ulang ke spreadsheet pribadi Anda — milik Anda, dan bisa Anda unduh kapan saja.
        </p>
      </div>
    </div>
  );
}