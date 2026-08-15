"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/useApi";
import { useToast } from "@/components/Feedback";

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
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left"></i> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-2">
            Pilih Paket Anda
          </h1>
          <p className="text-white/70">
            Transfer via <strong className="text-white">Bank BRI</strong>, lalu verifikasi manual oleh admin.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Pilihan paket */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pro */}
          <button
            onClick={() => setPaket("pro")}
            className={`text-left rounded-2xl p-6 border-2 transition-all ${
              paket === "pro" ? "border-[#0D7C66] bg-white shadow-lg" : "border-[#E8E4DC] bg-white hover:border-[#0D7C66]/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${paket === "pro" ? "text-[#0D7C66]" : "text-gray-400"}`}>
                Pro
              </span>
              {paket === "pro" && <i className="fas fa-check-circle text-[#0D7C66] text-sm"></i>}
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-extrabold font-[Outfit] text-[#1A2332] tabular-nums">
                Rp {durasi.price.toLocaleString("id-ID")}
              </span>
              <span className="text-sm text-gray-500">/6 bulan</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">≈ Rp {Math.round(durasi.perBulan).toLocaleString("id-ID")}/bulan &middot; minimal pembelian 6 bulan</p>
            <ul className="space-y-1.5">
              {["Semua fitur Gratis", "Nilai & KKM", "Rekap Nilai", "Generate Kelompok Belajar", "Unlimited kelas", "Export PDF & Excel"].map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <i className="fas fa-check text-[#0D7C66] text-xs"></i> {f}
                </li>
              ))}
            </ul>
          </button>

          {/* Premium */}
          <button
            onClick={() => setPaket("premium")}
            className={`relative text-left rounded-2xl p-6 border-2 transition-all ${
              paket === "premium" ? "border-[#E8A317] bg-white shadow-lg" : "border-[#E8E4DC] bg-white hover:border-[#E8A317]/50"
            }`}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E8A317] to-[#ca8a04] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
              <i className="fas fa-crown mr-1"></i> Paling Hemat
            </span>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${paket === "premium" ? "text-[#ca8a04]" : "text-gray-400"}`}>
                Premium
              </span>
              {paket === "premium" && <i className="fas fa-check-circle text-[#E8A317] text-sm"></i>}
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-extrabold font-[Outfit] text-[#1A2332] tabular-nums">
                Rp {PREMIUM.price.toLocaleString("id-ID")}
              </span>
              <span className="text-sm text-gray-500">/6 bulan</span>
            </div>
            <p className="text-xs font-semibold text-[#ca8a04] mb-3">{PREMIUM.tagline}</p>
            <ul className="space-y-1.5">
              {PREMIUM.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <i className="fas fa-check text-[#E8A317] text-xs"></i> {f}
                </li>
              ))}
            </ul>
          </button>
        </div>

        {/* Catatan durasi */}
        <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-4 text-sm text-gray-600 mb-8">
          <i className="fas fa-info-circle mr-1 text-[#0D7C66]"></i>
          Pembelian minimal 6 bulan. Setelah habis, perpanjang dengan membayar lagi.
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
                <span className="font-semibold text-[#1A2332]">{planLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Masa Aktif</span>
                <span className="font-semibold text-[#1A2332]">6 bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Metode Pembayaran</span>
                <span className="font-semibold text-[#1A2332]">
                  <i className="fas fa-university mr-1 text-[#0D7C66]"></i> Transfer BRI
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Total</span>
                <span className="font-extrabold text-[#1A2332] text-lg">Rp {harga.toLocaleString("id-ID")}</span>
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
