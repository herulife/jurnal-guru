"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "@/lib/useApi";
import HeaderActions from "@/components/HeaderActions";
import GoogleSheetsSection from "@/components/GoogleSheetsSection";
import TutorialLink from "@/components/TutorialLink";
import { useToast } from "@/components/Feedback";

interface SettingsData {
  admin: Record<string, string>;
  user: Record<string, string>;
}

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userForm, setUserForm] = useState({ tahun_ajaran: "", semester: "1", kkm_default: "75", dark_mode: "off" });
  const [adminForm, setAdminForm] = useState({ app_name: "", invite_code: "", bank_name: "", bank_account_number: "", bank_account_name: "", bank_note: "" });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    apiGet<SettingsData>("/api/settings").then((r) => {
      if (r.ok && r.data) {
        const d = r.data;
        if (d.user) setUserForm((prev) => ({ ...prev, ...d.user }));
        if (d.admin) setAdminForm((prev) => ({ ...prev, ...d.admin }));
      }
    });
    fetch("/api/auth/check").then((r) => r.json()).then((r) => {
      if (r.ok && r.data?.user?.role === "Admin") setIsAdmin(true);
    }).catch(() => {});
  }, []);

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await apiPut("/api/settings", { user: userForm });
    setSaving(false);
    show(res.ok ? "Pengaturan pribadi disimpan" : (res.msg || "Gagal menyimpan"), res.ok ? "success" : "error");
  }

  async function handleSaveAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await apiPut("/api/settings", { admin: adminForm });
    setSaving(false);
    show(res.ok ? "Pengaturan aplikasi disimpan" : (res.msg || "Gagal menyimpan"), res.ok ? "success" : "error");
  }

  async function handleBackup() {
    const res = await apiPost("/api/backup", { mode: "export" });
    if (res.ok && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      show("Backup berhasil diunduh", "success");
    } else {
      show(res.msg || "Backup gagal", "error");
    }
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await apiPost("/api/backup", { mode: "import", data });
    e.target.value = "";
    show(res.ok ? "Restore berhasil" : (res.msg || "Restore gagal"), res.ok ? "success" : "error");
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Pengaturan</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 font-[Outfit]">Pengaturan Saya</h3>
            <TutorialLink href="/panduan#dashboard" label="Panduan" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Berlaku untuk akun Anda sendiri.</p>
          <form onSubmit={handleSaveUser}>
            <div className="space-y-5">
              <div><label className="label">Tahun Ajaran</label><input type="text" className="input" placeholder="2026/2027" value={userForm.tahun_ajaran} onChange={(e) => setUserForm({...userForm, tahun_ajaran: e.target.value})} /></div>
              <div><label className="label">Semester</label><select className="input" value={userForm.semester} onChange={(e) => setUserForm({...userForm, semester: e.target.value})}><option value="1">Semester 1</option><option value="2">Semester 2</option></select></div>
              <div><label className="label">KKM Default</label><input type="number" className="input" placeholder="75" value={userForm.kkm_default} onChange={(e) => setUserForm({...userForm, kkm_default: e.target.value})} /></div>
              <div><label className="label">Tema Gelap</label><select className="input" value={userForm.dark_mode} onChange={(e) => setUserForm({...userForm, dark_mode: e.target.value})}><option value="off">Terang</option><option value="on">Gelap</option></select></div>
            </div>
            <div className="mt-6"><button type="submit" className="btn btn-primary" disabled={saving}><i className="fas fa-save"></i> Simpan</button></div>
          </form>
        </div>

        {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 font-[Outfit]">Pengaturan Admin</h3>
            <TutorialLink href="/panduan#dashboard" label="Panduan" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Khusus admin — berlaku untuk seluruh aplikasi.</p>
          <form onSubmit={handleSaveAdmin}>
            <div className="space-y-5">
              <div><label className="label">Nama Aplikasi</label><input type="text" className="input" placeholder="Jurnal Guru" value={adminForm.app_name} onChange={(e) => setAdminForm({...adminForm, app_name: e.target.value})} /></div>
              <div><label className="label">Kode Undangan (untuk pendaftaran guru)</label><input type="text" className="input" value={adminForm.invite_code} onChange={(e) => setAdminForm({...adminForm, invite_code: e.target.value})} placeholder="Contoh: JURNAL-2026" /><p className="text-xs text-gray-500 mt-1">Bagikan kode ini ke guru agar bisa membuat akun.</p></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="label">Nama Bank</label><input type="text" className="input" placeholder="Contoh: BRI" value={adminForm.bank_name} onChange={(e) => setAdminForm({...adminForm, bank_name: e.target.value})} /></div>
                <div><label className="label">No. Rekening</label><input type="text" className="input" placeholder="Nomor rekening" value={adminForm.bank_account_number} onChange={(e) => setAdminForm({...adminForm, bank_account_number: e.target.value})} /></div>
              </div>
              <div><label className="label">Atas Nama</label><input type="text" className="input" placeholder="Nama pemilik rekening" value={adminForm.bank_account_name} onChange={(e) => setAdminForm({...adminForm, bank_account_name: e.target.value})} /></div>
              <div><label className="label">Catatan Bank</label><input type="text" className="input" placeholder="Petunjuk pembayaran" value={adminForm.bank_note} onChange={(e) => setAdminForm({...adminForm, bank_note: e.target.value})} /></div>
            </div>
            <div className="mt-6"><button type="submit" className="btn btn-primary" disabled={saving}><i className="fas fa-save"></i> Simpan</button></div>
          </form>
        </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 font-[Outfit]">Backup & Restore Database</h3>
            <TutorialLink href="/panduan#dashboard" label="Panduan" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Backup menyimpan seluruh data Anda (Kelas, Siswa, Nilai, Absensi, Jurnal, dll) dalam format JSON.</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-accent" onClick={handleBackup}><i className="fas fa-download"></i> Download Backup</button>
            <button className="btn btn-outline" onClick={() => document.getElementById("restoreInput")?.click()}><i className="fas fa-upload"></i> Restore Data</button>
            <input type="file" id="restoreInput" accept=".json" className="hidden" onChange={handleRestore} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <GoogleSheetsSection />
        </div>
      </div>
    </div>
  );
}