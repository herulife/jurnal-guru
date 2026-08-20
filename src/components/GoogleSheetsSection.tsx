"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/useApi";
import { useToast } from "@/components/Feedback";

interface SheetsInfo {
  spreadsheetUrl: string;
  serviceAccountEmail: string | null;
  scopes: string[];
}

export default function GoogleSheetsSection() {
  const { show } = useToast();
  const [info, setInfo] = useState<SheetsInfo | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "er"; text: string } | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    apiGet<SheetsInfo>("/api/sheets").then((r) => {
      if (r.ok && r.data) {
        setInfo(r.data);
        setUrl(r.data.spreadsheetUrl);
        setAvailable(true);
      } else {
        setAvailable(false);
      }
      setLoading(false);
    }).catch(() => {
      setAvailable(false);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-gray-400 text-sm py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          Memeriksa fitur Google Sheets...
        </div>
      </div>
    );
  }

  if (available === false) {
    return (
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-2 font-[Outfit]">
          <i className="fas fa-file-excel text-gray-400 mr-2"></i>Sinkronisasi Google Sheets
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Fitur ini memerlukan konfigurasi Google Service Account di server. Hubungi administrator untuk mengaktifkannya.
        </p>
      </div>
    );
  }

  async function handleSave() {
    setLoading(true);
    const res = await apiPost("/api/sheets", { spreadsheetUrl: url });
    setLoading(false);
    if (res.ok) {
      setMsg({ type: "ok", text: res.msg || "URL spreadsheet disimpan" });
      show(res.msg || "URL spreadsheet disimpan", "success");
      const r = await apiGet<SheetsInfo>("/api/sheets");
      if (r.ok && r.data) setInfo(r.data);
    } else {
      setMsg({ type: "er", text: res.msg || "Gagal menyimpan" });
      show(res.msg || "Gagal menyimpan", "error");
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
      show(d.msg, "success");
    } else {
      setMsg({ type: "er", text: res.msg || "Sinkronisasi gagal" });
      show(res.msg || "Sinkronisasi gagal", "error");
    }
  }

  return (
    <div className="card">
      <h3 className="font-bold text-gray-800 mb-2 font-[Outfit]">
        <i className="fas fa-file-excel text-[#0D7C66] mr-2"></i>Sinkronisasi Google Sheets
      </h3>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Simpan otomatis semua data (kelas, siswa, jadwal, absensi, nilai, jurnal, surat, kelompok, LCKH, LKB) ke
        spreadsheet <b>pribadi</b> Anda, sehingga data tetap milik Anda dan bisa diunduh kapan saja.
      </p>

      {msg && (
        <div className={`p-3 mb-4 rounded-xl border text-sm ${msg.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <span className="w-7 h-7 shrink-0 rounded-full bg-[#0D7C66] text-white flex items-center justify-center font-bold text-sm">1</span>
          <div className="text-sm text-gray-600 leading-relaxed">
            Buat spreadsheet baru di <b>Google Sheets</b> — klik tombol di bawah:{" "}
            <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-[#0D7C66] font-semibold underline">
              Buat Spreadsheet <i className="fas fa-external-link-alt text-xs"></i>
            </a>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="w-7 h-7 shrink-0 rounded-full bg-[#0D7C66] text-white flex items-center justify-center font-bold text-sm">2</span>
          <div className="text-sm text-gray-600 leading-relaxed flex-1">
            Klik <b>Share</b> (kanan atas) → masukkan email di bawah dengan peran <b>Editor</b> → kirim Undangan:
            {info?.serviceAccountEmail && (
              <div className="flex items-center gap-2 p-3 bg-[#F5F3EF] rounded-xl mt-3">
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
        </div>

        <div className="flex gap-3">
          <span className="w-7 h-7 shrink-0 rounded-full bg-[#0D7C66] text-white flex items-center justify-center font-bold text-sm">3</span>
          <div className="text-sm text-gray-600 leading-relaxed flex-1">
            Salin URL spreadsheet (address bar) lalu tempel di kolom di bawah. Klik <b>Simpan URL</b>, lalu{" "}
            <b>Sinkronkan ke Sheets</b> untuk menulis seluruh data.
          </div>
        </div>
      </div>

      <input
        type="text"
        className="input mb-3"
        placeholder="https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxx/edit"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <i className="fas fa-save"></i> Simpan URL
        </button>
        <button className="btn btn-accent" onClick={handleSync} disabled={syncing || !url}>
          {syncing ? <><i className="fas fa-spinner fa-spin"></i> Menyinkronkan...</> : <><i className="fas fa-sync"></i> Sinkronkan ke Sheets</>}
        </button>
      </div>

      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Data yang disinkronkan</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {(info?.scopes || []).map((s) => (
          <div key={s} className="flex items-center gap-2 p-2.5 bg-[#F5F3EF] rounded-xl">
            <i className="fas fa-check-circle text-[#0D7C66]"></i>
            <span className="text-xs font-semibold text-gray-700">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
