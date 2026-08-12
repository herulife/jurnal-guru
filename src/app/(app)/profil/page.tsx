"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/useApi";
import HeaderActions from "@/components/HeaderActions";

export default function ProfilPage() {
  const [form, setForm] = useState({
    namaSekolah: "", alamat: "", npsn: "", kota: "", provinsi: "",
    telepon: "", kepalaSekolah: "", nipKepsek: "", namaGuru: "", nipGuru: "",
    jabatan: "", pangkat: "", golRuang: "", logoUrl: "",
  });

  useEffect(() => {
    apiGet<typeof form>("/api/profil").then((r) => { if (r.ok && r.data) setForm(r.data); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPut("/api/profil", form);
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Profil Sekolah</h1>
        <div className="flex items-center gap-2"><a href="/panduan#akun-pengaturan" className="doc-link" aria-label="Buka panduan"><i className="fas fa-circle-question"></i></a>
<HeaderActions /></div>
      </header>

      <div className="card max-w-3xl">
        <h3 className="font-bold text-gray-800 mb-6 font-[Outfit]">Informasi Sekolah</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="label">Nama Sekolah</label><input type="text" className="input" value={form.namaSekolah} onChange={(e) => setForm({...form, namaSekolah: e.target.value})} placeholder="Nama lengkap sekolah" /></div>
            <div className="sm:col-span-2"><label className="label">Alamat</label><textarea className="input" rows={2} value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} placeholder="Alamat lengkap sekolah, kecamatan, kota" /></div>
            <div><label className="label">NPSN</label><input type="text" className="input" value={form.npsn} onChange={(e) => setForm({...form, npsn: e.target.value})} placeholder="Contoh: 12345678 (8 digit)" /></div>
            <div><label className="label">Kota</label><input type="text" className="input" value={form.kota} onChange={(e) => setForm({...form, kota: e.target.value})} placeholder="Contoh: Bandung" /></div>
            <div><label className="label">Provinsi</label><input type="text" className="input" value={form.provinsi} onChange={(e) => setForm({...form, provinsi: e.target.value})} placeholder="Contoh: Jawa Barat" /></div>
            <div><label className="label">Telepon</label><input type="text" className="input" value={form.telepon} onChange={(e) => setForm({...form, telepon: e.target.value})} placeholder="Contoh: 0812-3456-7890" /></div>
            <div><label className="label">Kepala Sekolah</label><input type="text" className="input" value={form.kepalaSekolah} onChange={(e) => setForm({...form, kepalaSekolah: e.target.value})} placeholder="Nama lengkap kepala sekolah" /></div>
            <div><label className="label">NIP Kepala Sekolah</label><input type="text" className="input" value={form.nipKepsek} onChange={(e) => setForm({...form, nipKepsek: e.target.value})} placeholder="Contoh: 197001012000031001" /></div>
            <div><label className="label">Nama Guru</label><input type="text" className="input" value={form.namaGuru} onChange={(e) => setForm({...form, namaGuru: e.target.value})} placeholder="Nama lengkap guru" /></div>
            <div><label className="label">NIP Guru</label><input type="text" className="input" value={form.nipGuru} onChange={(e) => setForm({...form, nipGuru: e.target.value})} placeholder="Contoh: 197001012000031001" /></div>
            <div><label className="label">Jabatan</label><input type="text" className="input" value={form.jabatan} onChange={(e) => setForm({...form, jabatan: e.target.value})} placeholder="Guru Mapel" /></div>
            <div><label className="label">Pangkat</label><input type="text" className="input" value={form.pangkat} onChange={(e) => setForm({...form, pangkat: e.target.value})} placeholder="Penata Muda Tk.I" /></div>
            <div><label className="label">Golongan Ruang</label><input type="text" className="input" value={form.golRuang} onChange={(e) => setForm({...form, golRuang: e.target.value})} placeholder="III/b" /></div>
            <div className="sm:col-span-2"><label className="label">Logo URL</label><input type="text" className="input" value={form.logoUrl} onChange={(e) => setForm({...form, logoUrl: e.target.value})} placeholder="https://contoh.sch.id/logo.png" /></div>
          </div>
          <div className="mt-6"><button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan Profil</button></div>
        </form>
      </div>
    </div>
  );
}
