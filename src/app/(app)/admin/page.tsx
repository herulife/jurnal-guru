"use client";

import { useEffect, useState, useCallback } from "react";
import AdminGuard from "@/components/AdminGuard";
import HeaderActions from "@/components/HeaderActions";
import { apiGet, apiPatch, apiPost, apiPut, apiDelete } from "@/lib/useApi";

interface Stats {
  totalUsers: number;
  pro: number;
  premium: number;
  gratis: number;
  admins: number;
  pendingCount: number;
  totalRevenue: number;
  activeSubs: number;
  newUsersToday: number;
  recentLogs: { id: string; timestamp: string; action: string; description: string; userId: string }[];
}

interface Payment {
  id: string;
  username: string;
  plan: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName: string;
  notes: string;
  createdAt: string;
  verifiedAt: string;
}

interface UserRow {
  id: string;
  username: string;
  namaLengkap: string;
  role: string;
  plan: string;
  createdAt: string;
}

interface LogEntry { id: string; timestamp: string; action: string; description: string; userId: string; }

type Tab = "overview" | "pembayaran" | "user" | "log";

const PLAN_LABEL: Record<string, string> = {
  pro_6m: "Pro 6 bulan", premium_6m: "Premium 6 bulan",
  pro_1m: "Pro 1 bulan", pro_3m: "Pro 3 bulan",
  pro_12m: "Pro 1 tahun", pro_24m: "Pro 2 tahun", premium: "Premium 6 bulan",
  pro: "Pro", sekolah: "Premium 6 bulan",
};

function planLabel(p: string | null | undefined): string {
  if (!p) return "Paket";
  return PLAN_LABEL[p] || `Paket ${p}`;
}

function fmtRp(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID");
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [userModal, setUserModal] = useState<{ open: boolean; edit: UserRow | null }>({ open: false, edit: null });
  const [form, setForm] = useState({ username: "", password: "", namaLengkap: "", role: "guru" });
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, p, u, l] = await Promise.all([
      apiGet<Stats>("/api/admin/stats"),
      apiGet<any>("/api/payments?admin=1"),
      apiGet<UserRow[]>("/api/users"),
      apiGet<LogEntry[]>("/api/log"),
    ]);
    if (s.ok && s.data) setStats(s.data);
    if (p.ok && p.data?.payments) setPayments(p.data.payments);
    if (u.ok && u.data) setUsers(u.data);
    if (l.ok && l.data) setLogs(l.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 3500);
  }

  async function verifyPayment(id: string, act: "verifikasi" | "tolak") {
    const r = await apiPatch<any>(`/api/payments/${id}`, { status: act });
    flash(r.ok, r.msg || (act === "verifikasi" ? "Pembayaran diverifikasi" : "Pembayaran ditolak"));
    loadAll();
  }

  const pending = payments.filter((p) => p.status === "pending");
  const paid = payments.filter((p) => p.status === "paid");

  async function submitUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const isEdit = !!userModal.edit;
    const res = isEdit
      ? await apiPut(`/api/users/${userModal.edit!.id}`, { namaLengkap: form.namaLengkap, role: form.role, password: form.password || undefined })
      : await apiPost("/api/users", form);
    setSaving(false);
    if (res.ok) {
      setUserModal({ open: false, edit: null });
      setForm({ username: "", password: "", namaLengkap: "", role: "guru" });
      flash(true, isEdit ? "User diperbarui" : "User ditambahkan");
      loadAll();
    } else {
      flash(false, res.msg || "Gagal menyimpan");
    }
  }

  async function deleteUser(u: UserRow) {
    if (!confirm(`Hapus user "${u.username}"?`)) return;
    const res = await apiDelete(`/api/users/${u.id}`);
    flash(res.ok, res.msg || "Gagal menghapus");
    loadAll();
  }

  function openAdd() {
    setForm({ username: "", password: "", namaLengkap: "", role: "guru" });
    setUserModal({ open: true, edit: null });
  }
  function openEdit(u: UserRow) {
    setForm({ username: u.username, password: "", namaLengkap: u.namaLengkap, role: u.role === "admin" ? "admin" : "guru" });
    setUserModal({ open: true, edit: u });
  }

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "fa-gauge-high" },
    { id: "pembayaran", label: "Pembayaran", icon: "fa-credit-card", count: pending.length },
    { id: "user", label: "User", icon: "fa-users", count: users.length },
    { id: "log", label: "Log Aktivitas", icon: "fa-history" },
  ];

  return (
    <AdminGuard>
      <div className="p-6 fade-in">
        <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Dashboard Admin</h1>
            <p className="text-xs text-gray-500">Pusat kendali pengguna, pembayaran &amp; aktivitas</p>
          </div>
          <div className="flex items-center gap-2"><HeaderActions /></div>
        </header>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        <div className="flex gap-1 mb-6 overflow-x-auto bg-white rounded-2xl border border-[#E8E4DC] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${tab === t.id ? "bg-[#0D7C66] text-white shadow-sm" : "text-gray-500 hover:bg-[#fcfbf8]"}`}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.id ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Memuat...</div>
        ) : (
          <>
            {tab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <StatCard icon="fa-users" label="Total User" value={stats.totalUsers.toLocaleString("id-ID")} color="text-[#0D7C66] bg-emerald-50" />
                  <StatCard icon="fa-user-plus" label="User Baru Hari Ini" value={stats.newUsersToday.toLocaleString("id-ID")} color="text-blue-600 bg-blue-50" />
                  <StatCard icon="fa-crown" label="Premium" value={stats.premium.toLocaleString("id-ID")} color="text-purple-600 bg-purple-50" />
                  <StatCard icon="fa-rocket" label="Pro" value={stats.pro.toLocaleString("id-ID")} color="text-amber-600 bg-amber-50" />
                  <StatCard icon="fa-hourglass-half" label="Pending Verifikasi" value={stats.pendingCount.toLocaleString("id-ID")} color="text-orange-600 bg-orange-50" />
                  <StatCard icon="fa-sack-dollar" label="Pendapatan" value={fmtRp(stats.totalRevenue)} color="text-green-600 bg-green-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800"><i className="fas fa-hourglass-half text-orange-500 mr-2"></i>Menunggu Verifikasi</h3>
                      <button onClick={() => setTab("pembayaran")} className="text-xs text-[#0D7C66] font-semibold hover:underline">Kelola <i className="fas fa-arrow-right ml-1"></i></button>
                    </div>
                    {pending.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">Tidak ada pembayaran tertunda.</p>
                    ) : (
                      <div className="space-y-3">
                        {pending.slice(0, 5).map((p) => (
                          <div key={p.id} className="flex items-center justify-between gap-2 border border-[#F0EDE6] rounded-xl p-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate">{p.username}</p>
                              <p className="text-xs text-gray-500">{planLabel(p.plan)} &middot; {fmtDate(p.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-bold text-[#0D7C66]">{fmtRp(p.amount)}</span>
                              <button onClick={() => verifyPayment(p.id, "verifikasi")} className="w-7 h-7 flex items-center justify-center bg-green-600 text-white rounded-lg text-xs hover:bg-green-700" title="Verifikasi"><i className="fas fa-check"></i></button>
                              <button onClick={() => verifyPayment(p.id, "tolak")} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100" title="Tolak"><i className="fas fa-times"></i></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
                    <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-arrows-rotate text-[#0D7C66] mr-2"></i>Aktivitas Terbaru</h3>
                    {stats.recentLogs.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">Belum ada aktivitas.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentLogs.slice(0, 6).map((l) => (
                          <div key={l.id} className="flex items-start gap-3">
                            <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-[#fcfbf8] border border-[#E8E4DC] text-xs text-gray-400"><i className="fas fa-circle-dot"></i></div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-700 truncate">{l.description || l.action}</p>
                              <p className="text-[11px] text-gray-400">{new Date(l.timestamp).toLocaleString("id-ID")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MiniStat label="Langganan Aktif" value={stats.activeSubs.toLocaleString("id-ID")} />
                  <MiniStat label="User Gratis" value={stats.gratis.toLocaleString("id-ID")} />
                  <MiniStat label="Admin" value={stats.admins.toLocaleString("id-ID")} />
                  <MiniStat label="Pembayaran Lunas" value={paid.length.toLocaleString("id-ID")} />
                </div>
              </div>
            )}

            {tab === "pembayaran" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
                  <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-hourglass-half text-orange-500 mr-2"></i>Menunggu Verifikasi ({pending.length})</h3>
                  {pending.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-[#E8E4DC] rounded-xl">Semua pembayaran sudah diproses. Tidak ada yang menunggu.</p>
                  ) : (
                    <div className="space-y-3">
                      {pending.map((p) => (
                        <div key={p.id} className="border border-[#F0EDE6] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800">{p.username}</p>
                            <p className="text-xs text-gray-500">{planLabel(p.plan)} &middot; {p.bankName || "-"} &middot; {new Date(p.createdAt).toLocaleString("id-ID")}</p>
                            {p.notes && <p className="text-xs text-gray-500 mt-1">Catatan: {p.notes}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-extrabold text-[#0D7C66]">{fmtRp(p.amount)}</span>
                            <button onClick={() => verifyPayment(p.id, "verifikasi")} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all">
                              <i className="fas fa-check mr-1"></i> Terima &amp; Aktifkan
                            </button>
                            <button onClick={() => verifyPayment(p.id, "tolak")} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold border border-red-200 transition-colors">
                              <i className="fas fa-times mr-1"></i> Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                  <div className="p-5 flex items-center justify-between border-b border-[#F0EDE6]">
                    <h3 className="font-bold text-gray-800"><i className="fas fa-history text-gray-400 mr-2"></i>Riwayat Pembayaran</h3>
                    <button onClick={() => setShowAll(!showAll)} className="text-xs text-[#0D7C66] font-semibold hover:underline">
                      {showAll ? "Tampilkan lebih sedikit" : `Tampilkan semua (${payments.length})`}
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Pengguna</th><th>Paket</th><th>Jumlah</th><th>Status</th><th>Tanggal</th></tr></thead>
                      <tbody>
                        {payments.filter((p) => p.status !== "pending").slice(0, showAll ? undefined : 20).map((p) => (
                          <tr key={p.id}>
                            <td className="font-medium">{p.username}</td>
                            <td>{planLabel(p.plan)}</td>
                            <td className="font-semibold">{fmtRp(p.amount)}</td>
                            <td>
                              <span className={`badge ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.status}</span>
                            </td>
                            <td>{fmtDate(p.createdAt)}</td>
                          </tr>
                        ))}
                        {payments.filter((p) => p.status !== "pending").length === 0 && (
                          <tr><td colSpan={5} className="text-center text-gray-400 py-8">Belum ada riwayat pembayaran.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === "user" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500"><b>{users.length}</b> user terdaftar</p>
                  <button className="btn btn-primary" onClick={openAdd}><i className="fas fa-plus"></i> Tambah User</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Username</th><th>Nama Lengkap</th><th>Role</th><th>Paket</th><th>Dibuat</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="font-medium">{u.username}</td>
                          <td>{u.namaLengkap}</td>
                          <td><span className={`badge ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>{u.role}</span></td>
                          <td>
                            <span className={`badge ${u.plan === "pro" ? "bg-amber-100 text-amber-700" : u.plan === "premium" || u.plan === "sekolah" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                              {u.plan === "sekolah" ? "premium" : u.plan}
                            </span>
                          </td>
                          <td>{fmtDate(u.createdAt)}</td>
                          <td>
                            <div className="flex gap-1">
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)} title="Edit"><i className="fas fa-edit"></i></button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)} title="Hapus"><i className="fas fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "log" && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>No</th><th>Waktu</th><th>User</th><th>Aksi</th><th>Deskripsi</th></tr></thead>
                  <tbody>
                    {logs.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">Belum ada aktivitas</td></tr>}
                    {logs.map((l, i) => (
                      <tr key={l.id}>
                        <td>{i + 1}</td>
                        <td className="text-xs">{new Date(l.timestamp).toLocaleString("id-ID")}</td>
                        <td className="text-xs text-gray-500">{l.userId?.substring(0, 8)}...</td>
                        <td><span className="badge badge-hadir">{l.action}</span></td>
                        <td className="text-sm">{l.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {userModal.open && (
          <div className="modal-overlay" onClick={() => setUserModal({ open: false, edit: null })}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between">
                <h3 className="font-bold text-gray-800 font-[Outfit]">{userModal.edit ? "Edit User" : "Tambah User Baru"}</h3>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setUserModal({ open: false, edit: null })}><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={submitUser} className="p-5 space-y-4">
                <div>
                  <label className="label">Username</label>
                  <input type="text" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!userModal.edit} required minLength={4} placeholder="Username / email" />
                </div>
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input type="text" className="input" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })} required placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="label">Password {userModal.edit && "(kosongkan jika tidak diubah)"}</label>
                  <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!userModal.edit} minLength={8} placeholder="Minimal 8 karakter" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn btn-primary flex-1" disabled={saving}>{saving ? "Menyimpan..." : userModal.edit ? "Simpan" : "Tambah"}</button>
                  <button type="button" className="btn btn-outline" onClick={() => setUserModal({ open: false, edit: null })}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}><i className={`fas ${icon}`}></i></div>
      <p className="text-xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 text-center">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}