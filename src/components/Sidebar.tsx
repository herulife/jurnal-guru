"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizePlan, canUsePro, canUsePremium } from "@/lib/useUserPlan";
import { isAdminRole, deriveRoleLabel, ROLE_LABEL } from "@/lib/plan-helpers";
import UserMenu from "@/components/UserMenu";
import type { Plan } from "@/lib/useUserPlan";

type MenuItem = {
  label: string;
  icon: string;
  href: string;
  adminOnly?: boolean;
  minPlan?: "pro" | "premium";
};

const menuItems: { section: string; color: string; items: MenuItem[] }[] = [
  {
    section: "Menu Utama",
    color: "#38BDF8",
    items: [
      { label: "Dashboard", icon: "fa-th-large", href: "/dashboard" },
      { label: "Data Siswa", icon: "fa-user-graduate", href: "/siswa" },
      { label: "Data Kelas", icon: "fa-chalkboard", href: "/kelas" },
      { label: "Jadwal Mengajar", icon: "fa-calendar-alt", href: "/jadwal" },
    ],
  },
  {
    section: "Marketing",
    color: "#EC4899",
    items: [
      { label: "Marketing Dashboard", icon: "fa-chart-line", href: "/marketing-dashboard", adminOnly: true },
      { label: "Goals", icon: "fa-bullseye", href: "/goals", adminOnly: true },
      { label: "Marketing Plans", icon: "fa-route", href: "/plans", adminOnly: true },
      { label: "Tasks", icon: "fa-list-check", href: "/tasks", adminOnly: true },
      { label: "Calendar", icon: "fa-calendar-week", href: "/calendar", adminOnly: true },
      { label: "Marketing Calendar", icon: "fa-calendar-days", href: "/marketing-calendar", adminOnly: true },
      { label: "Marketing Journal", icon: "fa-book", href: "/marketing-journal", adminOnly: true },
    ],
  },
  {
    section: "Presensi & Jurnal",
    color: "#4ADE80",
    items: [
      { label: "Absensi", icon: "fa-clipboard-check", href: "/absensi" },
      { label: "Rekap Absensi", icon: "fa-chart-pie", href: "/rekap-absensi" },
      { label: "Cetak Presensi", icon: "fa-print", href: "/rekap-absensi?cetak=1" },
      { label: "Jurnal Mengajar", icon: "fa-book-open", href: "/jurnal" },
    ],
  },
  {
    section: "Akademik",
    color: "#60A5FA",
    items: [
      { label: "Nilai", icon: "fa-chart-bar", href: "/nilai", minPlan: "pro" },
      { label: "Rekap Nilai", icon: "fa-table-list", href: "/rekap-nilai", minPlan: "pro" },
      { label: "Kelompok Belajar", icon: "fa-layer-group", href: "/kelompok", minPlan: "pro" },
    ],
  },
  {
    section: "Laporan Pegawai",
    color: "#C084FC",
    items: [
      { label: "LCKH", icon: "fa-clipboard-list", href: "/lckh", minPlan: "premium" },
      { label: "LKB", icon: "fa-file-alt", href: "/lkb", minPlan: "premium" },
    ],
  },
  {
    section: "Sistem",
    color: "#94A3B8",
    items: [
      { label: "Profil Sekolah", icon: "fa-school", href: "/profil" },
      { label: "Pengaturan", icon: "fa-cog", href: "/settings" },
      { label: "Kalender", icon: "fa-calendar", href: "/kalender" },
      { label: "Langganan", icon: "fa-crown", href: "/subscription" },
      { label: "FAQ", icon: "fa-circle-question", href: "/faq" },
    ],
  },
  {
    section: "Dokumen",
    color: "#FBBF24",
    items: [
      { label: "Template Surat", icon: "fa-envelope", href: "/surat" },
      { label: "Panduan", icon: "fa-book", href: "/panduan" },
    ],
  },
  {
    section: "Panel Admin",
    color: "#F87171",
    items: [
      { label: "Dashboard Admin", icon: "fa-gauge-high", href: "/admin", adminOnly: true },
      { label: "Kelola User", icon: "fa-users-cog", href: "/users", adminOnly: true },
      { label: "Tagihan", icon: "fa-credit-card", href: "/billing", adminOnly: true },
{ label: "Activity Log", icon: "fa-history", href: "/log", adminOnly: true },
      { label: "Panduan Marketing", icon: "fa-bullhorn", href: "/marketing-plan", adminOnly: true },
      { label: "Application Audit", icon: "fa-file-shield", href: "/documentation", adminOnly: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ nama: string; role: string }>({
    nama: "Admin",
    role: "Admin",
  });
  const [plan, setPlan] = useState<Plan>("gratis");
  const isAdmin = isAdminRole(user.role);
  const roleLabel = ROLE_LABEL[deriveRoleLabel(user.role, plan)];

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((r) => {
        if (r.ok && r.data?.user) {
          setUser({ nama: r.data.user.nama, role: r.data.user.role });
          setPlan(normalizePlan(r.data.user.plan));
        }
      })
      .catch(() => {});
  }, []);

  function visible(item: MenuItem): boolean {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#1A2332] flex flex-col transition-transform duration-300 z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-xl flex items-center justify-center shadow">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Jurnal Guru
              </h2>
              <p className="text-gray-500 text-xs">Administrasi Guru &amp; Kelas</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems
            .filter((group) => group.items.some(visible))
            .map((group) => {
              const items = group.items.filter(visible);
              if (items.length === 0) return null;
              return (
                <div key={group.section}>
                  {group.section === "Panel Admin" && (
                    <div className="mt-5 mx-6 border-t border-[#F87171]/30 pt-4 mb-1"></div>
                  )}
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider px-8 mb-2 mt-4 first:mt-0 ${
                      group.section === "Panel Admin" ? "flex items-center gap-1.5" : ""
                    }`}
                    style={{ color: group.color }}
                  >
                    {group.section === "Panel Admin" && (
                      <i className="fas fa-shield-halved text-[10px]"></i>
                    )}
                    {group.section}
                  </p>
                  {items.map((item) => {
                    const active = pathname === item.href;
                    const locked = !isAdmin && !!item.minPlan && !(item.minPlan === "premium" ? canUsePremium(plan) : canUsePro(plan));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        aria-label={locked ? `${item.label} (terkunci, butuh upgrade)` : item.label}
                        className={`flex items-center gap-3 px-6 py-2.5 mx-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium border-l-3 border-transparent ${
                          active
                            ? "bg-[#2D4055] text-white"
                            : "text-[#94a3b8] hover:bg-[#243447] hover:text-[#e2e8f0]"
                        }`}
                        style={active ? { borderLeftColor: group.color } : undefined}
                      >
                        <i className={`fas ${item.icon} w-5 text-center text-sm ${locked ? "opacity-70" : ""}`}></i>
                        <span className="flex-1">{item.label}</span>
                        {locked && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#E8A317]/15 text-[#E8A317] px-1.5 py-0.5 rounded">
                            <i className="fas fa-lock text-[9px]"></i> {item.minPlan === "premium" ? "49K" : "29K"}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
        </nav>

        <div className="md:hidden p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0D7C66] flex items-center justify-center text-white font-bold text-sm">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user.nama}
              </p>
              <p className="text-gray-500 text-xs capitalize">
                {roleLabel}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 bg-transparent border-none cursor-pointer"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
        <div className="hidden md:block p-4 border-t border-white/10">
          <UserMenu align="left" up />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E8E4DC] z-30 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-lg bg-[#F5F3EF] border border-[#E8E4DC] flex items-center justify-center text-gray-600 cursor-pointer"
          aria-label="Buka menu"
        >
          <i className="fas fa-bars text-base"></i>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="font-bold text-[15px] text-[#1A2332]">Jurnal Guru</span>
        </div>
        <UserMenu />
      </div>
    </>
  );
}