"use client";

import { useEffect, useState } from "react";
import HeaderActions from "@/components/HeaderActions";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import { deriveRoleLabel, ROLE_LABEL, ROLE_BADGE } from "@/lib/plan-helpers";
import Modal from "@/components/Modal";
import { useConfirm } from "@/components/ConfirmModal";

interface User {
  id: string;
  username: string;
  namaLengkap: string;
  role: string;
  plan: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", namaLengkap: "", role: "free" });
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await apiGet<User[]>("/api/users");
    if (res.ok && res.data) setUsers(res.data);
    setLoading(false);
  }

  function openAdd() {
    setEditUser(null);
    setForm({ username: "", password: "", namaLengkap: "", role: "free" });
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ username: u.username, password: "", namaLengkap: u.namaLengkap, role: deriveRoleLabel(u.role, u.plan) });
    setModalOpen(true);
  }

  const [toast, setToast] = useState<{msg: string; type: "success"|"error"} | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editUser) {
      const body: Record<string, unknown> = { namaLengkap: form.namaLengkap, role: form.role };
      if (form.password) body.password = form.password;
      const res = await apiPut(`/api/users/${editUser.id}`, body);
      if (res.ok) {
        setModalOpen(false);
        loadUsers();
        setToast({ msg: "User berhasil diperbarui", type: "success" });
      } else {
        setToast({ msg: res.msg || "Gagal menyimpan", type: "error" });
      }
    } else {
      const res = await apiPost("/api/users", form);
      if (res.ok) {
        setModalOpen(false);
        loadUsers();
        setToast({ msg: "User berhasil ditambahkan", type: "success" });
      } else {
        setToast({ msg: res.msg || "Gagal menambah user", type: "error" });
      }
    }
    setSaving(false);
  }

  async function handleDelete(u: User) {
    if (!(await confirm({ message: `Hapus user "${u.username}"?` }))) return;
    const res = await apiDelete(`/api/users/${u.id}`);
    if (res.ok) {
      loadUsers();
      setToast({ msg: "User berhasil dihapus", type: "success" });
    } else {
      setToast({ msg: res.msg || "Gagal menghapus", type: "error" });
    }
  }

  return (
    <div className="p-6 fade-in">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600" aria-label="Tutup">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      )}
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Kelola User</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fas fa-plus"></i> Tambah User
          </button>
          <a href="/panduan#akun-pengaturan" className="doc-link" aria-label="Buka panduan"><i className="fas fa-circle-question"></i></a>
<HeaderActions />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-10">
          <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Belum ada user</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Role</th>
                <th>Paket</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.username}</td>
                  <td>{u.namaLengkap}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[deriveRoleLabel(u.role, u.plan)]}`}>
                      {ROLE_LABEL[deriveRoleLabel(u.role, u.plan)]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.plan === "pro" ? "bg-amber-100 text-amber-700" : u.plan === "premium" || u.plan === "sekolah" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                      {u.plan === "sekolah" ? "premium" : u.plan}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)} aria-label={`Edit user ${u.username}`}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)} aria-label={`Hapus user ${u.username}`}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal open maxWidth="max-w-md" onClose={() => setModalOpen(false)} title={editUser ? "Edit User" : "Tambah User Baru"}>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editUser}
                  required
                  minLength={4}
                  placeholder="Contoh: guru01"
                />
              </div>
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  type="text"
                  className="input"
                  value={form.namaLengkap}
                  onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  required
                  placeholder="Nama lengkap guru"
                />
              </div>
              <div>
                <label className="label">Password {editUser && "(kosongkan jika tidak diubah)"}</label>
                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editUser}
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? "Menyimpan..." : editUser ? "Simpan" : "Tambah"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
              </div>
            </form>
        </Modal>
      )}
      {ConfirmComponent}
    </div>
  );
}
