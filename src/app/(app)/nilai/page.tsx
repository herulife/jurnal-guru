"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";

interface Nilai { id: string; namaSiswa: string; siswaId: string; namaKelas: string; kelasId: string; mataPelajaran: string; kategori: string; nilai: number; kkm: number; bab: string; remedial: string; }
interface Kelas { id: string; namaKelas: string; }
interface Siswa { id: string; namaSiswa: string; }

export default function NilaiPage() {
  const [data, setData] = useState<Nilai[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Nilai | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState(new Set<string>());

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterKelas) params.set("kelasId", filterKelas);
    if (filterKategori) params.set("kategori", filterKategori);
    const qs = params.toString();
    const res = await apiGet<Nilai[]>(`/api/nilai${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    const resK = await apiGet<Kelas[]>("/api/kelas");
    if (resK.ok && resK.data) setKelas(resK.data);
    setLoading(false);
  }, [filterKelas, filterKategori]);

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
    for (const id of selected) { await apiDelete(`/api/nilai/${id}`); }
    setSelected(new Set()); load();
  }

  function openEdit(n: Nilai) { setEditData(n); setModalOpen(true); }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Nilai</h1>
        <div className="flex gap-2">
          <ExportButton
            fileName="nilai"
            title="Data Nilai Siswa"
            subtitle={kelas.find((k) => k.id === filterKelas)?.namaKelas || "Semua Kelas"}
            columns={[
              { key: "namaSiswa", label: "Siswa" },
              { key: "namaKelas", label: "Kelas" },
              { key: "mataPelajaran", label: "Mapel" },
              { key: "kategori", label: "Kategori" },
              { key: "nilai", label: "Nilai" },
              { key: "kkm", label: "KKM" },
              { key: "remedial", label: "Remedial" },
            ]}
            rows={data}
          />
          <NilaiBatchModal kelas={kelas} onSave={load} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map((k) => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
        </select>
        <select className="input w-40 text-sm" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          <option value="Pengetahuan">Pengetahuan</option>
          <option value="Keterampilan">Keterampilan</option>
          <option value="Ulangan">Ulangan</option>
          <option value="Tugas">Tugas</option>
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
            <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} /></th>
            <th>No</th><th>Siswa</th><th>Kelas</th><th>Mapel</th><th>Kategori</th><th>Nilai</th><th>KKM</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
            {paginatedData.map((n, i) => (
              <tr key={n.id}>
                <td><input type="checkbox" checked={selected.has(n.id)} onChange={() => toggleSelect(n.id)} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{n.namaSiswa}</td>
                <td>{n.namaKelas}</td>
                <td>{n.mataPelajaran}</td>
                <td>{n.kategori}</td>
                <td className="font-bold">{n.nilai}</td>
                <td>{n.kkm}</td>
                <td><span className={`badge ${n.nilai >= n.kkm ? "badge-tuntas" : "badge-belum-tuntas"}`}>{n.nilai >= n.kkm ? "Tuntas" : "Belum Tuntas"}</span></td>
                <td>
                  <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(n)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus?")) { await apiDelete(`/api/nilai/${n.id}`); load(); } }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <NilaiEditModal editData={editData} kelas={kelas} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function NilaiEditModal({ editData, kelas, onSave, onClose }: { editData: Nilai | null; kelas: Kelas[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ mataPelajaran: "", kategori: "Pengetahuan", nilai: "75", kkm: "75", bab: "", remedial: "" });
  const [kelasId, setKelasId] = useState("");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({ mataPelajaran: editData.mataPelajaran, kategori: editData.kategori, nilai: String(editData.nilai), kkm: String(editData.kkm), bab: editData.bab || "", remedial: editData.remedial || "" });
    }
  }, [editData]);

  useEffect(() => {
    if (!kelasId) { setSiswa([]); return; }
    apiGet<Siswa[]>(`/api/siswa?kelasId=${kelasId}`).then((r) => { if (r.ok && r.data) setSiswa(r.data); });
  }, [kelasId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, nilai: Number(form.nilai), kkm: Number(form.kkm) };
    if (editData) {
      const ok = (await apiPut(`/api/nilai/${editData.id}`, payload)).ok;
      if (ok) { onClose(); onSave(); }
    } else {
      if (!selectedSiswa) return alert("Pilih siswa");
      const ok = (await apiPost("/api/nilai", { ...payload, siswaId: selectedSiswa, kelasId })).ok;
      if (ok) { onClose(); onSave(); }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Nilai" : "Tambah Nilai"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editData && (<><div><label className="label">Kelas</label><select className="input" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Pilih</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
              <div><label className="label">Siswa</label><select className="input" value={selectedSiswa} onChange={(e) => setSelectedSiswa(e.target.value)}><option value="">Pilih</option>{siswa.map(s => <option key={s.id} value={s.id}>{s.namaSiswa}</option>)}</select></div></>)}
            <div><label className="label">Mapel</label><input type="text" className="input" value={form.mataPelajaran} onChange={(e) => setForm({...form, mataPelajaran: e.target.value})} /></div>
            <div><label className="label">Kategori</label><select className="input" value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})}><option>Pengetahuan</option><option>Keterampilan</option><option>Ulangan</option><option>Tugas</option></select></div>
            <div><label className="label">Nilai</label><input type="number" className="input" min="0" max="100" value={form.nilai} onChange={(e) => setForm({...form, nilai: e.target.value})} /></div>
            <div><label className="label">KKM</label><input type="number" className="input" min="0" max="100" value={form.kkm} onChange={(e) => setForm({...form, kkm: e.target.value})} /></div>
            <div><label className="label">BAB</label><input type="text" className="input" value={form.bab} onChange={(e) => setForm({...form, bab: e.target.value})} /></div>
            <div><label className="label">Remedial</label><input type="text" className="input" value={form.remedial} onChange={(e) => setForm({...form, remedial: e.target.value})} /></div>
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

function NilaiBatchModal({ kelas, onSave }: { kelas: Kelas[]; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [kelasId, setKelasId] = useState("");
  const [mapel, setMapel] = useState("");
  const [kategori, setKategori] = useState("Pengetahuan");
  const [kkm, setKkm] = useState("75");
  const [bab, setBab] = useState("");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [nilaiMap, setNilaiMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!kelasId) { setSiswa([]); return; }
    apiGet<Siswa[]>(`/api/siswa?kelasId=${kelasId}`).then((r) => { if (r.ok && r.data) { setSiswa(r.data); const m: Record<string, string> = {}; r.data.forEach((s) => { m[s.id] = "75"; }); setNilaiMap(m); } });
  }, [kelasId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kelasId || !mapel) return;
    const records = siswa.map((s) => ({
      siswaId: s.id, kelasId, mataPelajaran: mapel, kategori, bab,
      nilai: Number(nilaiMap[s.id]) || 0, kkm: Number(kkm) || 75,
      bentukPenugasan: "Batch", tujuanPembelajaran: "",
    }));
    if (!records.length) return;
    const res = await apiPost("/api/nilai/batch", { records });
    if (res.ok) { setOpen(false); onSave(); }
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}><i className="fas fa-plus"></i> Input Nilai Batch</button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
              <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">Input Nilai Batch</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div><label className="label">Kelas</label><select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
                <div><label className="label">Mapel</label><input type="text" className="input text-sm" value={mapel} onChange={(e) => setMapel(e.target.value)} /></div>
                <div><label className="label">Kategori</label><select className="input text-sm" value={kategori} onChange={(e) => setKategori(e.target.value)}><option>Pengetahuan</option><option>Keterampilan</option><option>Ulangan</option><option>Tugas</option></select></div>
                <div><label className="label">KKM</label><input type="number" className="input text-sm" value={kkm} onChange={(e) => setKkm(e.target.value)} /></div>
              </div>
              <div className="space-y-2 mb-4">
                {!kelasId && <p className="text-sm text-gray-400 text-center py-4">Pilih kelas dulu</p>}
                {siswa.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-2 bg-[#F5F3EF] rounded-xl">
                    <span className="text-xs flex-1">{s.namaSiswa}</span>
                    <label className="text-xs text-gray-500">Nilai</label>
                    <input type="number" className="input w-20 text-xs py-1" min="0" max="100" value={nilaiMap[s.id] || "75"} onChange={(e) => setNilaiMap({...nilaiMap, [s.id]: e.target.value})} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan Semua</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
