"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";

export default function ProfilPage() {
  const [form, setForm] = useState({
    namaSekolah: "", alamat: "", npsn: "", kota: "", provinsi: "",
    telepon: "", kepalaSekolah: "", nipKepsek: "", namaGuru: "", nipGuru: "", logoUrl: "",
  });

  useEffect(() => {
    apiGet<typeof form>("/api/profil").then((r) => { if (r.ok && r.data) setForm(r.data); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPut("/api/profil", form);
  }

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Profil Sekolah</h1>
      </header>

      <div className="card max-w-3xl">
        <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Informasi Sekolah</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="label">Nama Sekolah</label><input type="text" className="input" value={form.namaSekolah} onChange={(e) => setForm({...form, namaSekolah: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="label">Alamat</label><textarea className="input" rows={2} value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} /></div>
            <div><label className="label">NPSN</label><input type="text" className="input" value={form.npsn} onChange={(e) => setForm({...form, npsn: e.target.value})} /></div>
            <div><label className="label">Kota</label><input type="text" className="input" value={form.kota} onChange={(e) => setForm({...form, kota: e.target.value})} /></div>
            <div><label className="label">Provinsi</label><input type="text" className="input" value={form.provinsi} onChange={(e) => setForm({...form, provinsi: e.target.value})} /></div>
            <div><label className="label">Telepon</label><input type="text" className="input" value={form.telepon} onChange={(e) => setForm({...form, telepon: e.target.value})} /></div>
            <div><label className="label">Kepala Sekolah</label><input type="text" className="input" value={form.kepalaSekolah} onChange={(e) => setForm({...form, kepalaSekolah: e.target.value})} /></div>
            <div><label className="label">NIP Kepala Sekolah</label><input type="text" className="input" value={form.nipKepsek} onChange={(e) => setForm({...form, nipKepsek: e.target.value})} /></div>
            <div><label className="label">Nama Guru</label><input type="text" className="input" value={form.namaGuru} onChange={(e) => setForm({...form, namaGuru: e.target.value})} /></div>
            <div><label className="label">NIP Guru</label><input type="text" className="input" value={form.nipGuru} onChange={(e) => setForm({...form, nipGuru: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="label">Logo URL</label><input type="text" className="input" value={form.logoUrl} onChange={(e) => setForm({...form, logoUrl: e.target.value})} /></div>
          </div>
          <div className="mt-6"><button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan Profil</button></div>
        </form>
      </div>
    </div>
    </AdminGuard>
  );
}
