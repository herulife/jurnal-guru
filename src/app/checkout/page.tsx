"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/useApi";
import { useToast } from "@/components/Feedback";
import OrderSteps from "@/components/OrderSteps";

const PRO_DURATIONS = [
  { id: "pro_6m", label: "6 Bulan", price: 29000, perBulan: 4834, months: 6 },
];

const PREMIUM = {
  id: "premium_6m",
  name: "Premium",
  price: 49000,
  tagline: "6 bulan, akses semua fitur",
  features: ["Semua fitur Pro", "Generate LCKH", "Generate LKB", "Ekspor laporan pegawai", "Support prioritas"],
};

const PRO_FEATURES = [
  "Semua fitur Gratis",
  "Nilai & KKM",
  "Rekap Nilai",
  "Generate Kelompok Belajar",
  "Unlimited kelas",
  "Export PDF & Excel",
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const { show } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paket, setPaket] = useState<"pro" | "premium">("pro");
  const [durasiId, setDurasiId] = useState<string>("pro_6m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<"loading" | "ok" | "guest">("loading");

  useEffect(() => {
    const p = searchParams.get("plan");
    if (p === "premium" || p === "sekolah") setPaket("premium");
    else if (p) {
      const known = PRO_DURATIONS.some((d) => d.id === p);
      if (known) { setPaket("pro"); setDurasiId(p); }
    }
    apiGet("/api/auth/check")
      .then((r) => setAuthState(r.ok ? "ok" : "guest"))
      .catch(() => setAuthState("guest"));
  }, [searchParams]);

  const durasi = PRO_DURATIONS.find((d) => d.id === durasiId)!;
  const harga = paket === "pro" ? durasi.price : PREMIUM.price;
  const planLabel = paket === "pro" ? "Pro — 6 bulan" : "Premium — 6 bulan";

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const planId = paket === "pro" ? durasi.id : "premium_6m";
      const res = await apiPost<{ paymentId: string }>("/api/payments", { planId });
      if (!res.ok) {
        setError(res.msg || "Gagal membuat order");
        show(res.msg || "Gagal membuat order", "error");
        return;
      }
      show("Pesanan berhasil dibuat, lanjutkan ke pembayaran", "success");
      router.push(`/checkout/konfirmasi?payment=${res.data?.paymentId}`);
    } catch {
      setError("Koneksi gagal");
      show("Koneksi gagal", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left"></i> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-6 text-center">
            Checkout — Pilih Paket Anda
          </h1>
          <OrderSteps step={1} />
        </div>
      </div>

      {authState === "guest" ? (
        <div className="max-w-3xl mx-auto px-5 pt-10">
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
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-5 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Kiri: pilihan paket */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-gray-800 font-[Outfit] text-lg">
                <i className="fas fa-cube mr-2 text-[#0D7C66]"></i>1. Pilih Paket
              </h2>

              {/* Pro */}
              <button
                onClick={() => setPaket("pro")}
                className={`w-full text-left rounded-2xl p-6 border-2 transition-all ${
                  paket === "pro" ? "border-[#0D7C66] bg-white shadow-lg ring-4 ring-[#0D7C66]/10" : "border-[#E8E4DC] bg-white hover:border-[#0D7C66]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paket === "pro" ? "border-[#0D7C66]" : "border-gray-300"}`}>
                      {paket === "pro" && <div className="w-2.5 h-2.5 rounded-full bg-[#0D7C66]"></div>}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${paket === "pro" ? "text-[#0D7C66]" : "text-gray-400"}`}>
                      Pro
                    </span>
                  </div>
                  <span className="text-xs bg-[#0D7C66]/10 text-[#0D7C66] font-semibold rounded-full px-3 py-1">
                    Nilai • Rekap • Kelompok
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1 mt-2 pl-8">
                  <span className="text-3xl font-extrabold font-[Outfit] text-[#1A2332] tabular-nums">
                    Rp {durasi.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-500">/6 bulan</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 pl-8">≈ Rp {Math.round(durasi.perBulan).toLocaleString("id-ID")}/bulan &middot; minimal pembelian 6 bulan</p>
                <ul className="space-y-1.5 pl-8">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <i className="fas fa-check text-[#0D7C66] text-xs"></i> {f}
                    </li>
                  ))}
                </ul>
              </button>

              {/* Premium */}
              <button
                onClick={() => setPaket("premium")}
                className={`relative w-full text-left rounded-2xl p-6 border-2 transition-all ${
                  paket === "premium" ? "border-[#E8A317] bg-white shadow-lg ring-4 ring-[#E8A317]/10" : "border-[#E8E4DC] bg-white hover:border-[#E8A317]/50"
                }`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E8A317] to-[#ca8a04] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  <i className="fas fa-crown mr-1"></i> Paling Hemat
                </span>
                <div className="flex items-center justify-between mb-1 mt-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paket === "premium" ? "border-[#E8A317]" : "border-gray-300"}`}>
                      {paket === "premium" && <div className="w-2.5 h-2.5 rounded-full bg-[#E8A317]"></div>}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${paket === "premium" ? "text-[#ca8a04]" : "text-gray-400"}`}>
                      Premium
                    </span>
                  </div>
                  <span className="text-xs bg-[#E8A317]/15 text-[#b45309] font-semibold rounded-full px-3 py-1">
                    <i className="fas fa-crown mr-1"></i>Semua Akses
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1 mt-2 pl-8">
                  <span className="text-3xl font-extrabold font-[Outfit] text-[#1A2332] tabular-nums">
                    Rp {PREMIUM.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-500">/6 bulan</span>
                </div>
                <p className="text-xs font-semibold text-[#ca8a04] mb-3 pl-8">{PREMIUM.tagline}</p>
                <ul className="space-y-1.5 pl-8">
                  {PREMIUM.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <i className="fas fa-check text-[#E8A317] text-xs"></i> {f}
                    </li>
                  ))}
                </ul>
              </button>

              <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-4 text-sm text-gray-600 flex items-start gap-3">
                <i className="fas fa-info-circle mt-0.5 text-[#0D7C66]"></i>
                <span>
                  Pembelian minimal 6 bulan, sekali bayar di muka via <strong>transfer Bank BRI</strong>. Setelah masa aktif habis, perpanjang dengan membayar lagi.
                </span>
              </div>
            </div>

            {/* Kanan: ringkasan pesanan sticky */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-[#1A2332] text-white flex items-center gap-2">
                  <i className="fas fa-file-invoice text-[#E8A317]"></i>
                  <span className="font-bold font-[Outfit]">Ringkasan Pesanan</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#E8E4DC] mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${paket === "pro" ? "bg-[#0D7C66]" : "bg-gradient-to-br from-[#E8A317] to-[#ca8a04]"}`}>
                      <i className={`${paket === "pro" ? "fas fa-chart-bar" : "fas fa-crown"}`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A2332] text-sm">{planLabel}</p>
                      <p className="text-xs text-gray-400">Berlaku 6 bulan sejak verifikasi</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal ({paket === "pro" ? "Pro" : "Premium"})</span>
                      <span className="font-semibold text-[#1A2332] tabular-nums">Rp {harga.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Biaya admin</span>
                      <span className="font-semibold text-[#0D7C66]">Gratis</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Metode pembayaran</span>
                      <span className="font-semibold text-[#1A2332]">
                        <i className="fas fa-university mr-1 text-[#0D7C66]"></i>Transfer BRI
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-dashed border-[#E8E4DC] pt-4 mb-5">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-extrabold text-[#1A2332] text-xl tabular-nums">
                      Rp {harga.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
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
                    <i className="fas fa-shield-halved mr-1"></i> Garansi 30 hari: tidak hemat waktu? Uang kembali penuh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}