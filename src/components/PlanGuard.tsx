"use client";

import Link from "next/link";
import { useUserPlan, canUsePro, canUsePremium } from "@/lib/useUserPlan";
import type { Plan } from "@/lib/useUserPlan";

/**
 * Menampilkan layar "Fitur Terkunci" + CTA upgrade bila plan user belum cukup.
 * Konten fitur hanya dirender setelah plan memenuhi syarat.
 */
export default function PlanGuard({ min, children }: { min: Plan; children: React.ReactNode }) {
  const { plan, role, loading } = useUserPlan();

  if (loading || !plan) {
    return (
      <div className="p-6">
        <div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (role === "Admin") return <>{children}</>;
  const allowed = min === "premium" ? canUsePremium(plan) : canUsePro(plan);
  if (allowed) return <>{children}</>;

  const isPremium = min === "premium";
  const sudahPro = plan === "pro";
  const judul = isPremium ? "Fitur Premium" : "Fitur Pro";

  return (
    <div className="p-6 fade-in max-w-lg mx-auto">
      <div className="card p-10 text-center">
        <div className="w-16 h-16 bg-[#0D7C66]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i className={`fas ${isPremium ? "fa-crown" : "fa-lock"} text-[#0D7C66] text-2xl`}></i>
        </div>
        <h1 className="text-xl font-bold text-[#1A2332] font-[Outfit] mb-2">{judul} Terkunci</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {isPremium
            ? "Fitur ini tersedia untuk paket Premium (Rp 49.000 / 6 bulan, akses semua). Upgrade sekarang dan generate LCKH serta LKB untuk pegawai."
            : "Fitur ini tersedia untuk paket Pro (Rp 29.000 / 6 bulan). Upgrade sekarang dan buka nilai, rekap nilai, dan kelompok belajar."}
        </p>

        <div className="space-y-2.5">
          {isPremium && !sudahPro && (
            <Link
              href="/checkout?plan=pro"
              className="block w-full py-3 px-5 border-2 border-[#0D7C66] text-[#0D7C66] font-semibold rounded-xl hover:bg-[#0D7C66]/5 transition-all"
            >
              Mulai dari Pro — Rp 29.000/6 bulan
            </Link>
          )}
          <Link
            href={isPremium ? "/checkout?plan=premium" : "/checkout?plan=pro"}
            className="block w-full py-3 px-5 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold rounded-xl transition-all shadow-lg"
          >
            <i className="fas fa-rocket mr-1"></i> Upgrade ke {isPremium ? "Premium" : "Pro"} — Rp {isPremium ? "49.000/6 bulan" : "29.000/6 bulan"}
          </Link>
          <Link href="/subscription" className="block w-full py-2 px-5 text-sm text-gray-500 hover:text-[#0D7C66] transition-colors">
            Lihat status langganan saya
          </Link>
        </div>
      </div>
    </div>
  );
}