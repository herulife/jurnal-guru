"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";
import Pagination from "@/components/Pagination";

export interface Journal {
  id: string;
  date: string;
  target: string | null;
  activities: string | null;
  result: string | null;
  problems: string | null;
  learning: string | null;
  nextAction: string | null;
}

export default function MarketingJournalPage() {
  const [data, setData] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Journal | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    const qs = params.toString();
    const res = await apiGet<Journal[]>(`/api/marketing/journal${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [filterDate]);

  useEffect(() => { load(); }, [load]);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  function openEdit(j: Journal) { setEditData(j); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Marketing Journal</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Entry</button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input type="date" className="input w-44 text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      {loading && <p className="text-gray-400 py-8 text-center">Memuat...</p>}
      {!loading && data.length === 0 && <p className="text-gray-400 py-8 text-center">Belum ada entry. Klik &quot;Tambah Entry&quot;.</p>}

      <div className="space-y-4">
        {paginatedData.map((j) => (
          <div key={j.id} className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#E8A317]">
                  <i className="fas fa-book-open text-lg"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{j.date}</p>
                  {j.target && <p className="text-sm text-gray-500">Target: {j.target}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(j)}><i className="fas fa-edit"></i></button>
                <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus entry ini?")) { await apiDelete(`/api/marketing/journal/${j.id}`); load(); } }}><i className="fas fa-trash"></i></button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              {j.activities && <div><p className="text-xs font-semibold text-gray-400 uppercase">Aktivitas</p><p className="text-gray-700 mt-0.5 whitespace-pre-line">{j.activities}</p></div>}
              {j.result && <div><p className="text-xs font-semibold text-gray-400 uppercase">Hasil</p><p className="text-gray-700 mt-0.5 whitespace-pre-line">{j.result}</p></div>}
              {j.problems && <div><p className="text-xs font-semibold text-gray-400 uppercase">Kendala</p><p className="text-red-600 mt-0.5 whitespace-pre-line">{j.problems}</p></div>}
              {j.learning && <div><p className="text-xs font-semibold text-gray-400 uppercase">Pembelajaran</p><p className="text-gray-700 mt-0.5 whitespace-pre-line">{j.learning}</p></div>}
            </div>
            {j.nextAction && (
              <div className="mt-4 p-3 bg-[#eefbf8] rounded-xl flex items-center gap-2">
                <i className="fas fa-arrow-right text-[#0D7C66]"></i>
                <span className="text-sm text-[#0D7C66] font-medium">Next: {j.nextAction}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <JournalModal editData={editData} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
    </AdminGuard>
  );
}

function JournalModal({ editData, onSave, onClose }: { editData: Journal | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), target: "", activities: "",
    result: "", problems: "", learning: "", nextAction: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date,
        target: editData.target || "",
        activities: editData.activities || "",
        result: editData.result || "",
        problems: editData.problems || "",
        learning: editData.learning || "",
        nextAction: editData.nextAction || "",
      });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) return alert("Tanggal wajib diisi");
    const ok = editData
      ? (await apiPut(`/api/marketing/journal/${editData.id}`, form)).ok
      : (await apiPost("/api/marketing/journal", form)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Entry" : "Tambah Entry"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Tanggal *</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="label">Target</label><input type="text" className="input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Aktivitas</label><textarea className="input" rows={3} value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Hasil</label><textarea className="input" rows={2} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Kendala</label><textarea className="input" rows={2} value={form.problems} onChange={(e) => setForm({ ...form, problems: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Pembelajaran</label><textarea className="input" rows={2} value={form.learning} onChange={(e) => setForm({ ...form, learning: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Next Action</label><textarea className="input" rows={2} value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></div>
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