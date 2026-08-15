"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/useApi";

function KonfirmasiInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bank, setBank] = useState<{ bank_name: string; bank_account_number: string; bank_account_name: string; bank_note: string }>({
    bank_name: "BRI",
    bank_account_name: "Jurnal Guru",
    bank_account_number: "",
    bank_note: "",
  });
  const [payment, setPayment] = useState<{ amount: number; planId?: string } | null>(null);
  const [notes, setNotes] = useState("");

  const PLAN_LABEL: Record<string, { name: string; duration: string }> = {
    pro_1m: { name: "Pro", duration: "1 bulan" },
    pro_3m: { name: "Pro", duration: "3 bulan" },
    pro_6m: { name: "Pro", duration: "6 bulan" },
    pro_12m: { name: "Pro", duration: "1 tahun" },
    pro_24m: { name: "Pro", duration: "2 tahun" },
    premium: { name: "Premium", duration: "Selamanya (lifetime)" },
    pro: { name: "Pro", duration: "1 bulan" },
    sekolah: { name: "Premium", duration: "Selamanya (lifetime)" },
  };
  const planInfo = payment?.planId ? PLAN_LABEL[payment.planId] : null;

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    apiGet<{ payment: { amount: number; notes?: string; planId?: string } }>(`/api/payments/${paymentId}`)
      .then((r) => {
        if (r.ok) {
          const p = r.data?.payment;
          if (p) {
            setPayment({ amount: p.amount, planId: p.planId });
            setNotes(p.notes ?? "");
          }
        } else {
          setError(r.msg || "Pembayaran tidak ditemukan");
        }
      })
      .catch(() => setError("Koneksi gagal"))
      .finally(() => setLoading(false));
    apiGet<{ bank: { bank_name: string; bank_account_number: string; bank_account_name: string; bank_note: string } }>("/api/payments")
      .then((r) => {
        if (r.ok && r.data?.bank) {
          setBank(r.data.bank);
        }
      })
      .catch(() => {});
  }, [paymentId]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await apiPatch(`/api/payments/${paymentId}`, { notes });
      if (!res.ok) setError(res.msg || "Gagal menyimpan");
    } catch {
      setError("Koneksi gagal");
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="bg-gradient-to-br from-[#1A2332] via-[#0a5c4c] to-[#0D7C66] text-white">
        <div className="max-w-2xl mx-auto px-5 py-12 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-receipt text-[#E8A317] text-2xl"></i>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[Outfit] mb-2">Selesaikan Pembayaran</h1>
          <p className="text-white/70">Transfer sesuai nominal ke rekening di bawah, lalu konfirmasi.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
            <p className="text-red-600 text-sm text-center"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>
          </div>
        )}

        {/* Nominal */}
        <div className="bg-gradient-to-r from-[#0D7C66] to-[#0A6352] rounded-2xl p-6 md:p-8 text-white mb-6 text-center">
          <p className="text-white/70 text-sm mb-1">Total yang harus ditransfer</p>
          <p className="text-4xl font-extrabold font-[Outfit] tabular-nums">
            Rp {payment?.amount?.toLocaleString("id-ID") ?? "-"}
          </p>
          {planInfo && (
            <p className="text-white/80 text-sm mt-2">
              <span className="bg-white/10 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
                <i className="fas fa-crown text-[#E8A317]"></i>
                {planInfo.name} &middot; {planInfo.duration}
              </span>
            </p>
          )}
          <p className="text-white/60 text-xs mt-2">Jangan transfer nominal lain agar mudah diverifikasi</p>
        </div>

        {/* Rekening */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center gap-2">
            <i className="fas fa-university text-[#0D7C66]"></i>
            <span className="font-bold text-gray-800 font-[Outfit]">Transfer ke Rekening</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-dashed border-[#E8E4DC] pb-3">
              <span className="text-sm text-gray-500">Bank</span>
              <span className="font-semibold text-[#1A2332]">{bank.bank_name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-[#E8E4DC] pb-3">
              <span className="text-sm text-gray-500">No. Rekening</span>
              <span className="font-extrabold text-[#0D7C66] text-lg tracking-wider tabular-nums">
                {bank.bank_account_number}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Atas Nama</span>
              <span className="font-semibold text-[#1A2332]">{bank.bank_account_name}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-6">
          <label className="label">Catatan / Bukti Transfer</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="Contoh: Sudah transfer Rp 29.000 dari a.n. Bu Ratna (No. HP 08xx) pada tanggal 2026-08-07"            value={notes}
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
                <i className="fas fa-paper-plane mr-1"></i> Simpan Catatan Pembayaran
              </>
            )}
          </button>
        </div>

        {/* Help */}
        <div className="bg-[#0D7C66]/5 border border-[#0D7C66]/15 rounded-2xl p-5 text-sm text-gray-600 mb-8">
          <p className="font-semibold text-[#0D7C66] mb-2 flex items-center gap-2">
            <i className="fas fa-circle-question"></i> Butuh bantuan?
          </p>
          {bank.bank_note && <p className="mb-1">{bank.bank_note}</p>}
          <p>
            Setelah transfer, admin akan memverifikasi dan paket akan aktif otomatis. Hubungi kami via WhatsApp untuk pertanyaan.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn btn-outline"><i className="fas fa-home mr-1"></i> Ke Dashboard</Link>
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