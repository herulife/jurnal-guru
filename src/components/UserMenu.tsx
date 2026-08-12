"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiGet,
  apiPut,
  apiPost,
} from "@/lib/useApi";
import { useToast } from "@/components/Feedback";
import { normalizePlan } from "@/lib/plan-helpers";

type Me = {
  id: string;
  username: string;
  email: string | null;
  nama: string;
  role: string;
  plan: string;
  foto: string | null;
};

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          const scale = max / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas tidak didukung"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

type Props = {
  align?: "left" | "right";
  up?: boolean;
};

export default function UserMenu({ align = "right", up = false }: Props) {
  const router = useRouter();
  const { show, ToastComponent } = useToast();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // modal states
  const [modal, setModal] = useState<"edit" | "password" | "foto" | null>(null);
  const [nama, setNama] = useState("");
  const [passLama, setPassLama] = useState("");
  const [passBaru, setPassBaru] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLFormElement>(null);

  function reload() {
    apiGet<Me>("/api/me").then((r) => {
      if (r.ok && r.data) setMe(r.data);
    });
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Escape menutup dropdown dan modal; kunci scroll body saat modal terbuka
  useEffect(() => {
    if (!open && !modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModal(null);
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    if (modal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, modal]);

  // autofocus + focus trap saat modal terbuka; fokus kembali ke avatar saat tutup
  useEffect(() => {
    if (!modal) return;
    const t = setTimeout(() => {
      modalRef.current
        ?.querySelector<HTMLInputElement>(".input")
        ?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  // selalu pulihkan fokus ke avatar saat modal/dropdown tertutup
  useEffect(() => {
    if (open || modal) return;
    if (avatarBtnRef.current && document.activeElement === document.body) {
      avatarBtnRef.current.focus();
    }
  }, [open, modal]);

  function openModal(kind: "edit" | "password" | "foto") {
    setNama(me?.nama || "");
    setPassLama("");
    setPassBaru("");
    setFotoPreview(me?.foto || null);
    setOpen(false);
    setModal(kind);
  }

  async function saveProfile() {
    if (!nama.trim()) {
      show("Nama lengkap wajib diisi", "error");
      return;
    }
    setSaving(true);
    const r = await apiPut("/api/me", { nama: nama.trim() });
    setSaving(false);
    if (r.ok) {
      show("Profil diperbarui");
      setModal(null);
      reload();
    } else {
      show(r.msg || "Gagal memperbarui profil", "error");
    }
  }

  async function savePassword() {
    if (!passLama || !passBaru) {
      show("Isi password lama dan baru", "error");
      return;
    }
    if (passBaru.length < 8) {
      show("Password baru minimal 8 karakter", "error");
      return;
    }
    setSaving(true);
    const r = await apiPost("/api/me/password", {
      passwordLama: passLama,
      passwordBaru: passBaru,
    });
    setSaving(false);
    if (r.ok) {
      show("Password berhasil diubah");
      setModal(null);
    } else {
      show(r.msg || "Gagal mengubah password", "error");
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/") === false) {
      show("File harus berupa gambar", "error");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setFotoPreview(dataUrl);
    } catch {
      show("Gagal membaca gambar", "error");
    }
  }

  async function saveFoto() {
    if (!fotoPreview) return;
    setSaving(true);
    const r = await apiPut("/api/me", { foto: fotoPreview });
    setSaving(false);
    if (r.ok) {
      show("Foto profil diperbarui");
      setModal(null);
      reload();
    } else {
      show(r.msg || "Gagal menyimpan foto", "error");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modal === "edit") saveProfile();
    else if (modal === "password") savePassword();
    else if (modal === "foto") saveFoto();
  }

  const initial = me?.nama?.trim().charAt(0).toUpperCase() || "?";
  const fotoSrc = me?.foto || null;
  const myPlan = normalizePlan(me?.plan);
  const myIsAdmin = (me?.role || "").toLowerCase() === "admin";

  return (
    <>
      <div className="relative flex items-center gap-2" ref={boxRef}>
        <button
          ref={avatarBtnRef}
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-[#E8E4DC] bg-white cursor-pointer transition-transform hover:scale-105 active:scale-95 hover:shadow-md"
          title="Akun saya"
          aria-label="Menu akun"
          aria-haspopup="true"
          aria-expanded={open}
        >
          {fotoSrc ? (
            <img src={fotoSrc} alt={me?.nama || "Profil"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#0D7C66]">{initial}</span>
          )}
        </button>

        {me && !myIsAdmin && myPlan === "gratis" && (
          <Link
            href="/checkout?plan=pro"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#E8A317] bg-[#E8A317]/10 border border-[#E8A317]/30 rounded-full px-2 py-0.5 hover:bg-[#E8A317] hover:text-[#1A2332] transition-colors whitespace-nowrap"
            title="Anda menggunakan paket gratis. Upgrade untuk fitur lengkap."
          >
            <i className="fas fa-gift text-[9px]"></i> Gratis
          </Link>
        )}

        {open && (
          <div
            className={`absolute w-64 bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] z-50 overflow-hidden user-menu-dropdown ${
              align === "left" ? "left-0" : "right-0"
            } ${up ? "bottom-full mb-2" : "top-12"}`}
          >
            <div className="p-4 bg-[#1A2332] text-white flex items-center gap-3">
              {fotoSrc ? (
                <img src={fotoSrc} alt={me?.nama || "Profil"} className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#0D7C66] flex items-center justify-center font-bold text-lg">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{me?.nama || "Pengguna"}</p>
                <p className="text-gray-400 text-xs truncate">{me?.email || me?.username || ""}</p>
              </div>
            </div>
            <PlanBadge plan={me?.plan || "gratis"} role={me?.role || ""} />
            {normalizePlan(me?.plan) === "gratis" && me?.role?.toLowerCase() !== "admin" && (
              <UpgradeCard />
            )}
            <div className="py-1.5">
              <button
                onClick={() => openModal("edit")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-left"
               
              >
                <i className="fas fa-user-edit w-4 text-center text-gray-400"></i>
                Edit Profil
              </button>
              <button
                onClick={() => openModal("password")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-left"
               
              >
                <i className="fas fa-key w-4 text-center text-gray-400"></i>
                Reset Password
              </button>
              <button
                onClick={() => openModal("foto")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-left"
               
              >
                <i className="fas fa-camera w-4 text-center text-gray-400"></i>
                Ubah Foto Profil
              </button>
              <div className="my-1.5 border-t border-[#E8E4DC]"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left"
               
              >
                <i className="fas fa-sign-out-alt w-4 text-center"></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && createPortal(
        <div className="modal-overlay" onClick={() => setModal(null)} role="dialog" aria-modal="true" aria-labelledby="usermenu-modal-title">
          <form ref={modalRef} className="modal-content max-w-md fade-in" onClick={(e) => e.stopPropagation()} onSubmit={handleModalSubmit}>
            <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between">
              <h3 id="usermenu-modal-title" className="font-bold text-gray-800 font-[Outfit]">
                {modal === "edit" && "Edit Profil"}
                {modal === "password" && "Reset Password"}
                {modal === "foto" && "Ubah Foto Profil"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"
                aria-label="Tutup"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modal === "edit" && (
                <>
                  <div>
                    <label className="label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="input"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Email dan role tidak dapat diubah di sini.
                  </p>
                </>
              )}

              {modal === "password" && (
                <>
                  <div>
                    <label className="label">Password Lama</label>
                    <input
                      type="password"
                      className="input"
                      value={passLama}
                      onChange={(e) => setPassLama(e.target.value)}
                      placeholder="Password saat ini"
                    />
                  </div>
                  <div>
                    <label className="label">Password Baru</label>
                    <input
                      type="password"
                      className="input"
                      value={passBaru}
                      onChange={(e) => setPassBaru(e.target.value)}
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                </>
              )}

              {modal === "foto" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#E8E4DC] bg-gray-100 flex items-center justify-center">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Pratinjau foto" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-user text-4xl text-gray-300"></i>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
                      <i className="fas fa-upload"></i> Pilih Foto
                    </button>
                    {me?.foto && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={async () => {
                          setFotoPreview(null);
                          const r = await apiPut("/api/me", { foto: null });
                          if (r.ok) {
                            show("Foto profil dihapus");
                            setModal(null);
                            reload();
                          } else {
                            show(r.msg || "Gagal menghapus foto", "error");
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i> Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center">Format JPG/PNG, otomatis diperkecil.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8E4DC] flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setModal(null)} disabled={saving}>
                Batal
              </button>
              {modal === "edit" && (
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              )}
              {modal === "password" && (
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Menyimpan..." : "Ubah Password"}
                </button>
              )}
              {modal === "foto" && (
                <button type="submit" className="btn btn-primary" disabled={saving || !fotoPreview}>
                  {saving ? "Menyimpan..." : "Simpan Foto"}
                </button>
              )}
            </div>
          </form>
        </div>,
        document.body
      )}

      {ToastComponent}
    </>
  );
}

const PLAN_BADGE: Record<string, { label: string; cls: string; icon: string }> = {
  gratis: { label: "Paket Gratis", cls: "bg-gray-100 text-gray-600", icon: "fa-gift" },
  pro: { label: "Paket Pro", cls: "bg-[#E8A317]/15 text-[#E8A317]", icon: "fa-crown" },
  premium: { label: "Paket Premium", cls: "bg-purple-100 text-purple-700", icon: "fa-gem" },
};

function PlanBadge({ plan, role }: { plan: string; role: string }) {
  if (role.toLowerCase() === "admin") {
    return (
      <div className="px-4 pb-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-purple-100 text-purple-700 rounded-full px-2.5 py-1">
          <i className="fas fa-shield-halved text-[10px]"></i> Admin
        </span>
      </div>
    );
  }
  const meta = PLAN_BADGE[normalizePlan(plan)] || PLAN_BADGE.gratis;
  return (
    <div className="px-4 pb-1.5">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1 ${meta.cls}`}>
        <i className={`fas ${meta.icon} text-[10px]`}></i> {meta.label}
      </span>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="px-3 pb-2">
      <Link
        href="/checkout?plan=pro"
        className="block bg-gradient-to-br from-[#E8A317] to-[#ca8a04] rounded-xl p-3 text-[#1A2332] hover:brightness-105 transition-all group"
      >
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-crown text-sm"></i>
          <p className="font-bold text-sm leading-tight">Upgrade ke Pro</p>
        </div>
        <p className="text-[11px] opacity-80 leading-snug mb-2">
          Buka nilai, rekap nilai & kelompok belajar tanpa batas.
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#1A2332] text-[#E8A317] rounded-full px-3 py-1 group-hover:gap-1.5 transition-all">
          Mulai Rp 29rb/bln <i className="fas fa-arrow-right text-[9px]"></i>
        </span>
      </Link>
      <Link
        href="/subscription"
        className="block text-center text-[11px] text-gray-400 hover:text-[#0D7C66] mt-2 transition-colors"
      >
        Lihat semua paket
      </Link>
    </div>
  );
}