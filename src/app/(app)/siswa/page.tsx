"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import UploadSiswaModal from "@/components/UploadSiswaModal";
import { useToast } from "@/components/Feedback";

interface Siswa {
  id: string; nis: string; nisn: string; namaSiswa: string;
  jenisKelamin: string; kelasId: string; alamat: string;
  telepon: string; email: string; namaOrtu: string; namaKelas: string;
}
interface Kelas { id: string; namaKelas: string; }

export default function SiswaPage() {
  const [data, setData] = useState<Siswa[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState("");
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<Siswa | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState(new Set<string>());
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const params = filterKelas ? `?kelasId=${filterKelas}` : "";
    const res = await apiGet<Siswa[]>(`/api/siswa${params}`);
    if (res.ok && res.data) setData(res.data);
    const resK = await apiGet<Kelas[]>("/api/kelas");
    if (resK.ok && resK.data) setKelas(resK.data);
    setLoading(false);
  }, [filterKelas]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setSelected(new Set()); setPage(1); }, [data.length]);

  useEffect(() => { setPage(1); }, [pageSize]);

  function downloadTemplate(kind: "csv" | "excel") {
    const headers = ["NIS", "NISN", "Nama Siswa", "L/P", "Kelas", "Telepon", "Ortu"];
    const sample = ["0012345678", "0012345689", "Contoh Nama Siswa", "L", "X IPA 1", "081234567890", "Nama Orang Tua"];
    const csv = [headers.join(","), sample.join(",")].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-siswa${kind === "excel" ? "-excel" : ""}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const filtered = search
    ? data.filter((s) => s.namaSiswa.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
    : data;

  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleSelectAll() {
    if (selected.size === paginatedData.length) { setSelected(new Set()); }
    else { setSelected(new Set(paginatedData.map(d => d.id))); }
  }
  async function handleBulkDelete() {
    if (!confirm(`Hapus ${selected.size} data?`)) return;
    for (const id of selected) { await apiDelete(`/api/siswa/${id}`); }
    show("Data siswa berhasil dihapus", "success");
    setSelected(new Set()); load();
  }

  function openEdit(s: Siswa) { setEditData(s); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Data Siswa</h1>
        <div className="flex gap-2">
          <HeaderActions />
          <button className="btn btn-outline btn-sm" onClick={() => downloadTemplate("csv")}>
            <i className="fas fa-download"></i> Template CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => downloadTemplate("excel")}>
            <i className="fas fa-download"></i> Template Excel
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => (window as any).__uploadModal?.open(kelas, load)}>
            <i className="fas fa-upload"></i> Upload Data
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="fas fa-plus"></i> Tambah
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map((k) => (<option key={k.id} value={k.id}>{k.namaKelas}</option>))}
        </select>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          <input type="text" className="input pl-10 w-full text-sm" placeholder="Cari nama / NIS..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <TutorialLink href="/panduan#siswa" label="Panduan" />
      </div>

      {selected.size > 0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-800">{selected.size} data terpilih</span>
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><i className="fas fa-trash"></i> Hapus terpilih</button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} aria-label="Pilih semua siswa" /></th>
              <th>No</th><th>NIS</th><th>NISN</th><th>Nama Siswa</th><th>L/P</th><th>Kelas</th><th>Telepon</th><th>Ortu</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (<tr><td colSpan={10} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>)}
            {paginatedData.map((s, i) => (
              <tr key={s.id}>
                <td><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} aria-label={`Pilih siswa ${s.namaSiswa}`} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{s.nis}</td>
                <td>{s.nisn}</td>
                <td className="font-semibold">{s.namaSiswa}</td>
                <td><span className={`badge ${s.jenisKelamin === "L" ? "badge-izin" : ""}`} style={s.jenisKelamin === "P" ? { backgroundColor: "#FCE7F3", color: "#9D174D" } : undefined}>{s.jenisKelamin}</span></td>
                <td>{s.namaKelas}</td>
                <td>{s.telepon}</td>
                <td>{s.namaOrtu}</td>
                <td>
                  <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(s)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus?")) { await apiDelete(`/api/siswa/${s.id}`); show("Data siswa berhasil dihapus", "success"); load(); } }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Baris/halaman:</span>
            <select className="input w-16 text-xs py-1" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
            </select>
          </div>
          <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
        </div>
      )}

      {modalOpen && <SiswaModal editData={editData} kelas={kelas} onSave={load} onClose={() => setModalOpen(false)} />}

      <UploadSiswaModal kelas={kelas} />
    </div>
  );
}

function SiswaModal({ editData, kelas, onSave, onClose }: { editData: Siswa | null; kelas: Kelas[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ nis: "", nisn: "", namaSiswa: "", jenisKelamin: "L", kelasId: "", alamat: "", telepon: "", email: "", namaOrtu: "" });
  const { show } = useToast();

  useEffect(() => {
    if (editData) {
      setForm({ nis: editData.nis, nisn: editData.nisn, namaSiswa: editData.namaSiswa, jenisKelamin: editData.jenisKelamin, kelasId: editData.kelasId, alamat: editData.alamat, telepon: editData.telepon, email: editData.email, namaOrtu: editData.namaOrtu });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = editData
      ? await apiPut(`/api/siswa/${editData.id}`, form)
      : await apiPost("/api/siswa", form);
    if (res.ok) {
      show(editData ? "Siswa berhasil diperbarui" : "Siswa berhasil ditambahkan", "success");
      onClose(); onSave();
    } else {
      show(res.msg || "Gagal menyimpan data siswa", "error");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Siswa" : "Tambah Siswa"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">NIS</label><input type="text" className="input" placeholder="Nomor Induk Siswa" value={form.nis} onChange={(e) => setForm({...form, nis: e.target.value})} required /></div>
            <div><label className="label">NISN</label><input type="text" className="input" placeholder="Nomor Induk Siswa Nasional" value={form.nisn} onChange={(e) => setForm({...form, nisn: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="label">Nama Siswa</label><input type="text" className="input" placeholder="Nama lengkap siswa" value={form.namaSiswa} onChange={(e) => setForm({...form, namaSiswa: e.target.value})} required /></div>
            <div><label className="label">Jenis Kelamin</label><select className="input" value={form.jenisKelamin} onChange={(e) => setForm({...form, jenisKelamin: e.target.value})}><option value="L">Laki-Laki</option><option value="P">Perempuan</option></select></div>
            <div><label className="label">Kelas</label><select className="input" value={form.kelasId} onChange={(e) => setForm({...form, kelasId: e.target.value})}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="label">Alamat</label><textarea className="input" rows={2} placeholder="Alamat lengkap siswa" value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} /></div>
            <div><label className="label">Telepon</label><input type="text" className="input" placeholder="Contoh: 081234567890" value={form.telepon} onChange={(e) => setForm({...form, telepon: e.target.value})} /></div>
            <div><label className="label">Email</label><input type="email" className="input" placeholder="email@contoh.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div><label className="label">Nama Orang Tua</label><input type="text" className="input" placeholder="Nama orang tua/wali" value={form.namaOrtu} onChange={(e) => setForm({...form, namaOrtu: e.target.value})} /></div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button type="button" className="btn btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
