"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";
import { normalizePlan } from "@/lib/plan-helpers";
import type { Plan } from "@/lib/plan-helpers";

interface SubsInfo {
  plan: Plan;
  payment?: { amount: number; status: string; createdAt: string } | null;
  bank?: { bank_name: string; bank_account_number: string; bank_account_name: string };
}

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubsInfo | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user?: { plan?: string; role?: string } }>("/api/auth/check").then((r) => {
      if (r.ok && r.data?.user) {
        setInfo((p) => ({ plan: (r.data!.user!.plan as Plan) || "gratis", payment: p?.payment ?? null }));
        setRole(r.data!.user!.role ?? null);
      }
    });
    apiGet<{ plan?: string; payments?: Array<{ amount: number; status: string; createdAt: string }> }>("/api/payments").then((r) => {
      if (r.ok && r.data) {
        const latest = r.data.payments?.[0] || null;
        setInfo({
          plan: (r.data.plan as Plan) || "gratis",
          payment: latest ? { amount: latest.amount, status: latest.status, createdAt: latest.createdAt } : null,
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const planMeta: Record<Plan, { label: string; desc: string; color: string }> = {
    gratis: { label: "Gratis", desc: "Absensi, rekap presensi, jurnal mengajar", color: "bg-gray-100 text-gray-700" },
    pro: { label: "Pro", desc: "Semua fitur Gratis + nilai, rekap nilai, kelompok belajar", color: "bg-[#0D7C66]/10 text-[#0D7C66]" },
    premium: { label: "Premium", desc: "Semua fitur Pro + generate LCKH dan LKB", color: "bg-amber-100 text-amber-700" },
  };

  if (loading) return <div className="p-6 flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>;

  const meta = planMeta[normalizePlan(info?.plan)];
  const isAdmin = role?.toLowerCase() === "admin";
  const metaLabel = isAdmin ? "Admin — Akses Penuh" : meta.label;
  const metaColor = isAdmin ? "bg-[#1A2332] text-white" : meta.color;

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

        {isAdmin ? (
          <div className="bg-[#1A2332]/5 border border-[#1A2332]/15 rounded-xl p-3 text-sm text-[#1A2332] flex items-center gap-2">
            <i className="fas fa-shield-halved"></i> Admin tidak perlu berlangganan
          </div>
        ) : normalizePlan(info?.plan) === "gratis" ? (
          <div className="space-y-2">
            <Link href="/checkout?plan=pro" className="btn btn-primary w-full justify-center">
              <i className="fas fa-rocket mr-1"></i> Upgrade ke Pro — Rp 29.000/bln
            </Link>
            <Link href="/checkout?plan=premium" className="btn btn-outline w-full justify-center">
              <i className="fas fa-crown mr-1"></i> Upgrade ke Premium — Rp 49.000/bln
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