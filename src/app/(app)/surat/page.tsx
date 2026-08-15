"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import { useToast } from "@/components/Feedback";

interface Surat {
  id: string; judul: string; jenis: string; tujuan: string; template: string;
}

export default function SuratPage() {
  const { show } = useToast();
  const [data, setData] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Surat | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState(new Set<string>());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Surat[]>("/api/surat");
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, []);

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
    let gagal = false;
    for (const id of selected) {
      const res = await apiDelete(`/api/surat/${id}`);
      if (!res.ok) gagal = true;
    }
    setSelected(new Set()); load();
    if (gagal) show("Gagal menghapus sebagian data surat", "error");
    else show("Data surat berhasil dihapus", "success");
  }

  function openEdit(s: Surat) { setEditData(s); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  const [kelolaOpen, setKelolaOpen] = useState(false);

  const jenisIcon: Record<string, string> = { panggilan: "fa-file-alt", keterangan: "fa-file-alt", tugas: "fa-tasks" };
  const jenisTone: Record<string, string> = { panggilan: "bg-red-50 text-red-600", keterangan: "bg-blue-50 text-blue-600", tugas: "bg-purple-50 text-purple-600" };
  const jenisList = [
    { jenis: "panggilan", label: "Surat Panggilan", desc: "Undangan orang tua/wali siswa" },
    { jenis: "keterangan", label: "Aktif Belajar", desc: "Surat keterangan aktif belajar" },
    { jenis: "tugas", label: "Tugas/PR", desc: "Template penugasan untuk siswa" },
  ];

  function downloadSurat(jenis: string) {
    const item = jenisList.find((d) => d.jenis === jenis);
    const record = data.find((d) => d.jenis === jenis);
    const judul = record?.judul || item?.label || "";
    const tujuan = record?.tujuan || "";
    const template = record?.template || "";
    const content = template || `<h2>${judul}</h2><p>${tujuan}</p>`;
    const blob = new Blob(["<!doctype html><html><head><meta charset='utf-8'></head><body>" + content + "</body></html>"], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jenis}_surat.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Template Surat</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="card max-w-xl">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Template Surat / Dokumen</h3>
        <p className="text-sm text-gray-500 mb-6">Pilih template surat yang ingin diunduh. Dokumen akan di-generate dengan kop surat dari Profil Sekolah.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {jenisList.map((item) => (
            <div key={item.jenis} className="card p-4 cursor-pointer hover:shadow-md transition" onClick={() => downloadSurat(item.jenis)}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${jenisTone[item.jenis]}`}>
                <i className={`fas ${jenisIcon[item.jenis]}`}></i>
              </div>
              <div className="mt-3">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
              </div>
              <button className="btn btn-primary btn-sm mt-3 w-full" onClick={(e) => { e.stopPropagation(); downloadSurat(item.jenis); }}><i className={`fas ${jenisIcon[item.jenis]}`}></i> Unduh</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <button className="w-full flex items-center justify-between font-bold text-gray-800 font-[Outfit]" onClick={() => setKelolaOpen((o) => !o)}>
          <span><i className="fas fa-cog text-[#0D7C66] mr-2"></i>Kelola Template</span>
          <i className={`fas fa-chevron-${kelolaOpen ? "up" : "down"} text-gray-400`}></i>
        </button>
        {kelolaOpen && (
          <>
            <div className="flex items-center justify-between mt-4 mb-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">Kelola template surat tersimpan untuk kebutuhan unduhan.</p>
                <TutorialLink href="/panduan#lainnya" label="Panduan" />
              </div>
              <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Surat</button>
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
                  <th><input type="checkbox" checked={paginatedData.length > 0 && selected.size === paginatedData.length} onChange={toggleSelectAll} aria-label="Pilih semua surat" /></th>
                  <th>No</th><th>Judul</th><th>Jenis</th><th>Tujuan</th><th>Aksi</th>
                </tr></thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
                  {paginatedData.map((s, i) => (
                    <tr key={s.id}>
                      <td><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} aria-label={`Pilih surat ${s.judul}`} /></td>
                      <td>{(page - 1) * pageSize + i + 1}</td>
                      <td className="font-semibold">{s.judul}</td>
                      <td><span className="badge badge-izin">{s.jenis}</span></td>
                      <td>{s.tujuan}</td>
                      <td>
                        <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(s)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus?")) { const res = await apiDelete(`/api/surat/${s.id}`); if (res.ok) { show("Data surat berhasil dihapus", "success"); load(); } else { show(res.msg || "Gagal menghapus data surat", "error"); } } }}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}
          </>
        )}
      </div>

      {modalOpen && <SuratModal editData={editData} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function SuratModal({ editData, onSave, onClose }: { editData: Surat | null; onSave: () => void; onClose: () => void }) {
  const { show } = useToast();
  const [form, setForm] = useState({ judul: "", jenis: "panggilan", tujuan: "", template: "" });

  useEffect(() => {
    if (editData) {
      setForm({ judul: editData.judul, jenis: editData.jenis, tujuan: editData.tujuan || "", template: editData.template });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = editData
      ? await apiPut(`/api/surat/${editData.id}`, form)
      : await apiPost("/api/surat", form);
    if (res.ok) {
      show(editData ? "Surat berhasil diperbarui" : "Surat berhasil ditambahkan", "success");
      onClose(); onSave();
    } else {
      show(res.msg || "Gagal menyimpan surat", "error");
    }
  }

  const jenisLabel: Record<string, string> = { panggilan: "Surat Panggilan", keterangan: "Surat Keterangan", tugas: "Tugas/PR" };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Surat" : "Tambah Surat"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div><label className="label">Judul</label><input type="text" className="input" placeholder="Contoh: Surat Panggilan" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} required /></div>
            <div><label className="label">Jenis</label><select className="input" value={form.jenis} onChange={(e) => setForm({...form, jenis: e.target.value})}>
              {Object.entries(jenisLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
            <div><label className="label">Tujuan</label><input type="text" className="input" value={form.tujuan} onChange={(e) => setForm({...form, tujuan: e.target.value})} placeholder="Orang tua/wali siswa" /></div>
            <div><label className="label">Template (HTML)</label><textarea className="input" rows={6} value={form.template} onChange={(e) => setForm({...form, template: e.target.value})} placeholder="<p>Template surat dalam format HTML...</p>" required /></div>
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
