"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";
import Pagination from "@/components/Pagination";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  startDate: string | null;
  goalId: string | null;
  planId: string | null;
  campaignId: string | null;
  leadId: string | null;
  assignedTo: string | null;
  recurring: string | null;
  notes: string | null;
}

export const TASK_STATUS: Record<string, { label: string; cls: string }> = {
  TODO: { label: "To Do", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  DONE: { label: "Selesai", cls: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Batal", cls: "bg-red-50 text-red-700 border-red-200" },
};

export const TASK_PRIORITY: Record<string, { label: string; cls: string }> = {
  LOW: { label: "Low", cls: "bg-gray-100 text-gray-600" },
  MEDIUM: { label: "Medium", cls: "bg-blue-50 text-blue-700" },
  HIGH: { label: "High", cls: "bg-amber-50 text-amber-700" },
  URGENT: { label: "Urgent", cls: "bg-red-50 text-red-700" },
};

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterPriority) params.set("priority", filterPriority);
    const qs = params.toString();
    const res = await apiGet<Task[]>(`/api/marketing/tasks${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [filterStatus, filterPriority]);

  useEffect(() => { load(); }, [load]);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  function openEdit(t: Task) { setEditData(t); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Tasks</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Task</button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-44 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input w-40 text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">Semua Prioritas</option>
          {Object.entries(TASK_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>No</th><th>Judul</th><th>Status</th><th>Prioritas</th><th>Due Date</th><th>Mulai</th><th>Ditugaskan ke</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center text-gray-400 py-8">Memuat...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={8} className="text-center text-gray-400 py-8">Belum ada task</td></tr>}
            {paginatedData.map((t, i) => {
              const st = TASK_STATUS[t.status] || TASK_STATUS.TODO;
              const pr = TASK_PRIORITY[t.priority] || TASK_PRIORITY.MEDIUM;
              const isLate = t.dueDate && t.status !== "DONE" && t.status !== "CANCELLED" && t.dueDate < new Date().toISOString().slice(0, 10);
              return (
                <tr key={t.id} className={isLate ? "bg-red-50/50" : ""}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="font-semibold">{t.title}{isLate && <span className="ml-2 text-xs text-red-500"><i className="fas fa-exclamation-circle"></i> terlambat</span>}</td>
                  <td><span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span></td>
                  <td><span className={`text-xs font-semibold px-2 py-1 rounded ${pr.cls}`}>{pr.label}</span></td>
                  <td>{t.dueDate || "-"}</td>
                  <td>{t.startDate || "-"}</td>
                  <td>{t.assignedTo || "-"}</td>
                  <td>
                    <button className="btn btn-outline btn-sm mr-1" onClick={() => openEdit(t)}><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus task ini?")) { await apiDelete(`/api/marketing/tasks/${t.id}`); load(); } }}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > 0 && <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />}

      {modalOpen && <TaskModal editData={editData} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
    </AdminGuard>
  );
}

function TaskModal({ editData, onSave, onClose }: { editData: Task | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", status: "TODO", priority: "MEDIUM",
    dueDate: "", startDate: "", goalId: "", assignedTo: "", recurring: "", notes: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        description: editData.description || "",
        status: editData.status,
        priority: editData.priority,
        dueDate: editData.dueDate || "",
        startDate: editData.startDate || "",
        goalId: editData.goalId || "",
        assignedTo: editData.assignedTo || "",
        recurring: editData.recurring || "",
        notes: editData.notes || "",
      });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Judul task wajib diisi");
    const payload = { ...form, goalId: form.goalId || null };
    const ok = editData
      ? (await apiPut(`/api/marketing/tasks/${editData.id}`, payload)).ok
      : (await apiPost("/api/marketing/tasks", payload)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Task" : "Tambah Task"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Judul *</label><input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Deskripsi</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="label">Prioritas</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {Object.entries(TASK_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label className="label">Start Date</label><input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">Ditugaskan ke</label><input type="text" className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
            <div><label className="label">Recurring</label><input type="text" className="input" value={form.recurring} placeholder="contoh: harian, mingguan" onChange={(e) => setForm({ ...form, recurring: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Catatan</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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