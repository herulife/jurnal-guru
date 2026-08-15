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
      <div className="bg-[#1A2332] text-white rounded-xl border border-[#E8E4DC] px-4 py-2.5 flex items-center gap-3">
        <i className="fas fa-crown text-[#E8A317] flex-shrink-0"></i>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-300">
            <span className="font-semibold text-white">Upgrade ke Pro</span>
            {" "}— unlimited kelas + export PDF & Excel, mulai Rp 29rb/bulan. Atau Premium lifetime Rp 499rb sekali bayar.
          </p>
        </div>
        <Link
          href="/checkout?plan=pro"
          className="text-xs font-semibold text-[#E8A317] hover:text-white whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
        >
          Lihat
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