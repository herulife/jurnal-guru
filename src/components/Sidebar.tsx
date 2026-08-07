"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MenuItem = { label: string; icon: string; href: string; adminOnly?: boolean };

const menuItems: { section: string; items: MenuItem[] }[] = [
  {
    section: "Menu Utama",
    items: [
      { label: "Dashboard", icon: "fa-th-large", href: "/dashboard" },
      { label: "Data Siswa", icon: "fa-user-graduate", href: "/siswa" },
      { label: "Data Kelas", icon: "fa-chalkboard", href: "/kelas" },
      { label: "Jadwal Mengajar", icon: "fa-calendar-alt", href: "/jadwal" },
    ],
  },
  {
    section: "Akademik",
    items: [
      { label: "Absensi", icon: "fa-clipboard-check", href: "/absensi" },
      { label: "Rekap Absensi", icon: "fa-chart-pie", href: "/rekap-absensi" },
      { label: "Nilai", icon: "fa-chart-bar", href: "/nilai" },
      { label: "Rekap Nilai", icon: "fa-table-list", href: "/rekap-nilai" },
      { label: "Kelompok Belajar", icon: "fa-layer-group", href: "/kelompok" },
      { label: "Rapor", icon: "fa-graduation-cap", href: "/rapor" },
      { label: "Jurnal Mengajar", icon: "fa-book-open", href: "/jurnal" },
    ],
  },
  {
    section: "Sistem",
    items: [
      { label: "Kalender", icon: "fa-calendar", href: "/kalender" },
      { label: "LCKH", icon: "fa-clipboard-list", href: "/lckh", adminOnly: true },
      { label: "LKB", icon: "fa-file-alt", href: "/lkb", adminOnly: true },
      { label: "Template Surat", icon: "fa-envelope", href: "/surat" },
      { label: "Langganan", icon: "fa-crown", href: "/subscription" },
      { label: "Pengaturan", icon: "fa-cog", href: "/settings" },
      { label: "FAQ", icon: "fa-circle-question", href: "/faq" },
    ],
  },
  {
    section: "Admin",
    items: [
      { label: "Profil Sekolah", icon: "fa-school", href: "/profil", adminOnly: true },
      { label: "Tagihan", icon: "fa-credit-card", href: "/billing", adminOnly: true },
      { label: "Activity Log", icon: "fa-history", href: "/log", adminOnly: true },
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
  const isAdmin = user.role === "Admin";

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((r) => {
        if (r.ok && r.data?.user)
          setUser({ nama: r.data.user.nama, role: r.data.user.role });
      })
      .catch(() => {});
  }, []);

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
                Teacher Dashboard
              </h2>
              <p className="text-gray-500 text-xs">Sistem Manajemen</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems
            .filter((group) =>
              group.items.some(
                (item) => !item.adminOnly || isAdmin
              )
            )
            .map((group) => {
              const items = group.items.filter((item) => !item.adminOnly || isAdmin);
              if (items.length === 0) return null;
              return (
              <div key={group.section}>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-8 mb-2 mt-4 first:mt-0">
                  {group.section}
                </p>
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <div
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-3 px-6 py-2.5 mx-3 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium border-l-3 border-transparent ${
                        active
                          ? "bg-[#2D4055] text-white border-l-[#E8A317]"
                          : "text-[#94a3b8] hover:bg-[#243447] hover:text-[#e2e8f0]"
                      }`}
                    >
                      <i className={`fas ${item.icon} w-5 text-center text-sm`}></i>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              );
            })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0D7C66] flex items-center justify-center text-white font-bold text-sm">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user.nama}
              </p>
              <p className="text-gray-500 text-xs capitalize">{user.role}</p>
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
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E8E4DC] z-20 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-lg bg-[#F5F3EF] border border-[#E8E4DC] flex items-center justify-center text-gray-600 cursor-pointer"
        >
          <i className="fas fa-bars text-base"></i>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="font-bold text-[15px] text-[#1A2332]">Jurnal Guru</span>
        </div>
      </div>
    </>
  );
}
