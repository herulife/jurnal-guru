"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";

type Plan = "gratis" | "pro" | "premium";

interface SubsInfo {
  plan: Plan;
  planExpires?: string | null;
  payment?: { amount: number; status: string; createdAt: string } | null;
  bank?: { bank_name: string; bank_account_number: string; bank_account_name: string };
}

function sisaHari(expires?: string | null): string | null {
  if (!expires) return null;
  const ms = new Date(expires).getTime() - Date.now();
  if (ms <= 0) return "Trial telah berakhir";
  const hari = Math.ceil(ms / 86400000);
  return hari <= 1 ? "Berakhir hari ini" : `Berakhir dalam ${hari} hari`;
}

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubsInfo | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user?: { plan?: string; role?: string; planExpires?: string | null } }>("/api/auth/check").then((r) => {
      if (r.ok && r.data?.user) {
        setInfo((p) => ({ plan: (r.data!.user!.plan as Plan) || "gratis", planExpires: r.data!.user!.planExpires ?? null, payment: p?.payment ?? null }));
        setRole(r.data!.user!.role ?? null);
      }
    });
    apiGet<{ plan?: string; payments?: any[] }>("/api/payments").then((r) => {
      if (r.ok && r.data) {
        const latest = r.data.payments?.[0] || null;
        setInfo((prev) => ({
          plan: prev?.plan ?? "gratis",
          planExpires: prev?.planExpires ?? null,
          payment: latest ? { amount: latest.amount, status: latest.status, createdAt: latest.createdAt } : prev?.payment ?? null,
        }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const planMeta: Record<Plan, { label: string; desc: string; color: string }> = {
    gratis: { label: "Gratis", desc: "Absensi, rekap presensi, jurnal mengajar — masa aktif 2 hari untuk akun baru", color: "bg-gray-100 text-gray-700" },
    pro: { label: "Pro", desc: "Semua fitur Gratis + nilai, rekap nilai, kelompok belajar", color: "bg-[#0D7C66]/10 text-[#0D7C66]" },
    premium: { label: "Premium", desc: "Semua fitur Pro + generate LCKH dan LKB — Rp 49.000 / 6 bulan, akses semua", color: "bg-amber-100 text-amber-700" },
  };

  const normalizePlan = (p?: string): Plan => {
    if (p === "pro") return "pro";
    if (p === "premium" || p === "sekolah") return "premium";
    return "gratis";
  };

  if (loading) return <div className="p-6 flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>;

  const plan = normalizePlan(info?.plan);
  const meta = planMeta[plan];
  const isAdmin = role === "Admin";
  const metaLabel = isAdmin ? "Admin — Akses Penuh" : meta.label;
  const metaColor = isAdmin ? "bg-[#1A2332] text-white" : meta.color;
  const sisa = sisaHari(info?.planExpires);
  const isTrial = plan === "gratis" && !!info?.planExpires;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-6">Langganan Saya</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Paket aktif</p>
            <p className={`inline-block font-bold mt-1 px-3 py-1 rounded-full ${metaColor}`}>{metaLabel}</p>
          </div>
          <div className="text-3xl text-[#0D7C66]"><i className="fas fa-crown"></i></div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{isAdmin ? "Akun administrator aplikasi. Semua fitur di semua paket terbuka tanpa berlangganan." : meta.desc}</p>

        {isTrial && (
          <div className="bg-[#E8A317]/10 border border-[#E8A317]/30 rounded-xl p-3 text-sm text-[#a16207] flex items-center gap-2 mb-4">
            <i className="fas fa-hourglass-half"></i>
            <span className="font-medium">{sisa} — upgrade untuk fitur lengkap tanpa batas</span>
          </div>
        )}

        {isAdmin ? (
          <div className="bg-[#1A2332]/5 border border-[#1A2332]/15 rounded-xl p-3 text-sm text-[#1A2332] flex items-center gap-2">
            <i className="fas fa-shield-halved"></i> Admin tidak perlu berlangganan
          </div>
        ) : plan === "gratis" ? (
          <div className="space-y-2">
            <Link href="/checkout?plan=pro" className="btn btn-primary w-full justify-center">
              <i className="fas fa-rocket mr-1"></i> Upgrade ke Pro — Rp 29.000/6 bulan
            </Link>
            <Link href="/checkout?plan=premium" className="btn btn-accent w-full justify-center">
              <i className="fas fa-crown mr-1"></i> Premium — Rp 49.000/6 bulan, akses semua
            </Link>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
            <i className="fas fa-check-circle"></i> Paket Anda sudah aktif. Terima kasih!
          </div>
        )}
      </div>

      {info?.payment && (
        <div className="card">
          <h3 className="font-bold text-[#1A2332] mb-4"><i className="fas fa-receipt text-[#0D7C66] mr-2"></i>Pembayaran Terakhir</h3>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500">Nominal</span>
            <span className="font-semibold">Rp {info.payment.amount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500">Status</span>
            <span className={`badge ${info.payment.status === "paid" ? "badge-tuntas" : "badge"}`}>{info.payment.status}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Tanggal</span>
            <span>{info.payment.createdAt ? new Date(info.payment.createdAt).toLocaleDateString("id-ID") : "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
