"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";

export default function SettingsPage() {
  const [form, setForm] = useState({ app_name: "", tahun_ajaran: "", semester: "1", kkm_default: "75", bank_name: "BRI", bank_account_number: "", bank_account_name: "", bank_note: "" });

  useEffect(() => {
    apiGet<Record<string, string>>("/api/settings").then((r) => {
      if (r.ok && r.data) setForm((prev) => ({ ...prev, ...r.data }));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPut("/api/settings", form);
  }

  async function handleBackup() {
    const res = await apiPost("/api/backup", { mode: "export" });
    if (res.ok && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    }
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    await apiPost("/api/backup", { mode: "import", data });
    e.target.value = "";
  }

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Pengaturan</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Pengaturan</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div><label className="label">Nama Aplikasi</label><input type="text" className="input" value={form.app_name} onChange={(e) => setForm({...form, app_name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="label">Tahun Ajaran</label><input type="text" className="input" value={form.tahun_ajaran} onChange={(e) => setForm({...form, tahun_ajaran: e.target.value})} /></div>
                <div><label className="label">Semester</label><select className="input" value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})}><option value="1">Semester 1</option><option value="2">Semester 2</option></select></div>
              </div>
              <div><label className="label">KKM Default</label><input type="number" className="input" value={form.kkm_default} onChange={(e) => setForm({...form, kkm_default: e.target.value})} /></div>
            </div>
            <div className="mt-6"><button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan</button></div>
          </form>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]"><i className="fas fa-university text-[#0D7C66] mr-2"></i>Rekening Pembayaran</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Rekening ini ditampilkan di halaman checkout saat pembayaran via transfer bank.</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Nama Bank</label><input type="text" className="input" value={form.bank_name} onChange={(e) => setForm({...form, bank_name: e.target.value})} /></div>
                <div><label className="label">No. Rekening</label><input type="text" className="input" value={form.bank_account_number} onChange={(e) => setForm({...form, bank_account_number: e.target.value})} /></div>
              </div>
              <div><label className="label">Atas Nama</label><input type="text" className="input" value={form.bank_account_name} onChange={(e) => setForm({...form, bank_account_name: e.target.value})} /></div>
              <div><label className="label">Catatan (tampil di halaman pembayaran)</label><textarea className="input min-h-[70px]" value={form.bank_note} onChange={(e) => setForm({...form, bank_note: e.target.value})} /></div>
            </div>
            <div className="mt-5"><button type="submit" className="btn btn-accent"><i className="fas fa-save"></i> Simpan Rekening</button></div>
          </form>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Backup & Restore Database</h3>
          <p className="text-sm text-gray-500 mb-4">Backup menyimpan seluruh data (Kelas, Siswa, Nilai, Absensi, Jurnal, dll) dalam format JSON.</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" onClick={handleBackup}><i className="fas fa-download"></i> Download Backup</button>
            <button className="btn btn-outline" onClick={() => document.getElementById("restoreInput")?.click()}><i className="fas fa-upload"></i> Restore Data</button>
            <input type="file" id="restoreInput" accept=".json" className="hidden" onChange={handleRestore} />
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}
