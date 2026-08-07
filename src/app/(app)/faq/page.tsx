"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Apakah Jurnal Guru benar-benar gratis?",
    a: "Ya. Paket Gratis aktif selamanya tanpa kartu kredit: 1 kelas, absensi, nilai, jurnal, jadwal, dan rekap. Tidak ada batas waktu.",
  },
  {
    q: "Apa bedanya paket Gratis dan Pro?",
    a: "Gratis terbatas 1 kelas dan tanpa export PDF. Pro (Rp 29.000/bln) memberi unlimited kelas + Export PDF nilai/rekap + laporan lanjutan.",
  },
  {
    q: "Bagaimana cara membayar paket Pro?",
    a: "Pilih paket Pro, lalu transfer ke rekening BRI yang tampil di halaman pembayaran. Isi catatan bukti transfer, admin akan verifikasi dan paket aktif otomatis.",
  },
  {
    q: "Berapa lama proses aktivasi setelah transfer?",
    a: "Biasanya dalam 1x24 jam kerja. Setelah admin verifikasi, akun langsung menjadi Pro. Anda bisa cek status di menu Langganan.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Data tersimpan di database Cloudflare yang terenkripsi. Aktivitas login & perubahan tercatat di Activity Log. Anda juga bisa export/backup data.",
  },
  {
    q: "Bisa dipakai di HP?",
    a: "Bisa. Jurnal Guru responsif dan bisa dipakai dari HP, tablet, maupun laptop.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Ada. Kami memberikan garansi 30 hari uang kembali tanpa pertanyaan untuk paket berbayar.",
  },
  {
    q: "Bagaimana kalau saya lupa password?",
    a: "Hubungi admin/support via WhatsApp atau menu bantuan. Kami akan resetkan password Anda.",
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-2">Pertanyaan Umum (FAQ)</h1>
      <p className="text-sm text-gray-500 mb-6">Hal-hal yang sering ditanyakan pengguna Jurnal Guru.</p>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="font-semibold text-[#1A2332] text-sm">{f.q}</span>
              <i className={`fas fa-chevron-down text-gray-400 transition-transform text-xs ${openIdx === i ? "rotate-180" : ""}`}></i>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}