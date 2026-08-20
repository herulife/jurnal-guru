"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiPatch } from "@/lib/useApi";
import { trackOnce } from "@/lib/track-client";
import { invoiceNumber } from "@/lib/invoice";
import { useToast } from "@/components/Feedback";
import OrderSteps from "@/components/OrderSteps";

const PRO_DURATIONS = [
  { id: "pro_6m", label: "6 Bulan", price: 29000, perBulan: 4833, months: 6 },
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

type Stage = "paket" | "bayar" | "konfirmasi" | "pending" | "sukses" | "rejected";

type PaymentData = {
  amount: number;
  planId?: string;
  whatsapp?: string;
  notes?: string;
  status?: string;
  proofUrl?: string;
  verifiedAt?: string | null;
  subStartedAt?: string | null;
  subExpiresAt?: string | null;
  createdAt?: string;
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const hydratedRef = useRef(false);

  const PLAN_LABEL: Record<string, { name: string; duration: string }> = {
    pro_6m: { name: "Pro", duration: "6 bulan" },
    premium_6m: { name: "Premium", duration: "6 bulan" },
  };

  useEffect(() => {
    trackOnce("checkout_viewed", "checkout");
    apiGet("/api/auth/check")
      .then((r) => {
        setAuthState(r.ok ? "ok" : "guest");
        if (r.ok) {
          apiGet<{ bank: BankInfo }>("/api/payments")
            .then((r2) => {
              if (r2.ok && r2.data?.bank) setBank(r2.data.bank);
            })
            .catch(() => {});
        }
      })
      .catch(() => setAuthState("guest"));

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
          setProofUrl(p.proofUrl ?? "");
          if (hydratedRef.current) return;
          hydratedRef.current = true;
          if (p.status === "paid") setStage("sukses");
          else if (p.status === "rejected") setStage("rejected");
          else if (p.status === "pending") setStage(p.proofUrl ? "pending" : p.notes ? "konfirmasi" : "bayar");
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
      if (proofFile) {
        const fd = new FormData();
        fd.append("file", proofFile);
        const up = await fetch(`/api/payments/${paymentId}/proof`, { method: "POST", body: fd });
        const upJson = await up.json();
        if (!upJson.ok) {
          setError(upJson.msg || "Gagal mengunggah bukti");
          show(upJson.msg || "Gagal mengunggah bukti", "error");
          return;
        }
        setProofUrl(upJson.data?.proofUrl ?? "");
      }
      const res = await apiPatch(`/api/payments/${paymentId}`, {
        notes,
        whatsapp: whatsapp.replace(/[^\d]/g, ""),
      });
      if (!res.ok) {
        setError(res.msg || "Gagal menyimpan");
        return;
      }
      show("Konfirmasi terkirim, terima kasih!", "success");
      setStage("pending");
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
            {stage === "paket" ? "Checkout — Pesanan Anda" : "Selesaikan Pembayaran"}
          </h1>
          <OrderSteps step={stage === "paket" ? 1 : stage === "bayar" ? 2 : 3} />
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
                      onClick={() => { setError(""); setStage("bayar"); }}
                      className="btn btn-primary w-full justify-center text-base py-3"
                    >
                      <i className="fas fa-arrow-right mr-1"></i> Lanjut ke Pembayaran
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      <i className="fas fa-shield-halved mr-1"></i> Aman &amp; Terpercaya · Tanpa auto-debit · Verifikasi manual · Transparan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAHAP 2: PEMBAYARAN ===== */}
          {stage === "bayar" && (
            <div className="max-w-2xl mx-auto">
              {paymentId && (
                <div className="flex flex-col items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-1.5 bg-amber-100 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Menunggu Pembayaran
                  </span>
                  <span className="text-xs text-gray-400">
                    Order ID: <span className="font-mono font-bold text-[#1A2332]">{invoiceNumber(paymentId)}</span>
                  </span>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-5">
                <div className="px-6 py-4 bg-[#0D7C66] text-white flex items-center gap-2">
                  <i className="fas fa-university"></i>
                  <span className="font-bold font-[Outfit] text-sm">Silakan Transfer ke Rekening</span>
                </div>
                <div className="p-6">
                  <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-6 mb-5 text-center">
                    <p className="text-gray-500 text-xs mb-1">Total yang harus ditransfer</p>
                    <p className="text-4xl font-extrabold font-[Outfit] text-[#0D7C66] tabular-nums mb-3">
                      Rp {(payment?.amount ?? harga).toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => copyText(String(payment?.amount ?? harga), "Nominal transfer")}
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

              {paymentId ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-5">
                    <div className="px-6 py-4 border-b border-[#E8E4DC]">
                      <h2 className="font-bold text-gray-800 font-[Outfit] text-sm flex items-center gap-2">
                        <i className="fab fa-whatsapp text-[#0D7C66]"></i> Nomor WhatsApp
                      </h2>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-gray-400 mb-3">
                        Notifikasi status pesanan & konfirmasi pembayaran dikirim ke nomor ini.
                      </p>
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
                      <button
                        onClick={handleBuatPesanan}
                        disabled={loading}
                        className="btn btn-primary w-full justify-center text-base py-3 mt-4"
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
                </>
              )}
              <p className="text-center text-xs text-gray-400 mt-3">
                <i className="fas fa-shield-halved mr-1"></i> Aman &amp; Terpercaya · Tanpa auto-debit · Verifikasi manual · Transparan
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
                  <label className="label">Upload Bukti Transfer</label>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#0D7C66]/30 bg-[#0D7C66]/5 rounded-2xl p-6 cursor-pointer hover:border-[#0D7C66]/60 transition-colors mb-3">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-[#0D7C66]"></i>
                    <span className="text-sm font-semibold text-[#0D7C66]">
                      {proofFile ? proofFile.name : "Pilih file bukti transfer"}
                    </span>
                    <span className="text-xs text-gray-400">Format: JPG / PNG / PDF · maks 5 MB</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {proofUrl && (
                    <p className="text-xs text-green-600 mb-3 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check"></i> Bukti terunggah — bisa diganti jika salah pilih.
                    </p>
                  )}
                  <label className="label">Catatan Transfer (opsional)</label>
                  <textarea
                    className="input min-h-[80px]"
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

          {/* ===== TAHAP 5: MENUNGGU VERIFIKASI ===== */}
          {stage === "pending" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-5">
                <div className="px-6 py-4 bg-amber-500 text-white flex items-center gap-2">
                  <i className="fas fa-hourglass-half"></i>
                  <span className="font-bold font-[Outfit] text-sm">Pesanan Anda — Menunggu Verifikasi</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between mb-5">
                    <div>
                      <p className="text-xs text-gray-400">Order ID</p>
                      <p className="font-mono font-bold text-[#1A2332]">{paymentId ? invoiceNumber(paymentId) : "-"}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-1.5 bg-amber-100 text-amber-700 self-start">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Menunggu Verifikasi
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      { done: true, label: "Pesanan Dibuat", sub: "Order berhasil dibuat" },
                      { done: true, label: "Pembayaran Dikonfirmasi", sub: "Bukti transfer diterima" },
                      { done: false, active: true, label: "Menunggu Verifikasi", sub: "Admin sedang memeriksa bukti" },
                      { done: false, label: "Paket Aktif", sub: "Akses fitur langsung terbuka" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.done ? "bg-[#0D7C66] text-white" : s.active ? "bg-amber-100 text-amber-600 border-2 border-amber-400" : "bg-gray-100 text-gray-300"}`}>
                          {s.done ? <i className="fas fa-check text-sm"></i> : <span className="text-sm font-bold">{s.active ? "●" : "○"}</span>}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${s.done ? "text-[#1A2332]" : s.active ? "text-amber-600" : "text-gray-400"}`}>{s.label}</p>
                          <p className="text-xs text-gray-400">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 text-left space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Paket</span>
                      <span className="text-xs font-bold text-[#1A2332]">{planInfo ? `${planInfo.name} — ${planInfo.duration}` : ringkasan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Total</span>
                      <span className="text-xs font-extrabold text-[#1A2332]">Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Tanggal Pesanan</span>
                      <span className="text-xs font-bold text-[#1A2332]">
                        {payment?.createdAt ? new Date(payment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className="text-xs font-bold text-amber-600">Menunggu Verifikasi</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 flex items-start gap-1.5">
                    <i className="fas fa-info-circle mt-0.5 text-[#0D7C66]"></i>
                    Pembayaran Anda sedang diperiksa oleh admin. Setelah diverifikasi, paket aktif otomatis dan Anda akan mendapat notifikasi via WhatsApp/email.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/dashboard" className="btn btn-outline flex-1 justify-center">
                      <i className="fas fa-home mr-1"></i> Ke Dashboard
                    </Link>
                    {bank.wa_admin && (
                      <a
                        href={`https://wa.me/${bank.wa_admin}?text=${encodeURIComponent(
                          `Halo Jurnal Guru, saya sudah transfer.\nNo. Order: ${paymentId ? invoiceNumber(paymentId) : "-"}\nNominal: Rp ${payment?.amount?.toLocaleString("id-ID") ?? "-"}\nPaket: ${planInfo ? `${planInfo.name} (${planInfo.duration})` : "-"}`
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

          {/* ===== TAHAP 6: PEMBAYARAN BERHASIL ===== */}
          {stage === "sukses" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-green-600 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-extrabold font-[Outfit] text-[#1A2332] mb-2">
                    Pembayaran Berhasil!
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Selamat! Paket Anda sudah aktif.
                  </p>

                  <div className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Order ID</span>
                      <span className="text-xs font-bold text-[#1A2332] font-mono">{paymentId ? invoiceNumber(paymentId) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Paket</span>
                      <span className="text-xs font-bold text-[#1A2332]">{planInfo ? `${planInfo.name} — ${planInfo.duration}` : ringkasan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Masa Aktif</span>
                      <span className="text-xs font-bold text-[#1A2332]">
                        {payment?.subStartedAt
                          ? `${new Date(payment.subStartedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} — ${payment.subExpiresAt ? new Date(payment.subExpiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "selamanya"}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className="text-xs font-bold text-green-600">
                        <i className="fas fa-circle-check mr-1"></i>Aktif
                      </span>
                    </div>
                  </div>

                  <Link href="/dashboard" className="btn btn-primary w-full justify-center text-base py-3">
                    <i className="fas fa-home mr-1"></i> Kembali ke Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAHAP 7: PEMBAYARAN DITOLAK ===== */}
          {stage === "rejected" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-xmark text-red-600 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-extrabold font-[Outfit] text-[#1A2332] mb-2">
                    Pembayaran Tidak Berhasil
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Status: <span className="font-bold text-red-500">Ditolak</span> — bukti transfer tidak dapat diverifikasi.
                  </p>

                  <div className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Order ID</span>
                      <span className="text-xs font-bold text-[#1A2332] font-mono">{paymentId ? invoiceNumber(paymentId) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Paket</span>
                      <span className="text-xs font-bold text-[#1A2332]">{planInfo ? `${planInfo.name} — ${planInfo.duration}` : ringkasan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Total</span>
                      <span className="text-xs font-extrabold text-[#1A2332]">Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}</span>
                    </div>
                    {payment?.notes && (
                      <div className="flex justify-between gap-3">
                        <span className="text-xs text-gray-400">Catatan Admin</span>
                        <span className="text-xs font-bold text-[#1A2332] text-right">{payment.notes}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-5">
                    Pastikan nominal & pengirim sesuai, lalu coba buat pesanan baru.
                  </p>
                  <button
                    onClick={() => {
                      setError(""); setPaymentId(null); setPayment(null); setNotes(""); setProofFile(null); setProofUrl(""); setStage("paket");
                    }}
                    className="btn btn-primary w-full justify-center text-base py-3"
                  >
                    <i className="fas fa-rotate-left mr-1"></i> Coba Pembayaran Lagi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}