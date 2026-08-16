"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/useApi";
import { useToast } from "@/components/Feedback";
import OrderSteps from "@/components/OrderSteps";

function KonfirmasiInner() {
  const searchParams = useSearchParams();
  const { show } = useToast();
  const paymentId = searchParams.get("payment");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bank, setBank] = useState<{ bank_name: string; bank_account_number: string; bank_account_name: string; bank_note: string; wa_admin?: string }>({
    bank_name: "BRI",
    bank_account_name: "Jurnal Guru",
    bank_account_number: "",
    bank_note: "",
  });
  const [payment, setPayment] = useState<{ amount: number; planId?: string; whatsapp?: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const PLAN_LABEL: Record<string, { name: string; duration: string }> = {
    pro_6m: { name: "Pro", duration: "6 bulan" },
    premium_6m: { name: "Premium", duration: "6 bulan" },
    premium: { name: "Premium", duration: "6 bulan" },
    pro: { name: "Pro", duration: "6 bulan" },
    sekolah: { name: "Premium", duration: "6 bulan" },
  };
  const planInfo = payment?.planId ? PLAN_LABEL[payment.planId] : null;

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    apiGet<{ payment: { amount: number; notes?: string; planId?: string; whatsapp?: string } }>(`/api/payments/${paymentId}`)
      .then((r) => {
        if (r.ok) {
          const p = r.data?.payment;
          if (p) {
            setPayment({ amount: p.amount, planId: p.planId, whatsapp: p.whatsapp });
            setNotes(p.notes ?? "");
            setWhatsapp(p.whatsapp ?? "");
          }
        } else {
          setError(r.msg || "Pembayaran tidak ditemukan");
        }
      })
      .catch(() => setError("Koneksi gagal"))
      .finally(() => setLoading(false));
    apiGet<{ bank: { bank_name: string; bank_account_number: string; bank_account_name: string; bank_note: string; wa_admin?: string } }>("/api/payments")
      .then((r) => {
        if (r.ok && r.data?.bank) {
          setBank(r.data.bank);
        }
      })
      .catch(() => {});
  }, [paymentId]);

  async function handleSave() {
    const wa = whatsapp.replace(/[^\d]/g, "");
    if (!/^(08|62|8)\d{8,13}$/.test(wa)) {
      setError("Nomor WhatsApp tidak valid, contoh: 081234567890");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await apiPatch(`/api/payments/${paymentId}`, { notes, whatsapp: wa });
      if (!res.ok) setError(res.msg || "Gagal menyimpan");
      else show("Nomor WhatsApp & catatan tersimpan", "success");
    } catch {
      setError("Koneksi gagal");
    } finally {
      setSaving(false);
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

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8 text-center max-w-md">
          <h1 className="font-bold text-gray-800 text-lg mb-2">Tidak ada order</h1>
          <p className="text-sm text-gray-500 mb-4">Silakan pilih paket terlebih dahulu.</p>
          <Link href="/checkout" className="btn btn-primary"><i className="fas fa-arrow-left mr-1"></i> Kembali ke Checkout</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] pb-16">
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-10">
          <Link href="/checkout" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left"></i> Kembali ke Checkout
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-6 text-center">
            Selesaikan Pembayaran
          </h1>
          <OrderSteps step={2} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 pt-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
            <p className="text-red-600 text-sm text-center"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kiri: langkah pembayaran */}
          <div className="lg:col-span-2 space-y-5">
            {/* Langkah 1: Transfer */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#0D7C66] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
                <span className="font-bold text-gray-800 font-[Outfit]">Transfer ke Rekening BRI</span>
              </div>
              <div className="p-6">
                <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-5 mb-5 text-center">
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
                  <div className="flex justify-between items-center border-b border-dashed border-[#E8E4DC] pb-3">
                    <span className="text-sm text-gray-500">Bank</span>
                    <span className="font-semibold text-[#1A2332]">
                      <i className="fas fa-university mr-1 text-[#0D7C66]"></i>{bank.bank_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-dashed border-[#E8E4DC] pb-3">
                    <span className="text-sm text-gray-500">No. Rekening</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0D7C66] text-lg tracking-wider tabular-nums">
                        {bank.bank_account_number}
                      </span>
                      <button
                        onClick={() => copyText(bank.bank_account_number, "Nomor rekening")}
                        className="text-xs font-semibold text-[#0D7C66] border border-[#0D7C66]/20 rounded-full px-3 py-1 hover:bg-[#0D7C66] hover:text-white transition-colors"
                      >
                        <i className="fas fa-copy mr-1"></i> Salin
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Atas Nama</span>
                    <span className="font-semibold text-[#1A2332]">{bank.bank_account_name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Langkah 2: Konfirmasi */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#0D7C66] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
                <span className="font-bold text-gray-800 font-[Outfit]">Konfirmasi Transfer</span>
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
                <p className="text-xs text-gray-400 mt-2">
                  <i className="fas fa-info-circle mr-1"></i> Beri tahu nominal & pengirim agar verifikasi admin lebih cepat.
                </p>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full justify-center mt-4">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-1"></i> Kirim Bukti Transfer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Langkah 3: Tunggu verifikasi */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#0D7C66] text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
                <span className="font-bold text-gray-800 font-[Outfit]">Tunggu Verifikasi Admin</span>
              </div>
              <div className="p-6 text-sm text-gray-600 space-y-2">
                <p className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-[#0D7C66] mt-0.5"></i>
                  Setelah transfer, admin memverifikasi maksimal <strong>24 jam</strong>.
                </p>
                <p className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-[#0D7C66] mt-0.5"></i>
                  Paket aktif otomatis dan kamu dapat email konfirmasi.
                </p>
                {bank.bank_note && (
                  <p className="flex items-start gap-2">
                    <i className="fas fa-circle-question text-[#E8A317] mt-0.5"></i>
                    {bank.bank_note}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Kanan: ringkasan pesanan sticky */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-[#1A2332] text-white flex items-center gap-2">
                <i className="fas fa-file-invoice text-[#E8A317]"></i>
                <span className="font-bold font-[Outfit]">Detail Pesanan</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 pb-4 border-b border-[#E8E4DC] mb-4">
                  <span className="text-xs font-semibold text-gray-400">No. Order:</span>
                  <span className="text-xs font-bold text-[#1A2332] font-mono truncate">#{paymentId}</span>
                  <button
                    onClick={() => paymentId && copyText(paymentId, "Nomor order")}
                    className="text-[#0D7C66] text-xs ml-auto"
                    title="Salin nomor order"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>

                {whatsapp && (
                  <div className="flex items-center gap-2 pb-4 border-b border-[#E8E4DC] mb-4">
                    <span className="text-xs font-semibold text-gray-400">No. WhatsApp:</span>
                    <span className="text-xs font-bold text-[#1A2332] tabular-nums">{whatsapp}</span>
                    <button
                      onClick={() => copyText(whatsapp, "Nomor WhatsApp")}
                      className="text-[#0D7C66] text-xs ml-auto"
                      title="Salin nomor WhatsApp"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                )}

                <div className={`inline-flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 mb-5 ${"bg-amber-100 text-amber-700"}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Menunggu Pembayaran
                </div>

                <div className="flex items-center gap-3 pb-4 border-b border-[#E8E4DC] mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${planInfo?.name === "Premium" ? "bg-gradient-to-br from-[#E8A317] to-[#ca8a04]" : "bg-[#0D7C66]"}`}>
                    <i className={`${planInfo?.name === "Premium" ? "fas fa-crown" : "fas fa-chart-bar"}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1A2332] text-sm">
                      {planInfo ? `${planInfo.name} — ${planInfo.duration}` : "Paket"}
                    </p>
                    <p className="text-xs text-gray-400">Berlaku sejak verifikasi</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-dashed border-[#E8E4DC] pt-4 mb-5">
                  <span className="font-bold text-gray-800">Total Transfer</span>
                  <span className="font-extrabold text-[#1A2332] text-xl tabular-nums">
                    Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}
                  </span>
                </div>

                <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-xl p-4 text-xs text-gray-600 mb-5">
                  <p className="font-semibold text-[#0D7C66] mb-1 flex items-center gap-2">
                    <i className="fab fa-whatsapp"></i> Butuh bantuan?
                  </p>
                  <p>
                    Hubungi kami via WhatsApp untuk pertanyaan atau kendala pembayaran.
                  </p>
                  {bank.wa_admin && (
                    <a
                      href={`https://wa.me/${bank.wa_admin}?text=${encodeURIComponent(
                        `Halo Jurnal Guru, saya butuh bantuan.\nNo. Order: #${paymentId}\nNominal: Rp ${payment?.amount?.toLocaleString("id-ID") ?? "-"}\nNama Paket: ${planInfo ? `${planInfo.name} (${planInfo.duration})` : "-"}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb457] text-white font-semibold rounded-xl px-4 py-2.5 transition-colors w-full justify-center"
                    >
                      <i className="fab fa-whatsapp text-base"></i> Chat Admin via WhatsApp
                    </a>
                  )}
                </div>

                <Link href="/dashboard" className="btn btn-outline w-full justify-center">
                  <i className="fas fa-home mr-1"></i> Ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KonfirmasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div></div>}>
      <KonfirmasiInner />
    </Suspense>
  );
}