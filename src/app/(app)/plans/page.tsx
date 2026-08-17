"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";

export interface Plan {
  id: string;
  name: string;
  objective: string | null;
  target: string | null;
  period: string | null;
  strategy: string | null;
  channels: string | null;
  kpi: string | null;
  status: string;
  goalId: string | null;
}

export const PLAN_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Aktif", cls: "bg-green-50 text-green-700 border-green-200" },
  PAUSED: { label: "Paused", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  COMPLETED: { label: "Selesai", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  DRAFT: { label: "Draft", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

export default function PlansPage() {
  const [data, setData] = useState<Plan[]>([]);
  const [goals, setGoals] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const qs = params.toString();
    const res = await apiGet<Plan[]>(`/api/marketing/plans${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    const resG = await apiGet<{ id: string; name: string; status: string }[]>("/api/marketing/goals");
    if (resG.ok && resG.data) setGoals(resG.data.map((g) => ({ id: g.id, name: g.name })));
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  function openEdit(p: Plan) { setEditData(p); setModalOpen(true); }
  function openAdd() { setEditData(null); setModalOpen(true); }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Marketing Plans</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Plan</button>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select className="input w-48 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {Object.entries(PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading && <p className="text-gray-400 py-8 text-center">Memuat...</p>}
      {!loading && data.length === 0 && <p className="text-gray-400 py-8 text-center">Belum ada marketing plan. Klik &quot;Tambah Plan&quot;.</p>}

      <div className="space-y-4">
        {data.map((p) => {
          const st = PLAN_STATUS[p.status] || PLAN_STATUS.DRAFT;
          const goal = goals.find((g) => g.id === p.goalId);
          return (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                    {goal && <span className="text-xs bg-[#eefbf8] text-[#0D7C66] px-2 py-1 rounded-full">Goal: {goal.name}</span>}
                  </div>
                  {p.objective && <p className="text-sm text-gray-500 mt-1">{p.objective}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-xs text-gray-500">
                    {p.period && <span><i className="fas fa-calendar mr-1"></i>{p.period}</span>}
                    {p.target && <span><i className="fas fa-bullseye mr-1"></i>{p.target}</span>}
                    {p.channels && <span className="truncate"><i className="fas fa-share-alt mr-1"></i>{p.channels}</span>}
                    {p.kpi && <span className="truncate"><i className="fas fa-chart-line mr-1"></i>{p.kpi}</span>}
                  </div>
                  {p.strategy && <p className="text-xs text-gray-400 mt-2 line-clamp-2"><i className="fas fa-lightbulb mr-1"></i>{p.strategy}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm("Hapus plan ini?")) { await apiDelete(`/api/marketing/plans/${p.id}`); load(); } }}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && <PlanModal editData={editData} goals={goals} onSave={load} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function PlanModal({ editData, goals, onSave, onClose }: { editData: Plan | null; goals: { id: string; name: string }[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", objective: "", target: "", period: "", strategy: "",
    channels: "", kpi: "", status: "ACTIVE", goalId: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        objective: editData.objective || "",
        target: editData.target || "",
        period: editData.period || "",
        strategy: editData.strategy || "",
        channels: editData.channels || "",
        kpi: editData.kpi || "",
        status: editData.status,
        goalId: editData.goalId || "",
      });
    }
  }, [editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nama plan wajib diisi");
    const payload = { ...form, goalId: form.goalId || null };
    const ok = editData
      ? (await apiPut(`/api/marketing/plans/${editData.id}`, payload)).ok
      : (await apiPost("/api/marketing/plans", payload)).ok;
    if (ok) { onClose(); onSave(); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">{editData ? "Edit Plan" : "Tambah Plan"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Nama *</label><input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Objective</label><textarea className="input" rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></div>
            <div><label className="label">Target</label><input type="text" className="input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} /></div>
            <div><label className="label">Periode</label><input type="text" className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(PLAN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label className="label">Goal</label>
              <select className="input" value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
                <option value="">Tidak ada</option>
                {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><label className="label">Channels (pisah koma)</label><input type="text" className="input" value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} placeholder="Instagram, WhatsApp, Email" /></div>
            <div><label className="label">KPI</label><input type="text" className="input" value={form.kpi} onChange={(e) => setForm({ ...form, kpi: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Strategy</label><textarea className="input" rows={3} value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} /></div>
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