import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SocialProof from "@/components/SocialProof";
import Navbar from "@/components/Navbar";
import DashboardMockup from "@/components/DashboardMockup";
import Reveal from "@/components/Reveal";

const features = [
  {
    icon: "fa-clipboard-check",
    title: "Absensi Digital",
    desc: "Catat kehadiran siswa dalam 10 detik per kelas. Rekap otomatis, tidak perlu hitung manual.",
  },
  {
    icon: "fa-chart-bar",
    title: "Nilai & KKM",
    desc: "Input nilai lebih cepat. Cek ketuntasan KKM otomatis. Lihat progres siswa.",
  },
  {
    icon: "fa-book-open",
    title: "Jurnal Mengajar",
    desc: "Dokumentasikan materi, kendala, dan solusi setiap pertemuan. Tersusun rapi.",
  },
  {
    icon: "fa-calendar-alt",
    title: "Jadwal Mengajar",
    desc: "Susun jadwal per kelas, hari, dan jam. Semua tampil jelas dalam satu kalender.",
  },
  {
    icon: "fa-user-graduate",
    title: "Data Siswa",
    desc: "Data terpusat yang cepat dicari. Selalu sinkron untuk seluruh kebutuhan.",
  },
  {
    icon: "fa-file-invoice",
    title: "Template Surat",
    desc: "Buat surat resmi sekolah lebih cepat dari template yang sudah disiapkan.",
  },
];

const testimonials = [
  {
    name: "Bu Ratna",
    role: "Guru Matematika",
    text: "Absensi jadi lebih cepat. Rekap otomatis, tidak perlu hitung manual lagi. Hemat waktu!",
  },
  {
    name: "Pak Ahmad",
    role: "Wali Kelas",
    text: "Nilai dan jurnal tersusun rapi. Laporan ke orang tua jadi lebih mudah.",
  },
  {
    name: "Bu Siti",
    role: "Guru Bahasa",
    text: "Semua data siswa ada di satu tempat. Tidak perlu cari di berbagai file lagi.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Jurnal Guru",
        url: "https://guru.benuatech.web.id",
        description:
          "Dashboard guru gratis untuk mengelola absensi, nilai, jurnal mengajar, dan data siswa.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Jurnal Guru",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: "https://guru.benuatech.web.id",
        description:
          "Dashboard guru gratis: absensi digital, nilai, jurnal mengajar, jadwal, data siswa.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#2D3748]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#0a5c4c] to-[#0d7c66]">
        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 text-xs font-semibold bg-[#E8A317] text-[#1A2332] rounded-full px-4 py-1.5 mb-6 lp-anim">
                <i className="fas fa-check-circle"></i> Platform Digital Guru
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold font-[Outfit] leading-tight mb-5 lp-anim lp-d1">
                Dashboard Guru untuk Kelola
                <span className="text-[#E8A317]"> Absensi, Nilai, & Jurnal</span>
              </h1>
              <p className="text-white/80 md:text-lg mb-8 leading-relaxed lp-anim lp-d2">
                Masih admin guru manual? Waktu habis untuk urusan administrasi?
                <strong className="text-white"> Jurnal Guru</strong> bantu semuanya dalam satu tempat — gratis.
              </p>
              <div className="flex flex-wrap items-center gap-4 lp-anim lp-d3">
                <Link href="/register" className="inline-flex items-center gap-2 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl lp-shimmer-wrap">
                  <i className="fas fa-rocket"></i> Coba Gratis Sekarang
                </Link>
                <a href="#fitur" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition-all">
                  Lihat Fitur <i className="fas fa-arrow-down"></i>
                </a>
              </div>
              <p className="text-white/60 text-sm mt-5 lp-anim lp-d4">
                <i className="fas fa-shield-halved mr-1"></i> Tidak perlu kartu kredit &middot; Tanpa biaya tersembunyi
              </p>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0 lp-anim lp-d2">
              <img 
                src="/hero-teacher.jpg" 
                alt="Guru menunjukkan dashboard absensi digital di tablet" 
                className="w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl lp-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MASALAH */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <p className="text-red-500 font-bold text-sm uppercase tracking-wider mb-3">
            Masalah Guru Indonesia
          </p>
          <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332] mb-10">
            Waktu guru habis untuk administrasi, bukan mengajar
          </h2>
          <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#fcfbf8]">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-times-circle text-red-500"></i>
              </div>
              <div>
                <p className="font-bold text-[#1A2332] mb-1">Absensi manual</p>
                <p className="text-sm text-gray-500">30 menit per kelas untuk catat kehadiran satu per satu</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#fcfbf8]">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-times-circle text-red-500"></i>
              </div>
              <div>
                <p className="font-bold text-[#1A2332] mb-1">Rekap ribet</p>
                <p className="text-sm text-gray-500">Hitung persentase kehadiran siswa manual, rentan salah</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#fcfbf8]">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-times-circle text-red-500"></i>
              </div>
              <div>
                <p className="font-bold text-[#1A2332] mb-1">Data tersebar</p>
                <p className="text-sm text-gray-500">Nilai, jurnal, absensi di berbagai tempat, susah dicari</p>
              </div>
            </div>
          </div>
        </Reveal>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Solusi Jurnal Guru
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Apa yang Kamu Dapatkan?
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Semua kebutuhan administrasi guru ada di satu tempat.
              </p>
            </div>
          </Reveal>

          {/* Featured Feature */}
          <Reveal>
          <div className="bg-gradient-to-r from-[#0D7C66] to-[#0A6352] rounded-3xl p-8 md:p-12 mb-12 overflow-hidden relative">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <span className="inline-flex items-center gap-2 text-xs font-semibold bg-[#E8A317] text-[#1A2332] rounded-full px-3 py-1 mb-4">
                  <i className="fas fa-star"></i> Fitur Utama
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-[Outfit] mb-4">
                  Absensi Digital Super Cepat
                </h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Catat kehadiran 30 siswa dalam 10 detik. Rekap otomatis, export ke Excel, 
                  dan lihat persentase kehadiran real-time.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-[#E8A317]"></i>
                    <span>One-click attendance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-[#E8A317]"></i>
                    <span>Rekap otomatis per bulan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-[#E8A317]"></i>
                    <span>Export Excel dengan satu klik</span>
                  </li>
                </ul>
              </div>
              <div className="relative flex justify-center">
                <DashboardMockup />
              </div>
            </div>
          </div>
          </Reveal>

          {/* Feature Grid */}
          <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 mb-4 bg-[#0D7C66]/10 rounded-2xl flex items-center justify-center">
                  <i className={`fas ${f.icon} text-[#0D7C66] text-xl`}></i>
                </div>
                <h3 className="font-bold font-[Outfit] text-[#1A2332] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-5">
          <Reveal>
          <div className="text-center mb-12">
            <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-2">
              Cara Kerja
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
              Mulai dalam 3 Langkah
            </h2>
          </div>
          </Reveal>

          <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-[#0D7C66] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                1
              </div>
              <h3 className="font-bold text-[#1A2332] mb-2">Daftar</h3>
              <p className="text-sm text-gray-500">Buat akun gratis dalam 30 detik</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-[#E8A317] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                2
              </div>
              <h3 className="font-bold text-[#1A2332] mb-2">Kelola</h3>
              <p className="text-sm text-gray-500">Isi absensi, nilai, dan jurnal mengajar</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-[#1A2332] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                3
              </div>
              <h3 className="font-bold text-[#1A2332] mb-2">Selesai</h3>
              <p className="text-sm text-gray-500">Rekap otomatis, siap digunakan</p>
            </div>
          </div>

          <div className="relative">
            <img 
              src="/dashboard-preview.jpg"
              alt="Pratinjau ruang kelas dan dashboard guru" 
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
          </Reveal>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
          <div className="text-center mb-12">
            <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-3">
              Harga
            </p>
            <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
              Pilih Paket yang Cocok
            </h2>
            <p className="text-gray-500">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan.
            </p>
          </div>
          </Reveal>

          <Reveal delay={1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gratis */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
              <div className="mb-4">
                <p className="font-bold text-[#1A2332] text-lg">Gratis</p>
                <p className="text-gray-500 text-sm">Cocok untuk guru individu</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold font-[Outfit] text-[#1A2332]">Rp 0</span>
                <span className="text-gray-500 text-sm">/2 hari trial</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Dashboard & data siswa/kelas
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Absensi & presensi
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Rekap & cetak presensi
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Jurnal mengajar
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Profil sekolah
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <i className="fas fa-times text-gray-300"></i> Nilai & kelompok belajar
                </li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 px-5 border-2 border-[#E8E4DC] text-[#1A2332] font-semibold rounded-xl hover:border-[#0D7C66] hover:text-[#0D7C66] transition-all">
                Mulai Gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-2xl p-6 relative transform md:scale-105 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A317] text-[#1A2332] text-xs font-bold px-3 py-1 rounded-full">
                REKOMENDASI
              </div>
              <div className="mb-4">
                <p className="font-bold text-white text-lg">Pro</p>
                <p className="text-white/70 text-sm">Semua fitur Gratis + pengolahan nilai</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold font-[Outfit] text-white">Rp 29.000</span>
                <span className="text-white/70 text-sm">/6 bulan</span>
              </div>
              <p className="text-white/70 text-xs mb-4">Minimal pembelian 6 bulan — murah, tanpa biaya bulanan berulang</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-white">
                  <i className="fas fa-check text-[#E8A317]"></i> Semua fitur Gratis
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <i className="fas fa-check text-[#E8A317]"></i> Nilai & KKM
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <i className="fas fa-check text-[#E8A317]"></i> Rekap Nilai
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <i className="fas fa-check text-[#E8A317]"></i> Generate kelompok belajar
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <i className="fas fa-check text-[#E8A317]"></i> Unlimited kelas
                </li>
              </ul>
              <Link href="/checkout?plan=pro" className="block text-center w-full py-3 px-5 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold rounded-xl transition-all shadow-lg">
                <i className="fas fa-rocket mr-1"></i> Upgrade ke Pro
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
              <div className="mb-4">
                <p className="font-bold text-[#1A2332] text-lg">Premium</p>
                <p className="text-gray-500 text-sm">Untuk sekolah & guru berstatus pegawai</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold font-[Outfit] text-[#1A2332]">Rp 49.000</span>
                <span className="text-gray-500 text-sm">/6 bulan</span>
              </div>
              <p className="text-gray-500 text-xs mb-4">Akses semua fitur — 6 bulan. Cocok untuk sekolah & guru berstatus pegawai</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Semua fitur Pro
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Generate LCKH
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Generate LKB bagi pegawai
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Ekspor laporan pegawai
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-[#0D7C66]"></i> Support prioritas
                </li>
              </ul>
              <Link href="/checkout?plan=premium" className="block text-center w-full py-3 px-5 bg-[#1A2332] hover:bg-[#2D4055] text-white font-semibold rounded-xl transition-all">
                Upgrade ke Premium
              </Link>
            </div>
          </div>
          </Reveal>

          <Reveal delay={2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              <i className="fas fa-shield-halved"></i>
              <span>Garansi 30 Hari Uang Kembali — Tanpa Pertanyaan</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
              <i className="fas fa-lock"></i>
              <span>Garansi Keamanan Data - Enkripsi &amp; Backup Otomatis</span>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONI */}
      <section id="testimoni" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
          <div className="text-center mb-12">
            <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
              Testimoni
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
              Apa Kata Guru?
            </h2>
          </div>
          </Reveal>

          <Reveal delay={1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <i key={j} className="fas fa-star text-[#E8A317] text-sm"></i>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8E4DC]">
                  <div className="w-10 h-10 bg-[#0D7C66] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332] text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* CTA AKHIR */}
      <section className="px-5 py-16">
        <Reveal>
        <div className="bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-3xl p-10 md:p-14 text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] mb-3">
            Siap Hemat Waktu untuk Administrasi?
          </h2>
          <p className="max-w-xl mx-auto text-white/80 mb-7">
            Mulai kelola absensi, nilai, dan jurnal mengajar secara digital. Gratis, tanpa ribet.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg lp-shimmer-wrap">
            <i className="fas fa-rocket"></i> Coba Gratis Sekarang
          </Link>
          <p className="text-white/60 text-sm mt-4">
            <i className="fas fa-shield-halved mr-1"></i> Gratis selamanya &middot; Tanpa kartu kredit
          </p>
        </div>
      </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A2332] py-10 pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-sm"></i>
                </div>
                <span className="text-white font-bold text-sm">Jurnal Guru</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Dashboard guru untuk mengelola absensi, nilai, jurnal mengajar, dan data siswa secara digital.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2">
                <li><a href="#fitur" className="text-gray-400 text-sm hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#harga" className="text-gray-400 text-sm hover:text-white transition-colors">Harga</a></li>
                <li><a href="#testimoni" className="text-gray-400 text-sm hover:text-white transition-colors">Testimoni</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Akun</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Masuk</Link></li>
                <li><Link href="/register" className="text-gray-400 text-sm hover:text-white transition-colors">Daftar</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} Jurnal Guru &middot; Dashboard Guru Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
