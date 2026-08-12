"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";

const DISMISS_KEY = "jg_social_proof_dismissed";

const notifications = [
  { name: "Bu Ratna", location: "Jakarta", plan: "Pro", detail: "kelola nilai & kelompok belajar" },
  { name: "Pak Ahmad", location: "Bandung", plan: "Pro", detail: "rekap nilai otomatis" },
  { name: "Bu Siti", location: "Surabaya", plan: "Premium", detail: "generate LCKH & LKB" },
  { name: "Pak Budi", location: "Medan", plan: "Pro", detail: "export PDF rekap nilai" },
  { name: "Bu Dewi", location: "Semarang", plan: "Premium", detail: "semua fitur terbaik" },
  { name: "Pak Hendra", location: "Makassar", plan: "Pro", detail: "kelompok belajar" },
  { name: "Bu Maya", location: "Yogyakarta", plan: "Pro", detail: "nilai tanpa batas kelas" },
  { name: "Pak Rizki", location: "Palembang", plan: "Premium", detail: "laporan pegawai" },
];

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  Pro: { bg: "bg-[#E8A317]/15", color: "text-[#E8A317]" },
  Premium: { bg: "bg-purple-500/15", color: "text-purple-300" },
};

/**
 * Social proof notification untuk user paket gratis.
 * Menampilkan rotasi notifikasi "guru lain baru saja upgrade"
 * agar pengguna tergerak meningkatkan paket. Bisa ditutup
 * (disimpan di localStorage), hanya muncul untuk plan gratis non-admin.
 */
export default function SocialProof() {
  const [plan, setPlan] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    apiGet<{ user?: { plan?: string; role?: string }; plan?: string }>("/api/auth/check").then((r) => {
      if (!active) return;
      if (r.ok) {
        setPlan(r.data?.user?.plan || r.data?.plan || "gratis");
        setRole(r.data?.user?.role || null);
        setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = role?.toLowerCase() === "admin";
  const isFree = plan === "gratis" || plan === null;

  // show/hide rotasi notifikasi
  useEffect(() => {
    if (dismissed || isAdmin || !isFree) return;
    const t1 = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(t1);
  }, [dismissed, isAdmin, isFree]);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => {
      setVisible(false);
      const next = setTimeout(() => {
        setCurrent((p) => (p + 1) % notifications.length);
        setVisible(true);
      }, 3000);
      return () => clearTimeout(next);
    }, 6000);
    return () => clearTimeout(hide);
  }, [visible]);

  if (dismissed || isAdmin || !isFree) return null;

  const n = notifications[current];
  const style = PLAN_STYLE[n.plan] || PLAN_STYLE.Pro;

  return (
    <Link
      href="/checkout?plan=pro"
      className={`fixed bottom-20 right-4 z-40 block max-w-xs w-[calc(100%-2rem)] sm:w-80 bg-[#1A2332] rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-[#E8A317]/50 hover:shadow-[#E8A317]/10 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {n.name.charAt(0)}
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1A2332]"></span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-white leading-snug">
            <span className="font-bold">{n.name}</span>{" "}
            <span className="text-gray-400">dari {n.location} baru saja</span>
          </p>
          <p className="text-[13px] leading-snug">
            <span className={`inline-flex items-center gap-1 font-bold ${style.color}`}>
              <i className="fas fa-crown text-[10px]"></i> upgrade ke {n.plan}
            </span>
            <span className="text-gray-400"> — {n.detail}</span>
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setDismissed(true);
            localStorage.setItem(DISMISS_KEY, "1");
          }}
          className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white bg-transparent border-none cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>
      <div className="px-4 pb-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${style.bg} ${style.color}`}>
          <i className="fas fa-rocket"></i> Upgrade juga — mulai Rp 29rb/bln
        </span>
      </div>
    </Link>
  );
}
