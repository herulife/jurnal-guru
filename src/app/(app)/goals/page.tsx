"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  metric: string | null;
  targetValue: number | null;
  currentValue: number | null;
  period: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

export const GOAL_STATUS: Record<string, { label: string; cls: string }> = {
  ON_TRACK: { label: "On Track", cls: "bg-green-50 text-green-700 border-green-200" },
  AT_RISK: { label: "At Risk", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  BEHIND: { label: "Behind", cls: "bg-red-50 text-red-700 border-red-200" },
  COMPLETED: { label: "Selesai", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function goalProgress(g: Goal): number {
  const target = Number(g.targetValue) || 0;
  const current = Number(g.currentValue) || 0;
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export default function GoalsPage() {
  const [data, setData] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Goal | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const qs = params.toString();
    const res = await apiGet<Goal[]>(`/api/marketing/goals${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  function openEdit(g: Goal) { setEditData(g); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Goals</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Goal</button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {Object.entries(GOAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && <p className="text-gray-400 col-span-full py-8 text-center">Memuat...</p>}
        {!loading && data.length === 0 && <p className="text-gray-400 col-span-full py-8 text-center">Belum ada goal. Klik &quot;Tambah Goal&quot;.</p>}
        {data.map((g) => {
          const st = GOAL_STATUS[g.status] || GOAL_STATUS.ON_TRACK;
          const progress = goalProgress(g);
          return (
            <div key={g.id} className="card relative overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{g.name}</h3>
                  {g.metric && <p className="text-xs text-gray-500 mt-0.5">Metrik: {g.metric}</p>}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
              </div>
              {g.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{g.description}</p>}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Number(g.currentValue) || 0} / {Number(g.targetValue) || 0} ({progress}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${progress >= 100 ? "bg-[#0D7C66]" : progress >= 60 ? "bg-[#E8A317]" : "bg-red-400"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {g.period && <p className="text-xs text-gray-400 mb-3">Periode: {g.period}</p>}
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm flex-1" onClick={() => openEdit(g)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus goal ini?")) { await apiDelete(`/api/marketing/goals/${g.id}`); load(); } }}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && <GoalModal editData={editData} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
    </AdminGuard>
  );
}

function GoalModal({ editData, onSave, onClose }: { editData: Goal | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", description: "", metric: "revenue", targetValue: "0", currentValue: "0",
    period: "", startDate: "", endDate: "", status: "ON_TRACK",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        description: editData.description || "",
        metric: editData.metric || "revenue",
        targetValue: String(editData.targetValue || 0),
        currentValue: String(editData.currentValue || 0),
        period: editData.period || "",
        startDate: editData.startDate || "",
        endDate: editData.endDate || "",
        status: editData.status,
      });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nama goal wajib diisi");
    const ok = editData
      ? (await apiPut(`/api/marketing/goals/${editData.id}`, form)).ok
      : (await apiPost("/api/marketing/goals", form)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Goal" : "Tambah Goal"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Nama *</label><input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Deskripsi</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Metrik</label>
              <select className="input" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
                <option value="revenue">Revenue</option>
                <option value="leads">Leads</option>
                <option value="customers">Customers</option>
                <option value="conversion">Conversion Rate</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(GOAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="label">Target Value</label><input type="number" className="input" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} /></div>
            <div><label className="label">Current Value</label><input type="number" className="input" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} /></div>
            <div><label className="label">Periode</label><input type="text" className="input" value={form.period} placeholder="contoh: 2026-08" onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div><label className="label">Start Date</label><input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">End Date</label><input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
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