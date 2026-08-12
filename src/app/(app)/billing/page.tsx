"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/useApi";

interface Payment {
  id: string;
  username: string;
  plan: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName: string;
  notes: string;
  createdAt: string;
  verifiedAt: string;
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [bank, setBank] = useState({ bank_name: "BRI", bank_account_number: "", bank_account_name: "", bank_note: "" });

  function load() {
    apiGet<any>("/api/payments?admin=1").then((r) => {
      if (r.ok && r.data?.payments) setPayments(r.data.payments);
      if (r.ok && r.data?.bank) {
        setBank({
          bank_name: r.data.bank.bank_name,
          bank_account_number: r.data.bank.bank_account_number,
          bank_account_name: r.data.bank.bank_account_name,
          bank_note: r.data.bank.bank_note,
        });
      }
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  const pending = payments.filter((p) => p.status === "pending");

  async function action(payId: string, act: "verifikasi" | "tolak") {
    const r = await apiPatch<any>(`/api/payments/${payId}`, { status: act });
    setMsg(r.ok ? { ok: true, text: r.msg || "Berhasil" } : { ok: false, text: r.msg || "Gagal" });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-2">Tagihan & Pembayaran</h1>
      <p className="text-sm text-gray-500 mb-6">Verifikasi pembayaran transfer bank dan kelola pengaturan rekening.</p>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Bank Settings */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-6">
        <h2 className="font-bold text-[#1A2332] mb-4"><i className="fas fa-building-columns text-[#0D7C66] mr-2"></i>Rekening Penerima</h2>
        <div className="p-4 bg-[#fcfbf8] rounded-xl space-y-1 text-sm">
          <p>Bank: <b>{bank.bank_name || "-"}</b></p>
          <p>No. Rekening: <b>{bank.bank_account_number || "-"}</b></p>
          <p>Atas Nama: <b>{bank.bank_account_name || "-"}</b></p>
          {bank.bank_note && <p className="text-gray-500 text-xs">{bank.bank_note}</p>}
        </div>
        <p className="mt-3 text-xs text-gray-500">Ubah rekening di menu <b>Pengaturan</b>.</p>
      </div>

      {/* Pending payments */}
      <h2 className="font-bold text-[#1A2332] mb-3"><i className="fas fa-hourglass-half text-[#E8A317] mr-2"></i>Menunggu Verifikasi ({pending.length})</h2>
      {pending.length === 0 && !loading && (
        <p className="text-sm text-gray-400 mb-6 py-4 text-center bg-white rounded-xl border border-dashed border-[#E8E4DC]">Belum ada pembayaran yang menunggu verifikasi.</p>
      )}

      <div className="space-y-4 mb-8">
        {pending.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <div>
                <p className="font-bold text-[#1A2332]">{p.username}</p>
                <p className="text-xs text-gray-500">{p.plan ? `Paket ${p.plan}` : "Paket"} &middot; {p.createdAt ? new Date(p.createdAt).toLocaleString("id-ID") : "-"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-[#0D7C66]">Rp {p.amount.toLocaleString("id-ID")}</span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full uppercase">{p.status}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p><b>Bank:</b> {p.bankName || "-"}</p>
              {p.notes && <p><b>Catatan:</b> {p.notes}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => action(p.id, "verifikasi")} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all">
                <i className="fas fa-check mr-1"></i> Terima & Aktifkan
              </button>
              <button onClick={() => action(p.id, "tolak")} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold border border-red-200 transition-colors">
                <i className="fas fa-times mr-1"></i> Tolak
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <h2 className="text-xl font-bold text-[#1A2332] mb-3"><i className="fas fa-history text-gray-400 mr-2"></i>Riwayat Pembayaran</h2>
      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#fcfbf8]">
            <tr className="text-left text-gray-500 text-xs uppercase">
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada riwayat pembayaran.</td></tr>
            )}
            {payments.filter((p) => p.status !== "pending").map((p) => (
              <tr key={p.id} className="border-t border-[#F0EDE6]">
                <td className="px-4 py-3">{p.username}</td>
                <td className="px-4 py-3 font-semibold">Rp {p.amount.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full uppercase ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("id-ID") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}