"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/useApi";

type Plan = "gratis" | "pro" | "sekolah";

interface SubsInfo {
  plan: Plan;
  payment?: { amount: number; status: string; createdAt: string } | null;
  bank?: { bank_name: string; bank_account_number: string; bank_account_name: string };
}

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user?: { plan?: string } }>("/api/auth/check").then((r) => {
      setInfo((p) => ({ plan: (r.data?.user?.plan as Plan) || "gratis", payment: p?.payment ?? null }));
    });
    apiGet<{ plan?: string; payments?: any[] }>("/api/payments").then((r) => {
      if (r.ok && r.data) {
        const latest = r.data.payments?.[0] || null;
        setInfo({
          plan: (r.data.plan as Plan) || "gratis",
          payment: latest ? { amount: latest.amount, status: latest.status, createdAt: latest.createdAt } : null,
        });
      }
    });
  }, []);

  const planMeta: Record<Plan, { label: string; desc: string; color: string }> = {
    gratis: { label: "Gratis", desc: "1 kelas, export PDF belum terbuka", color: "bg-gray-100 text-gray-700" },
    pro: { label: "Pro", desc: "Unlimited kelas + Export PDF", color: "bg-[#0D7C66]/10 text-[#0D7C66]" },
    sekolah: { label: "Sekolah", desc: "Multi-guru + semua fitur", color: "bg-amber-100 text-amber-700" },
  };

  if (loading) return <div className="p-6 flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>;

  const meta = planMeta[info?.plan || "gratis"];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-6">Langganan Saya</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Paket aktif</p>
            <p className={`inline-block font-bold mt-1 px-3 py-1 rounded-full ${meta.color}`}>{meta.label}</p>
          </div>
          <div className="text-3xl text-[#0D7C66]"><i className="fas fa-crown"></i></div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{meta.desc}</p>

        {info?.plan !== "pro" && info?.plan !== "sekolah" ? (
          <Link href="/checkout?plan=pro" className="btn btn-primary w-full justify-center">
            <i className="fas fa-rocket mr-1"></i> Upgrade ke Pro — Rp 29.000/bln
          </Link>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
            <i className="fas fa-check-circle"></i> Paket Anda sudah aktif. Terima kasih sudah menjadi Pro!
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