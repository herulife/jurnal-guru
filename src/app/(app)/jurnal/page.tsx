"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";

interface Jurnal { id: string; tanggal: string; namaKelas: string; mataPelajaran: string; jamKe: string; materi: string; kendala: string; deskripsi: string; solusi: string; kehadiranSiswa: string; catatan: string; kelasId: string; }
interface Kelas { id: string; namaKelas: string; }

export default function JurnalPage() {
  const [data, setData] = useState<Jurnal[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Jurnal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState(new Set<string>());

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterKelas) params.set("kelasId", filterKelas);
    if (filterTanggal) params.set("tanggal", filterTanggal);
    const qs = params.toString();
    const res = await apiGet<Jurnal[]>(`/api/jurnal${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    const resK = await apiGet<Kelas[]>("/api/kelas");
    if (resK.ok && resK.data) setKelas(resK.data);
    setLoading(false);
  }, [filterKelas, filterTanggal]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setSelected(new Set()); setPage(1); }, [data.length]);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleSelectAll() {
    if (selected.size === paginatedData.length) { setSelected(new Set()); }
    else { setSelected(new Set(paginatedData.map(d => d.id))); }
  }
  async function handleBulkDelete() {
    if (!confirm(`Hapus ${selected.size} data?`)) return;
    for (const id of selected) { await apiDelete(`/api/jurnal/${id}`); }
    setSelected(new Set()); load();
  }

  function openEdit(j: Jurnal) { setEditData(j); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Jurnal Mengajar</h1>
        <div className="flex items-center gap-2">
          <ExportButton
            fileName="jurnal-mengajar"
            title="Jurnal Mengajar"
            columns={[
              { key: "tanggal", label: "Tanggal" },
              { key: "namaKelas", label: "Kelas" },
              { key: "mataPelajaran", label: "Mapel" },
              { key: "jamKe", label: "Jam Ke" },
              { key: "materi", label: "Materi" },
              { key: "kendala", label: "Kendala" },
              { key: "kehadiranSiswa", label: "Kehadiran" },
              { key: "catatan", label: "Catatan" },
            ]}
            rows={data}
          />
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah</button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map((k) => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
        </select>
        <input type="date" className="input w-44 text-sm" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
      </div>

      {selected.size > 0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-800">{selected.size} data terpilih</span>
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><i className="fas fa-trash"></i> Hapus Semua</button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} /></th>
            <th>No</th><th>Tanggal</th><th>Kelas</th><th>Mapel</th><th>Jam Ke</th><th>Materi</th><th>Kendala</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={9} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
            {paginatedData.map((j, i) => (
              <tr key={j.id}>
                <td><input type="checkbox" checked={selected.has(j.id)} onChange={() => toggleSelect(j.id)} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{j.tanggal}</td>
                <td>{j.namaKelas}</td>
                <td className="font-semibold">{j.mataPelajaran}</td>
                <td>{j.jamKe}</td>
                <td>{j.materi}</td>
                <td>{j.kendala}</td>
                <td>
                  <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(j)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus?")) { await apiDelete(`/api/jurnal/${j.id}`); load(); } }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <JurnalModal editData={editData} kelas={kelas} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function JurnalModal({ editData, kelas, onSave, onClose }: { editData: Jurnal | null; kelas: Kelas[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ tanggal: new Date().toISOString().split("T")[0], kelasId: "", mataPelajaran: "", jamKe: "", materi: "", deskripsi: "", kendala: "", solusi: "", kehadiranSiswa: "", catatan: "" });

  useEffect(() => {
    if (editData) {
      setForm({ tanggal: editData.tanggal, kelasId: editData.kelasId, mataPelajaran: editData.mataPelajaran, jamKe: editData.jamKe, materi: editData.materi, deskripsi: editData.deskripsi, kendala: editData.kendala, solusi: editData.solusi, kehadiranSiswa: editData.kehadiranSiswa, catatan: editData.catatan });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = editData
      ? (await apiPut(`/api/jurnal/${editData.id}`, form)).ok
      : (await apiPost("/api/jurnal", form)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Jurnal" : "Tambah Jurnal"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Tanggal</label><input type="date" className="input" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} /></div>
            <div><label className="label">Kelas</label><select className="input" value={form.kelasId} onChange={(e) => setForm({...form, kelasId: e.target.value})}><option value="">Pilih</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
            <div><label className="label">Mapel</label><input type="text" className="input" value={form.mataPelajaran} onChange={(e) => setForm({...form, mataPelajaran: e.target.value})} /></div>
            <div><label className="label">Jam Ke</label><input type="text" className="input" value={form.jamKe} onChange={(e) => setForm({...form, jamKe: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="label">Materi</label><input type="text" className="input" value={form.materi} onChange={(e) => setForm({...form, materi: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="label">Deskripsi</label><textarea className="input" rows={2} value={form.deskripsi} onChange={(e) => setForm({...form, deskripsi: e.target.value})} /></div>
            <div><label className="label">Kendala</label><input type="text" className="input" value={form.kendala} onChange={(e) => setForm({...form, kendala: e.target.value})} /></div>
            <div><label className="label">Solusi</label><input type="text" className="input" value={form.solusi} onChange={(e) => setForm({...form, solusi: e.target.value})} /></div>
            <div><label className="label">Kehadiran</label><input type="text" className="input" value={form.kehadiranSiswa} onChange={(e) => setForm({...form, kehadiranSiswa: e.target.value})} placeholder="30/32" /></div>
            <div><label className="label">Catatan</label><input type="text" className="input" value={form.catatan} onChange={(e) => setForm({...form, catatan: e.target.value})} /></div>
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
