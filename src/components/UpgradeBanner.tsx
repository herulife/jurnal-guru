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
  if (!plan || plan === "pro" || plan === "sekolah") return null;
  if (role && role.toLowerCase() === "admin") return null;

  return (
    <div className="mx-6 my-4">
      <div className="bg-[#1A2332] text-white rounded-xl border border-[#E8E4DC] px-4 py-2.5 flex items-center gap-3">
        <i className="fas fa-crown text-[#E8A317] flex-shrink-0"></i>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-300">
            <span className="font-semibold text-white">Upgrade ke Pro</span>
            {" "}— unlimited kelas + export PDF Rp 29rb/bulan.
          </p>
        </div>
        <Link
          href="/checkout?plan=pro"
          className="text-xs font-semibold text-[#E8A317] hover:text-white whitespace-nowrap transition-colors bg-transparent border-none cursor-pointer"
        >
          Lihat
        </Link>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(DISMISS_KEY, "1"); }}
          className="text-gray-500 hover:text-white bg-transparent border-none cursor-pointer flex-shrink-0"
          title="Tutup"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>
    </div>
  );
}