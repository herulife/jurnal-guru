"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";
import Modal from "@/components/Modal";
import { useConfirm } from "@/components/ConfirmModal";

interface Jadwal {
  id: string; hari: string; jamMulai: string; jamSelesai: string;
  mataPelajaran: string; kelasId: string; ruangan: string; namaKelas: string;
}
interface Kelas { id: string; namaKelas: string; }

const hariUrut: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6 };

export default function JadwalPage() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filterHari, setFilterHari] = useState("");
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Jadwal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState(new Set<string>());
  const { confirm, ConfirmComponent } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Jadwal[]>("/api/jadwal");
    if (res.ok && res.data) {
      let d = res.data;
      if (filterHari) d = d.filter((j) => j.hari === filterHari);
      d.sort((a, b) => (hariUrut[a.hari] || 9) - (hariUrut[b.hari] || 9) || String(a.jamMulai).localeCompare(String(b.jamMulai)));
      setData(d);
    }
    const resK = await apiGet<Kelas[]>("/api/kelas");
    if (resK.ok && resK.data) setKelas(resK.data);
    setLoading(false);
  }, [filterHari]);

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
    if (!(await confirm({ message: `Hapus ${selected.size} data?` }))) return;
    for (const id of selected) { await apiDelete(`/api/jadwal/${id}`); }
    setSelected(new Set()); load();
  }

  function openEdit(j: Jadwal) { setEditData(j); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Jadwal Mengajar</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Jadwal</button>
          <a href="/panduan#jadwal-mengajar" className="doc-link" aria-label="Buka panduan"><i className="fas fa-circle-question"></i></a>
<HeaderActions />
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-40 text-sm" value={filterHari} onChange={(e) => setFilterHari(e.target.value)}>
          <option value="">Semua Hari</option>
          {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map((h) => (<option key={h} value={h}>{h}</option>))}
        </select>
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
            <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} aria-label="Pilih semua jadwal" /></th>
            <th>No</th><th>Hari</th><th>Jam</th><th>Mapel</th><th>Kelas</th><th>Ruangan</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={8} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
            {paginatedData.map((j, i) => (
              <tr key={j.id}>
                <td><input type="checkbox" checked={selected.has(j.id)} onChange={() => toggleSelect(j.id)} aria-label={`Pilih jadwal ${j.mataPelajaran}`} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td><span className="badge badge-sakit">{j.hari}</span></td>
                <td>{j.jamMulai} - {j.jamSelesai}</td>
                <td className="font-semibold">{j.mataPelajaran}</td>
                <td>{j.namaKelas}</td>
                <td>{j.ruangan}</td>
                <td>
                  <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(j)} aria-label="Edit jadwal"><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (await confirm({ message: "Hapus data ini?" })) { await apiDelete(`/api/jadwal/${j.id}`); load(); } }} aria-label="Hapus jadwal"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <JadwalModal editData={editData} kelas={kelas} onSave={load} onClose={() => setModalOpen(false)} />}
      {ConfirmComponent}
    </div>
  );
}

function JadwalModal({ editData, kelas, onSave, onClose }: { editData: Jadwal | null; kelas: Kelas[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ hari: "Senin", kelasId: "", mataPelajaran: "", jamMulai: "", jamSelesai: "", ruangan: "" });

  useEffect(() => {
    if (editData) {
      setForm({ hari: editData.hari, kelasId: editData.kelasId, mataPelajaran: editData.mataPelajaran, jamMulai: editData.jamMulai, jamSelesai: editData.jamSelesai, ruangan: editData.ruangan });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = editData
      ? (await apiPut(`/api/jadwal/${editData.id}`, form)).ok
      : (await apiPost("/api/jadwal", form)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <Modal open onClose={onClose} title={editData ? "Edit Jadwal" : "Tambah Jadwal"}>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Hari</label><select className="input" value={form.hari} onChange={(e) => setForm({...form, hari: e.target.value})}>{["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map(h => <option key={h} value={h}>{h}</option>)}</select></div>
            <div><label className="label">Kelas</label><select className="input" value={form.kelasId} onChange={(e) => setForm({...form, kelasId: e.target.value})}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
            <div><label className="label">Mapel</label><input type="text" className="input" value={form.mataPelajaran} onChange={(e) => setForm({...form, mataPelajaran: e.target.value})} placeholder="Contoh: Matematika" required /></div>
            <div><label className="label">Ruangan</label><input type="text" className="input" value={form.ruangan} onChange={(e) => setForm({...form, ruangan: e.target.value})} placeholder="Contoh: Lab Komputer" /></div>
            <div><label className="label">Jam Mulai</label><input type="time" className="input" value={form.jamMulai} onChange={(e) => setForm({...form, jamMulai: e.target.value})} required /></div>
            <div><label className="label">Jam Selesai</label><input type="time" className="input" value={form.jamSelesai} onChange={(e) => setForm({...form, jamSelesai: e.target.value})} required /></div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button type="button" className="btn btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan</button>
          </div>
        </form>
    </Modal>
  );
}
