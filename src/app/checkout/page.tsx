"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/useApi";

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: 29000,
    tagline: "Untuk guru yang mengajar banyak kelas",
    per: "/bulan",
    features: ["Unlimited kelas", "Export PDF", "Laporan lanjutan", "Prioritas support", "Bonus: Template RPP"],
  },
  {
    id: "sekolah",
    name: "Sekolah",
    price: 299000,
    tagline: "Untuk sekolah & dinas pendidikan",
    per: "/bulan",
    features: ["Semua fitur Pro", "Multi-guru", "Dashboard admin", "Backup otomatis", "Support dedicated", "Custom domain"],
  },
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planId, setPlanId] = useState<string>("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<"loading" | "ok" | "guest">("loading");

  useEffect(() => {
    const p = searchParams.get("plan");
    if (p === "sekolah") setPlanId("sekolah");
    apiGet("/api/auth/check")
      .then((r) => setAuthState(r.ok ? "ok" : "guest"))
      .catch(() => setAuthState("guest"));
  }, [searchParams]);

  const plan = plans.find((x) => x.id === planId)!;

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ paymentId: string }>("/api/payments", { planId });
      if (!res.ok) {
        setError(res.msg || "Gagal membuat order");
        return;
      }
      router.push(`/checkout/konfirmasi?payment=${res.data?.paymentId}`);
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left"></i> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-2">
            Checkout
          </h1>
          <p className="text-white/70">
            Pilih paket, transfer via <strong className="text-white">Bank BRI</strong>, lalu verifikasi manual oleh admin.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlanId(p.id)}
              className={`text-left rounded-2xl p-6 border-2 transition-all ${
                planId === p.id
                  ? "border-[#0D7C66] bg-white shadow-lg"
                  : "border-[#E8E4DC] bg-white hover:border-[#0D7C66]/40"
              }`}
            >
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${planId === p.id ? "text-[#0D7C66]" : "text-gray-400"}`}>
                {p.name}
              </div>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-3xl font-extrabold font-[Outfit] text-[#1A2332]">
                  Rp {p.price.toLocaleString("id-ID")}
                </span>
                <span className="text-sm text-gray-500">{p.per}</span>
              </div>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fas fa-check text-[#0D7C66] text-xs"></i> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {authState === "guest" ? (
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8 text-center">
            <div className="w-16 h-16 bg-[#0D7C66]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-sign-in-alt text-[#0D7C66] text-2xl"></i>
            </div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Masuk dulu untuk melanjutkan</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Anda perlu login atau daftar akun terlebih dahulu sebelum melakukan pembayaran.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn btn-primary"><i className="fas fa-sign-in-alt mr-1"></i> Masuk</Link>
              <Link href="/register" className="btn btn-outline"><i className="fas fa-user-plus mr-1"></i> Daftar</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 md:p-8">
            <h3 className="font-bold text-gray-800 mb-6 font-[Outfit] flex items-center gap-2">
              <i className="fas fa-file-invoice text-[#0D7C66]"></i> Ringkasan Pesanan
            </h3>
            <div className="space-y-3 border-b border-[#E8E4DC] pb-5 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Paket</span>
                <span className="font-semibold text-[#1A2332]">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Metode Pembayaran</span>
                <span className="font-semibold text-[#1A2332]">
                  <i className="fas fa-university mr-1 text-[#0D7C66]"></i> Transfer BRI
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Total</span>
                <span className="font-extrabold text-[#1A2332] text-lg">Rp {plan.price.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                <p className="text-red-600 text-sm text-center"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn btn-primary w-full justify-center text-base py-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Membuat order...
                </>
              ) : (
                <>
                  <i className="fas fa-lock mr-1"></i> Lanjutkan ke Pembayaran
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              <i className="fas fa-shield-halved mr-1"></i> Pembayaran diverifikasi manual. Garansi 30 hari uang kembali.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}