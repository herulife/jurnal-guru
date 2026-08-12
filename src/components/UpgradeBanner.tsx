"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";

const DISMISS_KEY = "jg_upgrade_dismissed";

/**
 * Bara upgrade di bawah halaman untuk paket gratis.
 * Kecil, tidak menutupi konten, dan bisa ditutup (disimpan di localStorage).
 */
export default function UpgradeBanner() {
  const [plan, setPlan] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    apiGet<{ user?: { plan?: string; role?: string }; plan?: string }>("/api/auth/check").then((r) => {
      if (r.ok) {
        setPlan(r.data?.user?.plan || r.data?.plan || "gratis");
        setRole(r.data?.user?.role || null);
      }
    });
  }, []);

  if (dismissed) return null;
  if (!plan || plan === "pro" || plan === "premium" || plan === "sekolah") return null;
  if (role && role.toLowerCase() === "admin") return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="mx-6 my-4">
      <div className="bg-[#1A2332] text-white rounded-2xl border border-[#E8E4DC] px-5 py-3.5 flex flex-wrap items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#E8A317] to-[#ca8a04]"></div>
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#E8A317]/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="w-10 h-10 rounded-xl bg-[#E8A317]/15 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-crown text-[#E8A317]"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">
            Buka fitur lengkap dengan <span className="text-[#E8A317]">Pro</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            Nilai, rekap nilai, kelompok belajar & export PDF — Rp 29rb/bulan.
          </p>
        </div>
        <Link
          href="/checkout?plan=pro"
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] rounded-lg px-4 py-2 whitespace-nowrap transition-colors"
        >
          Upgrade Sekarang <i className="fas fa-arrow-right text-[10px]"></i>
        </Link>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Tutup"
          aria-label="Tutup banner upgrade"
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}