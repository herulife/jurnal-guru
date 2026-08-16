"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";

const DISMISS_KEY = "jg_upgrade_dismissed";

/**
 * Bara upgrade di bawah halaman untuk paket gratis.
 * Estetik tapi bersih: dua penawaran paket jelas, bisa ditutup (disimpan di localStorage).
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
    <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm print-hidden">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2332] via-[#14334a] to-[#0D7C66] text-white rounded-2xl px-4 py-3.5 shadow-2xl flex flex-col gap-3">
        <div
          className="absolute -top-16 -right-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #E8A317 0%, transparent 70%)" }}
          aria-hidden="true"
        ></div>
        <div className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #0D7C66 0%, transparent 70%)" }} aria-hidden="true"></div>

        <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#E8A317] to-[#ca8a04] flex items-center justify-center shadow-md">
          <i className="fas fa-crown text-[#1A2332] text-lg"></i>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            Upgrade ke Pro — unlimited kelas + export PDF &amp; Excel
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#E8A317]/15 text-[#E8A317] border border-[#E8A317]/30 rounded-full px-2.5 py-1">
              <i className="fas fa-bolt text-[9px]"></i> Pro · Rp 29rb / 6 bulan
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 text-white border border-white/20 rounded-full px-2.5 py-1">
              <i className="fas fa-crown text-[9px]"></i> Premium · Rp 49rb / 6 bulan — akses semua fitur
            </span>
          </div>
        </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <Link
            href="/checkout?plan=pro"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <i className="fas fa-rocket text-[10px]"></i> Lihat Paket
          </Link>
          <button
            onClick={handleDismiss}
            className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            title="Tutup"
            aria-label="Tutup banner upgrade"
          >
            <i className="fas fa-times text-sm" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
}