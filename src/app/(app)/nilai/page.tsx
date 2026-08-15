"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import { bukaDokumen, exportXlsx, esc } from "@/lib/dokumen";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import PlanGuard from "@/components/PlanGuard";
import { useToast } from "@/components/Feedback";

interface Nilai { id: string; namaSiswa: string; siswaId: string; namaKelas: string; kelasId: string; mataPelajaran: string; kategori: string; nilai: number; kkm: number; bab: string; remedial: string; }
interface Kelas { id: string; namaKelas: string; }
interface Siswa { id: string; namaSiswa: string; }

function NilaiPageInner() {
  const [data, setData] = useState<Nilai[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Nilai | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState(new Set<string>());
  const { show } = useToast();

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

  const mapelList = Array.from(new Set(data.map((d) => d.mataPelajaran).filter(Boolean))).sort();

  const filteredData = filterMapel
    ? data.filter((d) => d.mataPelajaran.toLowerCase().includes(filterMapel.toLowerCase()))
    : data;

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

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
    show("Data nilai berhasil dihapus", "success");
    setSelected(new Set()); load();
  }

  function openEdit(n: Nilai) { setEditData(n); setModalOpen(true); }

  const kelasNama = kelas.find((k) => k.id === filterKelas)?.namaKelas || "Semua Kelas";
  const identitasNilai = [
    `:Kelas~${kelasNama}`,
    `:Mata Pelajaran~${filterMapel || "Semua Mapel"}`,
    `:Kategori~${filterKategori || "Semua Kategori"}`,
  ];

  async function exportExcelNilai() {
    const headers = ["Nama Siswa", "Kelas", "Mapel", "Kategori", "Nilai", "KKM", "Remedial"];
    const rows = filteredData.map((d) => [d.namaSiswa, d.namaKelas, d.mataPelajaran, d.kategori, String(d.nilai), String(d.kkm), d.remedial || ""]);
    await exportXlsx({
      file: "daftar-nilai.xlsx",
      judul: "DAFTAR NILAI",
      identitas: identitasNilai,
      headers,
      rows,
    });
  }

  async function printNilaiPdf() {
    const tbody = filteredData
      .map(
        (d, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(d.namaSiswa)}</td><td>${esc(d.namaKelas)}</td><td>${esc(d.mataPelajaran)}</td><td>${esc(d.kategori)}</td><td class="nomer">${esc(d.nilai)}</td><td class="nomer">${esc(d.kkm)}</td><td>${esc(d.remedial || "-")}</td></tr>`
      )
      .join("");
    await bukaDokumen({
      judul: "DAFTAR NILAI",
      identitas: identitasNilai,
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>Nama Siswa</th><th>Kelas</th><th>Mapel</th><th>Kategori</th><th class="nomer">Nilai</th><th class="nomer">KKM</th><th>Remedial</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6 gap-3">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Nilai</h1>
        <div className="flex flex-wrap gap-2">
          <HeaderActions />
          <button className="btn btn-accent btn-sm" onClick={printNilaiPdf}><i className="fas fa-file-pdf"></i> PDF Nilai</button>
          <button className="btn btn-accent btn-sm" onClick={() => exportExcelNilai()}><i className="fas fa-file-excel"></i> Excel Nilai</button>
        </div>
      </header>

      <NilaiBatchInline kelas={kelas} mapelList={mapelList} onSave={load} />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
          <option value="">Semua Kelas</option>
          {kelas.map((k) => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
        </select>
        <input type="text" className="input w-40 text-sm" placeholder="Filter mapel..." value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)} />
        <select className="input w-40 text-sm" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          <option value="Pengetahuan">Pengetahuan</option>
          <option value="Keterampilan">Keterampilan</option>
          <option value="Ulangan">Ulangan</option>
          <option value="Tugas">Tugas</option>
        </select>
        <TutorialLink href="/panduan#nilai" label="Panduan" />
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
            <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} aria-label="Pilih semua nilai" /></th>
            <th>No</th><th>Siswa</th><th>Kelas</th><th>Mapel</th><th>Kategori</th><th>Nilai</th><th>KKM</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {filteredData.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
            {paginatedData.map((n, i) => (
              <tr key={n.id}>
                <td><input type="checkbox" checked={selected.has(n.id)} onChange={() => toggleSelect(n.id)} aria-label={`Pilih nilai ${n.namaSiswa}`} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{n.namaSiswa}</td>
                <td>{n.namaKelas}</td>
                <td>{n.mataPelajaran}</td>
                <td>{n.kategori}</td>
                <td className="font-bold">{n.nilai}</td>
                <td>{n.kkm}</td>
                <td><span className={`badge ${n.nilai >= n.kkm ? "badge-hadir" : "badge-alpha"}`}>{n.nilai >= n.kkm ? "Tuntas" : "Belum Tuntas"}</span></td>
                <td>
                  <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(n)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus?")) { await apiDelete(`/api/nilai/${n.id}`); show("Data nilai berhasil dihapus", "success"); load(); } }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && <Pagination current={page} total={filteredData.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <NilaiEditModal editData={editData} kelas={kelas} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function NilaiEditModal({ editData, kelas, onSave, onClose }: { editData: Nilai | null; kelas: Kelas[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ mataPelajaran: "", kategori: "Pengetahuan", nilai: "75", kkm: "75", bab: "", remedial: "" });
  const [kelasId, setKelasId] = useState("");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const { show } = useToast();

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
      const res = await apiPut(`/api/nilai/${editData.id}`, payload);
      if (res.ok) {
        show("Nilai berhasil diperbarui", "success");
        onClose(); onSave();
      } else {
        show(res.msg || "Gagal memperbarui nilai", "error");
      }
    } else {
      if (!selectedSiswa) return alert("Pilih siswa");
      const res = await apiPost("/api/nilai", { ...payload, siswaId: selectedSiswa, kelasId });
      if (res.ok) {
        show("Nilai berhasil ditambahkan", "success");
        onClose(); onSave();
      } else {
        show(res.msg || "Gagal menambah nilai", "error");
      }
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
            <div><label className="label">Mapel</label><input type="text" className="input" placeholder="Matematika" value={form.mataPelajaran} onChange={(e) => setForm({...form, mataPelajaran: e.target.value})} /></div>
            <div><label className="label">Kategori</label><select className="input" value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})}><option>Pengetahuan</option><option>Keterampilan</option><option>Ulangan</option><option>Tugas</option></select></div>
            <div><label className="label">Nilai</label><input type="number" className="input" min="0" max="100" placeholder="0-100" value={form.nilai} onChange={(e) => setForm({...form, nilai: e.target.value})} /></div>
            <div><label className="label">KKM</label><input type="number" className="input" min="0" max="100" placeholder="75" value={form.kkm} onChange={(e) => setForm({...form, kkm: e.target.value})} /></div>
            <div><label className="label">BAB</label><input type="text" className="input" placeholder="Contoh: Bab 1" value={form.bab} onChange={(e) => setForm({...form, bab: e.target.value})} /></div>
            <div><label className="label">Remedial</label><input type="text" className="input" placeholder="Keterangan remedial" value={form.remedial} onChange={(e) => setForm({...form, remedial: e.target.value})} /></div>
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

function NilaiBatchInline({ kelas, mapelList, onSave }: { kelas: Kelas[]; mapelList: string[]; onSave: () => void }) {
  const [kelasId, setKelasId] = useState("");
  const [mapel, setMapel] = useState("");
  const [kategori, setKategori] = useState("Pengetahuan");
  const [kkm, setKkm] = useState("75");
  const [bab, setBab] = useState("");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [nilaiMap, setNilaiMap] = useState<Record<string, string>>({});
  const { show } = useToast();

  useEffect(() => {
    if (!kelasId) { setSiswa([]); return; }
    apiGet<Siswa[]>(`/api/siswa?kelasId=${kelasId}`).then((r) => { if (r.ok && r.data) { setSiswa(r.data); const m: Record<string, string> = {}; r.data.forEach((s) => { m[s.id] = "75"; }); setNilaiMap(m); } });
  }, [kelasId]);

  async function handleSubmit() {
    if (!kelasId || !mapel) return alert("Pilih kelas dan mapel");
    const records = siswa.map((s) => ({
      siswaId: s.id, kelasId, mataPelajaran: mapel, kategori, bab,
      nilai: Number(nilaiMap[s.id]) || 0, kkm: Number(kkm) || 75,
      bentukPenugasan: "Batch", tujuanPembelajaran: "",
    }));
    if (!records.length) return;
    const res = await apiPost("/api/nilai/batch", { records });
    if (res.ok) {
      show("Nilai batch berhasil disimpan", "success");
      onSave();
    } else {
      show(res.msg || "Gagal menyimpan nilai batch", "error");
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-[Outfit]">Input Nilai Batch (Satu Kelas)</h3>
        <TutorialLink href="/panduan#nilai" label="Panduan" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div><label className="label">Kelas</label><select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
        <div><label className="label">Mapel</label><select className="input text-sm" value={mapel} onChange={(e) => setMapel(e.target.value)}><option value="">Pilih Mapel</option>{mapelList.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        <div><label className="label">KKM</label><input type="number" className="input text-sm" placeholder="75" value={kkm} min="0" max="100" onChange={(e) => setKkm(e.target.value)} /></div>
        <div><label className="label">Kategori</label><select className="input text-sm" value={kategori} onChange={(e) => setKategori(e.target.value)}><option>Pengetahuan</option><option>Keterampilan</option><option>Ulangan</option><option>Tugas</option></select></div>
      </div>
      <div className="space-y-2 mb-4">
        {!kelasId && <p className="text-sm text-gray-400 text-center py-4">Pilih kelas terlebih dahulu</p>}
        {kelasId && siswa.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Tidak ada siswa di kelas ini</p>}
        {siswa.map((s) => (
          <div key={s.id} className="flex items-center gap-2 p-2 bg-[#F5F3EF] rounded-xl">
            <span className="text-xs flex-1">{s.namaSiswa}</span>
            <label className="text-xs text-gray-500">Nilai</label>
            <input type="number" className="input w-20 text-xs py-1" min="0" max="100" value={nilaiMap[s.id] || "75"} onChange={(e) => setNilaiMap({...nilaiMap, [s.id]: e.target.value})} />
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={!kelasId}><i className="fas fa-save"></i> Simpan Semua Nilai</button>
    </div>
  );
}
export default function NilaiPage() {
  return (
    <PlanGuard min="pro">
      <NilaiPageInner />
    </PlanGuard>
  );
}
