"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPatch } from "@/lib/useApi";
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

type Stage = "paket" | "kontak" | "bayar" | "konfirmasi" | "sukses";

type PaymentData = {
  amount: number;
  planId?: string;
  whatsapp?: string;
  notes?: string;
  status?: string;
};

type BankInfo = {
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_note: string;
  wa_admin?: string;
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
  const planParam = searchParams.get("plan");

  const [paket, setPaket] = useState<"pro" | "premium">(
    planParam === "premium" || planParam === "sekolah" ? "premium" : "pro"
  );
  const [durasiId, setDurasiId] = useState<string>("pro_6m");
  const [stage, setStage] = useState<Stage>("paket");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<"loading" | "ok" | "guest">("loading");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [bank, setBank] = useState<BankInfo>({
    bank_name: "BRI",
    bank_account_name: "Jurnal Guru",
    bank_account_number: "",
    bank_note: "",
  });
  const [waSent, setWaSent] = useState(false);

  const PLAN_LABEL: Record<string, { name: string; duration: string }> = {
    pro_6m: { name: "Pro", duration: "6 bulan" },
    premium_6m: { name: "Premium", duration: "6 bulan" },
  };

  useEffect(() => {
    apiGet("/api/auth/check")
      .then((r) => setAuthState(r.ok ? "ok" : "guest"))
      .catch(() => setAuthState("guest"));

    apiGet<{ bank: BankInfo }>("/api/payments")
      .then((r) => {
        if (r.ok && r.data?.bank) setBank(r.data.bank);
      })
      .catch(() => {});

    const pid = searchParams.get("payment");
    if (pid) {
      apiGet<{ payment: PaymentData }>(`/api/payments/${pid}`)
        .then((r) => {
          if (!r.ok || !r.data?.payment) return;
          const p = r.data.payment;
          setPaymentId(pid);
          setPayment(p);
          setWhatsapp(p.whatsapp ?? "");
          setNotes(p.notes ?? "");
          if (p.status && p.status !== "pending") setStage("sukses");
          else setStage(p.notes ? "konfirmasi" : "bayar");
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const durasi = PRO_DURATIONS.find((d) => d.id === durasiId)!;
  const harga = paket === "pro" ? durasi.price : PREMIUM.price;
  const planLabel = paket === "pro" ? "Pro — 6 bulan" : "Premium — 6 bulan";
  const planInfo = payment?.planId ? PLAN_LABEL[payment.planId] : null;

  const waValid = /^(08|62|8)\d{8,13}$/.test(whatsapp.replace(/[^\d]/g, ""));

  async function handleBuatPesanan() {
    if (!waValid) {
      setError("Masukkan nomor WhatsApp yang valid, contoh: 081234567890");
      show("Nomor WhatsApp belum valid", "error");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const planId = paket === "pro" ? durasi.id : "premium_6m";
      const res = await apiPost<{ paymentId: string; waSent?: boolean }>("/api/payments", {
        planId,
        whatsapp: whatsapp.replace(/[^\d]/g, ""),
      });
      if (!res.ok) {
        setError(res.msg || "Gagal membuat order");
        show(res.msg || "Gagal membuat order", "error");
        return;
      }
      setPaymentId(res.data?.paymentId ?? null);
      setPayment({ amount: harga, planId });
      setWaSent(!!res.data?.waSent);
      show("Pesanan berhasil dibuat", "success");
      if (res.data?.paymentId) router.replace(`/checkout?payment=${res.data.paymentId}`);
      setStage("bayar");
    } catch {
      setError("Koneksi gagal");
      show("Koneksi gagal", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleKirimBukti() {
    if (!waValid) {
      setError("Nomor WhatsApp tidak valid, contoh: 081234567890");
      return;
    }
    if (!paymentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiPatch(`/api/payments/${paymentId}`, {
        notes,
        whatsapp: whatsapp.replace(/[^\d]/g, ""),
      });
      if (!res.ok) {
        setError(res.msg || "Gagal menyimpan");
        return;
      }
      show("Konfirmasi terkirim, terima kasih!", "success");
      setStage("sukses");
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      show(`${label} disalin`, "success");
    } catch {
      show("Gagal menyalin", "error");
    }
  }

  const ringkasan = (paket === "pro" ? "Pro" : "Premium") + " — 6 bulan";

  return (
    <div className="min-h-screen bg-[#F5F3EF] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left"></i> Kembali ke Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-6 text-center">
            {stage === "paket" || stage === "kontak" ? "Checkout — Pesanan Anda" : "Selesaikan Pembayaran"}
          </h1>
          <OrderSteps step={stage === "paket" || stage === "kontak" ? 1 : stage === "sukses" ? 3 : 2} />
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 max-w-3xl mx-auto">
              <p className="text-red-600 text-sm text-center"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>
            </div>
          )}

          {/* ===== TAHAP 1: PILIH PAKET ===== */}
          {stage === "paket" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

              {/* Ringkasan */}
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

                    <button
                      onClick={() => { setError(""); setStage("kontak"); }}
                      className="btn btn-primary w-full justify-center text-base py-3"
                    >
                      <i className="fas fa-arrow-right mr-1"></i> Lanjut ke Data Kontak
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      <i className="fas fa-shield-halved mr-1"></i> Garansi 30 hari: tidak hemat waktu? Uang kembali penuh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAHAP 2: DATA KONTAK ===== */}
          {stage === "kontak" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E8E4DC]">
                    <h2 className="font-bold text-gray-800 font-[Outfit] text-lg">
                      <i className="fas fa-mobile-screen mr-2 text-[#0D7C66]"></i>2. Data Kontak
                    </h2>
                  </div>
                  <div className="p-6">
                    <label htmlFor="wa" className="label">
                      <i className="fab fa-whatsapp mr-1 text-[#0D7C66]"></i>Nomor WhatsApp
                    </label>
                    <input
                      id="wa"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="input"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      <i className="fas fa-info-circle mr-1"></i> Notifikasi status pesanan & konfirmasi pembayaran dikirim ke nomor ini.
                    </p>
                  </div>
                </div>
              </div>

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

                    <div className="flex justify-between items-center border-t border-dashed border-[#E8E4DC] pt-4 mb-5">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-extrabold text-[#1A2332] text-xl tabular-nums">
                        Rp {harga.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      onClick={handleBuatPesanan}
                      disabled={loading}
                      className="btn btn-primary w-full justify-center text-base py-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Membuat pesanan...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock mr-1"></i> Buat Pesanan
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setError(""); setStage("paket"); }}
                      className="text-xs text-gray-400 hover:text-[#0D7C66] w-full text-center mt-3 transition-colors"
                    >
                      <i className="fas fa-arrow-left mr-1"></i> Kembali pilih paket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAHAP 3: PEMBAYARAN ===== */}
          {stage === "bayar" && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-1.5 bg-amber-100 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Menunggu Pembayaran
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-5">
                <div className="px-6 py-4 bg-[#0D7C66] text-white flex items-center gap-2">
                  <i className="fas fa-university"></i>
                  <span className="font-bold font-[Outfit] text-sm">Langkah 1 dari 2 — Transfer ke Rekening BRI</span>
                </div>
                <div className="p-6">
                  <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-6 mb-5 text-center">
                    <p className="text-gray-500 text-xs mb-1">Total yang harus ditransfer</p>
                    <p className="text-4xl font-extrabold font-[Outfit] text-[#0D7C66] tabular-nums mb-3">
                      Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}
                    </p>
                    <button
                      onClick={() => payment?.amount && copyText(String(payment.amount), "Nominal transfer")}
                      className="text-xs font-semibold text-[#0D7C66] bg-white border border-[#0D7C66]/20 rounded-full px-4 py-1.5 hover:bg-[#0D7C66] hover:text-white transition-colors"
                    >
                      <i className="fas fa-copy mr-1"></i> Salin Nominal
                    </button>
                    <p className="text-gray-400 text-xs mt-3">Jangan transfer nominal lain agar mudah diverifikasi</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-dashed border-[#E8E4DC] pb-3">
                      <span className="text-sm text-gray-500">Bank</span>
                      <span className="font-semibold text-[#1A2332]">
                        <i className="fas fa-university mr-1 text-[#0D7C66]"></i>{bank.bank_name}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-dashed border-[#E8E4DC] pb-3">
                      <span className="text-sm text-gray-500">No. Rekening</span>
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-extrabold text-[#0D7C66] text-lg tracking-wider tabular-nums break-all">
                          {bank.bank_account_number}
                        </span>
                        <button
                          onClick={() => copyText(bank.bank_account_number, "Nomor rekening")}
                          className="text-xs font-semibold text-[#0D7C66] border border-[#0D7C66]/20 rounded-full px-3 py-1 hover:bg-[#0D7C66] hover:text-white transition-colors shrink-0"
                        >
                          <i className="fas fa-copy mr-1"></i> Salin
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm text-gray-500">Atas Nama</span>
                      <span className="font-semibold text-[#1A2332]">{bank.bank_account_name}</span>
                    </div>
                  </div>

                  {paymentId && (
                    <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
                      <i className="fas fa-tag"></i> No. Order: <span className="font-mono font-bold text-[#1A2332]">#{paymentId.slice(0, 8).toUpperCase()}</span>
                      <button onClick={() => paymentId && copyText(paymentId, "Nomor order")} className="text-[#0D7C66]" title="Salin nomor order">
                        <i className="fas fa-copy"></i>
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-5">
                <p className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <i className="fas fa-route text-[#0D7C66]"></i> Setelah transfer
                </p>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D7C66]/10 text-[#0D7C66] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    Transfer sesuai nominal di atas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D7C66]/10 text-[#0D7C66] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    Klik <strong>Saya Sudah Transfer</strong> lalu kirim bukti
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D7C66]/10 text-[#0D7C66] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    Admin verifikasi maksimal <strong>24 jam</strong>, paket langsung aktif
                  </li>
                </ol>
                {!waSent && (
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                    <i className="fab fa-whatsapp text-[#25D366]"></i> Notifikasi status pesanan akan dikirim via WhatsApp ke {whatsapp || "nomor kamu"}
                  </p>
                )}
              </div>

              <button
                onClick={() => { setError(""); setStage("konfirmasi"); }}
                className="btn btn-primary w-full justify-center text-base py-3.5"
              >
                <i className="fas fa-check-circle mr-1"></i> Saya Sudah Transfer
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                <i className="fas fa-shield-halved mr-1"></i> Garansi 30 hari: tidak hemat waktu? Uang kembali penuh
              </p>
            </div>
          )}

          {/* ===== TAHAP 4: KONFIRMASI ===== */}
          {stage === "konfirmasi" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                <div className="px-6 py-4 bg-[#0D7C66] text-white flex items-center gap-2">
                  <i className="fas fa-paper-plane"></i>
                  <span className="font-bold font-[Outfit] text-sm">Langkah 2 dari 2 — Konfirmasi Transfer</span>
                </div>
                <div className="p-6">
                  <label htmlFor="wa" className="label">
                    <i className="fab fa-whatsapp mr-1 text-[#0D7C66]"></i>Nomor WhatsApp
                  </label>
                  <input
                    id="wa"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="input mb-4"
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mb-4">
                    <i className="fas fa-info-circle mr-1"></i> Nomor ini dipakai untuk notifikasi status pesanan via WhatsApp.
                  </p>
                  <label className="label">Catatan / Bukti Transfer</label>
                  <textarea
                    className="input min-h-[100px]"
                    placeholder="Contoh: Sudah transfer Rp 29.000 dari a.n. Bu Ratna (No. HP 08xx) pada tanggal 2026-08-07"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2 mb-5">
                    <i className="fas fa-info-circle mr-1"></i> Beri tahu nominal & pengirim agar verifikasi admin lebih cepat.
                  </p>
                  <button onClick={handleKirimBukti} disabled={loading} className="btn btn-primary w-full justify-center">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-1"></i> Kirim Konfirmasi
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setError(""); setStage("bayar"); }}
                    className="text-xs text-gray-400 hover:text-[#0D7C66] w-full text-center mt-3 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Kembali ke detail transfer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAHAP 5: SUKSES ===== */}
          {stage === "sukses" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-green-600 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-extrabold font-[Outfit] text-[#1A2332] mb-2">
                    Terima Kasih! Pesanan Kamu Diterima
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Pembayaran kamu sedang menunggu verifikasi admin (maksimal 24 jam). Paket akan aktif otomatis setelah diverifikasi.
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-1.5 bg-amber-100 text-amber-700 mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Menunggu Verifikasi Admin
                  </div>

                  <div className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">No. Order</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A2332] font-mono">#{paymentId?.slice(0, 8).toUpperCase()}</span>
                        <button onClick={() => paymentId && copyText(paymentId, "Nomor order")} className="text-[#0D7C66] text-xs" title="Salin nomor order">
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Paket</span>
                      <span className="text-xs font-bold text-[#1A2332]">{planInfo ? `${planInfo.name} — ${planInfo.duration}` : ringkasan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Total Transfer</span>
                      <span className="text-xs font-extrabold text-[#1A2332]">Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">No. WhatsApp</span>
                      <span className="text-xs font-bold text-[#1A2332]">{whatsapp || "-"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/dashboard" className="btn btn-primary flex-1 justify-center">
                      <i className="fas fa-home mr-1"></i> Ke Dashboard
                    </Link>
                    {bank.wa_admin && (
                      <a
                        href={`https://wa.me/${bank.wa_admin}?text=${encodeURIComponent(
                          `Halo Jurnal Guru, saya sudah transfer.\nNo. Order: #${paymentId ?? "-"}\nNominal: Rp ${payment?.amount?.toLocaleString("id-ID") ?? "-"}\nPaket: ${planInfo ? `${planInfo.name} (${planInfo.duration})` : "-"}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline flex-1 justify-center border-[#25D366] text-[#1fb457] hover:bg-[#25D366]/10"
                      >
                        <i className="fab fa-whatsapp mr-1"></i> Konfirmasi via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}