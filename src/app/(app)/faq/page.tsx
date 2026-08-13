const faqs = [
  {
    q: "Apakah Jurnal Guru benar-benar gratis?",
    a: "Ya. Paket Gratis aktif selamanya tanpa kartu kredit: dashboard, data siswa/kelas, jadwal, absensi, rekap & cetak presensi, jurnal mengajar, kalender, dan surat. Tidak ada batas waktu.",
  },
  {
    q: "Apa bedanya paket Gratis, Pro, dan Premium?",
    a: "Gratis: fitur dasar presensi & jurnal. Pro (Rp 29.000/bln): gratis + nilai, rekap nilai, dan generate kelompok belajar. Premium (Rp 49.000/bln): semua fitur Pro + generate LCKH dan LKB bagi pegawai.",
  },
  {
    q: "Bagaimana cara membayar paket Pro/Premium?",
    a: "Pilih paket, lalu transfer ke rekening BRI yang tampil di halaman pembayaran. Isi catatan bukti transfer, admin akan verifikasi dan paket aktif otomatis.",
  },
  {
    q: "Berapa lama proses aktivasi setelah transfer?",
    a: "Biasanya dalam 1x24 jam kerja. Setelah admin verifikasi, paket langsung aktif sesuai yang dipilih. Anda bisa cek status di menu Langganan.",
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
  return (
    <div className="max-w-2xl mx-auto p-6 fade-in">
      <h1 className="text-2xl font-bold text-[#1A2332] mb-2">Pertanyaan Umum (FAQ)</h1>
      <p className="text-sm text-gray-500 mb-6">Hal-hal yang sering ditanyakan pengguna Jurnal Guru.</p>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="card group overflow-hidden">
            <summary className="w-full flex items-center justify-between p-4 text-left cursor-pointer list-none">
              <span className="font-semibold text-[#1A2332] text-sm">{f.q}</span>
              <i className="fas fa-chevron-down text-gray-400 transition-transform text-xs group-open:rotate-180"></i>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
