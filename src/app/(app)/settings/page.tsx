"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "@/lib/useApi";
import HeaderActions from "@/components/HeaderActions";
import GoogleSheetsSection from "@/components/GoogleSheetsSection";
import { Toast, useToast } from "@/components/Feedback";
import { isAdminRole } from "@/lib/plan-helpers";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ app_name: "", tahun_ajaran: "", semester: "1", kkm_default: "75", invite_code: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string; type: "success"|"error"} | null>(null);

  useEffect(() => {
    apiGet<Record<string, string>>("/api/settings").then((r) => {
      if (r.ok && r.data) setForm((prev) => ({ ...prev, ...r.data }));
    });
    fetch("/api/auth/check").then((r) => r.json()).then((r) => {
      if (r.ok && r.data?.user && isAdminRole(r.data.user.role)) setIsAdmin(true);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await apiPut("/api/settings", form);
    setSaving(false);
    setToast({ msg: res.ok ? "Pengaturan berhasil disimpan" : (res.msg || "Gagal menyimpan"), type: res.ok ? "success" : "error" });
  }

  async function handleBackup() {
    const res = await apiPost("/api/backup", { mode: "export" });
    if (res.ok && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      setToast({ msg: "Backup berhasil diunduh", type: "success" });
    } else {
      setToast({ msg: res.msg || "Backup gagal", type: "error" });
    }
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await apiPost("/api/backup", { mode: "import", data });
    e.target.value = "";
    setToast({ msg: res.ok ? "Restore berhasil" : (res.msg || "Restore gagal"), type: res.ok ? "success" : "error" });
  }

  return (
    <div className="p-6 fade-in">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600" aria-label="Tutup">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      )}
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Pengaturan</h1>
        <div className="flex items-center gap-2"><a href="/panduan#akun-pengaturan" className="doc-link" aria-label="Buka panduan"><i className="fas fa-circle-question"></i></a>
<HeaderActions /></div>
      </header>

      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Pengaturan</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {isAdmin && (
                <>
              <div><label className="label">Nama Aplikasi</label><input type="text" className="input" value={form.app_name} onChange={(e) => setForm({...form, app_name: e.target.value})} placeholder="Contoh: Jurnal Guru" /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="label">Tahun Ajaran</label><input type="text" className="input" value={form.tahun_ajaran} onChange={(e) => setForm({...form, tahun_ajaran: e.target.value})} placeholder="Contoh: 2025/2026" /></div>
                <div><label className="label">Semester</label><select className="input" value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})}><option value="1">Semester 1</option><option value="2">Semester 2</option></select></div>
              </div>
              <div><label className="label">KKM Default</label><input type="number" className="input" value={form.kkm_default} onChange={(e) => setForm({...form, kkm_default: e.target.value})} placeholder="Contoh: 75" /></div>
              <div><label className="label">Kode Undangan (untuk pendaftaran guru)</label><input type="text" className="input" value={form.invite_code} onChange={(e) => setForm({...form, invite_code: e.target.value})} placeholder="Contoh: JURNAL-2026" /><p className="text-xs text-gray-500 mt-1">Bagikan kode ini ke guru agar bisa membuat akun.</p></div>
                </>
              )}
            </div>
            <div className="mt-6">{isAdmin && <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan</button>}</div>
          </form>
        </div>

        {isAdmin && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Backup & Restore Database</h3>
          <p className="text-sm text-gray-500 mb-4">Backup menyimpan seluruh data (Kelas, Siswa, Nilai, Absensi, Jurnal, dll) dalam format JSON.</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" onClick={handleBackup}><i className="fas fa-download"></i> Download Backup</button>
            <button className="btn btn-outline" onClick={() => document.getElementById("restoreInput")?.click()}><i className="fas fa-upload"></i> Restore Data</button>
            <input type="file" id="restoreInput" accept=".json" className="hidden" onChange={handleRestore} />
          </div>
        </div>
        )}

        {isAdmin && (
        <div className="lg:col-span-2">
          <GoogleSheetsSection />
        </div>
        )}
        </div>
      </div>
    </div>
  );
}
