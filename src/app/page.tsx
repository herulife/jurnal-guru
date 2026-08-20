import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SocialProof from "@/components/SocialProof";
import LandingTracker from "@/components/LandingTracker";
import TrackCta from "@/components/TrackCta";
import Navbar from "@/components/Navbar";
import DashboardMockup from "@/components/DashboardMockup";
import Reveal from "@/components/Reveal";

const benefits = [
  {
    icon: "fa-bolt",
    title: "Hemat Waktu",
    desc: "Absensi 30 siswa dalam 10 detik. Rekap otomatis tanpa hitung manual.",
  },
  {
    icon: "fa-layer-group",
    title: "Semua dalam Satu Tempat",
    desc: "Absensi, nilai, jurnal, jadwal, dan data siswa tersusun rapi di satu dashboard.",
  },
  {
    icon: "fa-cloud-arrow-up",
    title: "Data Tetap dalam Kendali Anda",
    desc: "Sinkronkan data ke Google Sheets pribadi Anda kapan saja.",
  },
  {
    icon: "fa-mobile-screen",
    title: "Bisa Digunakan dari HP",
    desc: "Kelola administrasi kapan saja tanpa harus bergantung pada komputer.",
  },
];

const featureGroups = [
  {
    label: "Administrasi Harian",
    items: [
      { icon: "fa-clipboard-check", name: "Absensi digital", benefit: "Catat kehadiran 30 siswa dalam hitungan detik" },
      { icon: "fa-book-open", name: "Jurnal mengajar", benefit: "Dokumentasikan materi dan kendala per pertemuan" },
      { icon: "fa-calendar-alt", name: "Jadwal mengajar", benefit: "Susun jadwal per kelas dalam satu kalender" },
      { icon: "fa-user-graduate", name: "Data siswa", benefit: "Semua data siswa tersusun dalam satu tempat" },
    ],
  },
  {
    label: "Nilai & Evaluasi",
    items: [
      { icon: "fa-chart-bar", name: "Nilai & KKM", benefit: "Kelola nilai tanpa spreadsheet yang berantakan" },
      { icon: "fa-rotate", name: "Rekap nilai", benefit: "Rekap otomatis seluruh siswa dalam satu tabel" },
      { icon: "fa-people-group", name: "Kelompok belajar", benefit: "Generate kelompok belajar secara otomatis" },
      { icon: "fa-print", name: "Export Excel & PDF", benefit: "Cetak rekap dengan satu klik" },
    ],
  },
  {
    label: "Arsip & Data",
    items: [
      { icon: "fa-cloud-arrow-up", name: "Google Sheets", benefit: "Sinkronkan data ke spreadsheet pribadi" },
      { icon: "fa-file-lines", name: "Template surat", benefit: "Buat surat resmi sekolah dari template" },
      { icon: "fa-file-signature", name: "LCKH & LKB", benefit: "Generate LCKH dan LKB untuk pegawai" },
      { icon: "fa-database", name: "Backup data", benefit: "Ekspor semua data kapan saja" },
    ],
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
        url: process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site",
        description:
          "Aplikasi administrasi guru untuk mengelola absensi, nilai, jurnal mengajar, dan sinkronisasi Google Sheets.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Jurnal Guru",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site",
        description:
          "Aplikasi administrasi guru: absensi digital, nilai, jurnal mengajar, jadwal, data siswa, dan sinkronisasi Google Sheets.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
          description: "Paket Gratis tersedia",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Apakah Free benar-benar gratis?", acceptedAnswer: { "@type": "Answer", text: "Ya. Daftar gratis dan langsung gunakan fitur dasar tanpa batas waktu. Tidak perlu kartu kredit." } },
          { "@type": "Question", name: "Berapa batas Paket Gratis?", acceptedAnswer: { "@type": "Answer", text: "Paket Gratis mendukung hingga 1 kelas aktif dan 30 siswa." } },
          { "@type": "Question", name: "Apa yang terjadi jika saya mencapai 30 siswa?", acceptedAnswer: { "@type": "Answer", text: "Anda tetap bisa mengelola data yang sudah ada. Untuk menambah siswa baru, upgrade ke Pro." } },
          { "@type": "Question", name: "Apakah data saya akan terhapus jika mencapai batas?", acceptedAnswer: { "@type": "Answer", text: "Tidak. Data yang sudah ada tetap aman." } },
          { "@type": "Question", name: "Apa yang terjadi jika Pro saya berakhir?", acceptedAnswer: { "@type": "Answer", text: "Akun kembali ke paket Gratis. Data tetap tersimpan." } },
          { "@type": "Question", name: "Apakah Google Sheets tersedia di Free?", acceptedAnswer: { "@type": "Answer", text: "Ya. Google Sheets basic tersedia di paket Gratis." } },
          { "@type": "Question", name: "Apakah guru lain dapat melihat data saya?", acceptedAnswer: { "@type": "Answer", text: "Tidak. Setiap akun memiliki data terisolasi." } },
          { "@type": "Question", name: "Apakah ada biaya tersembunyi?", acceptedAnswer: { "@type": "Answer", text: "Tidak. Harga yang tertera adalah harga final." } },
        ],
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

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#0a5c4c] to-[#0d7c66]">
        <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 text-xs font-semibold bg-[#E8A317] text-[#1A2332] rounded-full px-4 py-1.5 mb-6 lp-anim">
                <i className="fas fa-check-circle"></i> Platform Administrasi Guru
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold font-[Outfit] leading-tight mb-5 lp-anim lp-d1">
                Semua Administrasi Guru.
                <br />
                <span className="text-[#E8A317]">Satu Tempat.</span>
                <br />
                Data Tetap Dalam Kendali Anda.
              </h1>
              <p className="text-white/80 md:text-lg mb-8 leading-relaxed lp-anim lp-d2">
                Kelola absensi, nilai, jurnal, kelas, dan administrasi guru dari HP.
                Data tersimpan rapi dan dapat disinkronkan ke Google Sheets pribadi Anda.
              </p>
              <div className="flex flex-wrap items-center gap-4 lp-anim lp-d3">
                <TrackCta href="/register" className="inline-flex items-center gap-2 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl lp-shimmer-wrap">
                  <i className="fas fa-rocket"></i> Mulai Gratis
                </TrackCta>
                <a href="#cara-kerja" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition-all">
                  Lihat Cara Kerja <i className="fas fa-arrow-down"></i>
                </a>
              </div>
              <p className="text-white/60 text-sm mt-5 lp-anim lp-d4">
                <i className="fas fa-shield-halved mr-1"></i> Tanpa kartu kredit &middot; Tanpa biaya tersembunyi
              </p>
            </div>
            <div className="relative flex justify-center mt-8 md:mt-0 lp-anim lp-d2">
              <img
                src="/hero-teacher.jpg"
                alt="Guru menggunakan dashboard administrasi digital di tablet"
                className="w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl lp-float"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEMO 10 DETIK ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Fitur Unggulan
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Absensi 30 Siswa. Dalam Hitungan Detik.
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Pilih kelas, tandai kehadiran, selesai. Rekap otomatis, export dengan satu klik.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="bg-gradient-to-r from-[#0D7C66] to-[#0A6352] rounded-3xl p-8 md:p-12 overflow-hidden relative">
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
        </div>
      </section>

      {/* ===== VALUE PROPOSITION ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-2">
                Mengapa Jurnal Guru?
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Lebih Mudah Dipahami, Lebih Cepat Digunakan
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Dirancang untuk kebutuhan administrasi guru sehari-hari.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 mb-4 bg-[#0D7C66]/10 rounded-2xl flex items-center justify-center">
                    <i className={`fas ${b.icon} text-[#0D7C66] text-xl`}></i>
                  </div>
                  <h3 className="font-bold font-[Outfit] text-[#1A2332] mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FITUR BY CATEGORY ===== */}
      <section id="fitur" className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Fitur Lengkap
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Semua yang Anda Butuhkan
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Dari absensi harian hingga arsip data — semuanya tersedia.
              </p>
            </div>
          </Reveal>

          {featureGroups.map((group, gi) => (
            <Reveal key={gi} delay={gi as 0 | 1 | 2}>
              <div className="mb-10">
                <h3 className="text-lg font-bold font-[Outfit] text-[#1A2332] mb-5 flex items-center gap-2">
                  <span className="w-8 h-1 bg-[#0D7C66] rounded-full"></span>
                  {group.label}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.items.map((item, ii) => (
                    <div key={ii} className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-11 h-11 mb-3 bg-[#0D7C66]/10 rounded-xl flex items-center justify-center">
                        <i className={`fas ${item.icon} text-[#0D7C66]`}></i>
                      </div>
                      <p className="font-bold text-sm text-[#1A2332] mb-1">{item.name}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section id="cara-kerja" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-2">
                Cara Kerja
              </p>
              <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
                Mulai Dalam Beberapa Langkah
              </h2>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { num: "1", title: "Daftar Gratis", desc: "Buat akun dalam 30 detik", color: "bg-[#0D7C66]" },
                { num: "2", title: "Isi Data Kelas", desc: "Masukkan kelas dan data siswa", color: "bg-[#0A6352]" },
                { num: "3", title: "Mulai Mencatat", desc: "Absensi, jurnal, dan nilai", color: "bg-[#E8A317]" },
                { num: "4", title: "Rekap Otomatis", desc: "Semua data tersusun rapi", color: "bg-[#1A2332]" },
                { num: "5", title: "Sinkronkan", desc: "Ke Google Sheets jika perlu", color: "bg-[#0D7C66]" },
              ].map((step) => (
                <div key={step.num} className="text-center group">
                  <div className={`w-14 h-14 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    {step.num}
                  </div>
                  <h3 className="font-bold text-sm text-[#1A2332] mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== GOOGLE SHEETS ===== */}
      <section id="google-sheets" className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Data Tetap Dalam Kendali Anda
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Sinkronkan ke Google Sheets Pribadi
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Jurnal Guru membantu Anda mengelola administrasi dengan lebih praktis, sekaligus menyediakan sinkronisasi ke Google Sheets pribadi Anda.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0D7C66] flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-database text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332] mb-1">Database Jurnal Guru</p>
                    <p className="text-sm text-gray-500">Semua data tersimpan dan dikelola di sini.</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-[#0D7C66]/30"></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8A317] flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-arrows-rotate text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332] mb-1">Sinkronisasi</p>
                    <p className="text-sm text-gray-500">Data disinkronkan ke Google Sheets Anda. Status sync terlihat jelas.</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-[#E8A317]/30"></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A2332] flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-sheet-table text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332] mb-1">Google Sheets Anda</p>
                    <p className="text-sm text-gray-500">Spreadsheet terhubung dengan akun Anda. Data Anda, kendali Anda.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold font-[Outfit] mb-4">Yang Perlu Anda Tahu</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-[#E8A317] mt-1"></i>
                    <span className="text-sm">Spreadsheet terkait dengan akun/user masing-masing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-[#E8A317] mt-1"></i>
                    <span className="text-sm">Data antar-user terisolasi.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-[#E8A317] mt-1"></i>
                    <span className="text-sm">Database Jurnal Guru tetap menjadi source of truth.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-[#E8A317] mt-1"></i>
                    <span className="text-sm">Jika sync gagal, data utama tetap aman di database.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-[#E8A317] mt-1"></i>
                    <span className="text-sm">Anda dapat melihat status sinkronisasi di dashboard.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== KEAMANAN / TRUST ===== */}
      <section id="keamanan" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Keamanan Data
              </p>
              <h2 className="text-2xl md:text-4xl font-bold font-[Outfit] text-[#1A2332] mb-3">
                Data Anda Terlindungi
              </h2>
              <p className="max-w-2xl mx-auto text-gray-500">
                Kami menjaga keamanan data Anda dengan serius.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "fa-user-lock", title: "Akun Pribadi", desc: "Setiap akun terisolasi. Guru lain tidak bisa melihat data Anda." },
                { icon: "fa-shield-halved", title: "Akses Terbatas", desc: "Hanya Anda yang bisa mengakses data Anda. Admin hanya untuk verifikasi." },
                { icon: "fa-database", title: "Database Terenkripsi", desc: "Data tersimpan di server dengan enkripsi standar industri." },
                { icon: "fa-link", title: "Google Sheets Terisolasi", desc: "Spreadsheet terhubung per user. Data tidak bercampur." },
                { icon: "fa-eye-slash", title: "Credential Tidak Ditampilkan", desc: "Token dan kredensial tidak pernah ditampilkan ke user." },
                { icon: "fa-cloud-arrow-up", title: "Data Tetap Aman", desc: "Jika sync gagal, data utama tetap tersimpan di database." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 mb-4 bg-[#0D7C66]/10 rounded-xl flex items-center justify-center">
                    <i className={`fas ${item.icon} text-[#0D7C66] text-lg`}></i>
                  </div>
                  <h3 className="font-bold text-[#1A2332] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== OBJECTION HANDLING ===== */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-2">
                Pertanyaan yang Sering Diajukan
              </p>
              <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
                Masih Ada Keraguan?
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="space-y-4">
              {[
                {
                  q: "Saya takut data saya hilang.",
                  a: "Data Anda tetap tersimpan di Jurnal Guru dan dapat disinkronkan ke Google Sheets pribadi. Database tetap menjadi source of truth.",
                },
                {
                  q: "Saya sudah punya Excel.",
                  a: "Jurnal Guru membantu mengurangi pekerjaan manual seperti rekap dan pengelolaan data kelas — sesuatu yang sulit dilakukan di Excel biasa.",
                },
                {
                  q: "Saya tidak mau aplikasi yang rumit.",
                  a: "Mulai dari fitur yang Anda butuhkan. Semua bisa diakses dari HP tanpa instalasi.",
                },
                {
                  q: "Kalau saya berhenti berlangganan?",
                  a: "Akun kembali ke paket Gratis. Data tetap tersimpan. Fitur Pro/Premium tidak akan bisa diakses.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-6">
                  <p className="font-bold text-[#1A2332] mb-2 flex items-start gap-2">
                    <i className="fas fa-circle-question text-[#E8A317] mt-0.5"></i>
                    {item.q}
                  </p>
                  <p className="text-sm text-gray-600 ml-6">{item.a}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== HARGA ===== */}
      <section id="harga" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-3">
                Harga Pengguna Awal
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
                  <p className="text-gray-500 text-sm">Untuk mencoba dan kebutuhan dasar</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-[Outfit] text-[#1A2332]">Rp 0</span>
                  <span className="text-gray-500 text-sm"> /mulai gratis</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> 1 kelas aktif
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> Hingga 30 siswa
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> Absensi & rekap presensi
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> Jurnal mengajar
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> Dashboard & jadwal
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check text-[#0D7C66]"></i> Google Sheets basic
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <i className="fas fa-times text-gray-300"></i> Nilai & kelompok belajar
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <i className="fas fa-times text-gray-300"></i> Export
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
                  <p className="text-white/70 text-sm">Untuk penggunaan rutin</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-[Outfit] text-white">Rp 29.000</span>
                  <span className="text-white/70 text-sm"> /6 bulan</span>
                </div>
                <p className="text-white/70 text-xs mb-4">Harga pengguna awal &middot; Minimal 6 bulan</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-white">
                    <i className="fas fa-check text-[#E8A317]"></i> Semua fitur Gratis
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white">
                    <i className="fas fa-check text-[#E8A317]"></i> Kelas & siswa unlimited
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
                    <i className="fas fa-check text-[#E8A317]"></i> Export Excel & PDF
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white">
                    <i className="fas fa-check text-[#E8A317]"></i> Google Sheets lengkap
                  </li>
                </ul>
                <Link href="/checkout?plan=pro" className="block text-center w-full py-3 px-5 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold rounded-xl transition-all shadow-lg">
                  <i className="fas fa-cart-shopping mr-1"></i> Pilih Pro
                </Link>
              </div>

              {/* Premium */}
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                <div className="mb-4">
                  <p className="font-bold text-[#1A2332] text-lg">Premium</p>
                  <p className="text-gray-500 text-sm">Untuk administrasi lebih lengkap</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-[Outfit] text-[#1A2332]">Rp 49.000</span>
                  <span className="text-gray-500 text-sm"> /6 bulan</span>
                </div>
                <p className="text-gray-500 text-xs mb-4">Harga pengguna awal &middot; Akses semua fitur</p>
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
                  <i className="fas fa-cart-shopping mr-1"></i> Pilih Premium
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
                <i className="fas fa-shield-halved"></i>
                <span>Coba Gratis Dulu — Tanpa Kartu Kredit</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                <i className="fas fa-lock"></i>
                <span>Tanpa Biaya Tersembunyi</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== MANFAAT ===== */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#0D7C66] font-bold text-sm uppercase tracking-wider mb-2">
                Dirancang untuk Kebutuhan Guru
              </p>
              <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
                Kenapa Guru Membutuhkan Jurnal Guru
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "fa-stopwatch",
                  title: "Hemat Waktu",
                  desc: "Absensi, nilai, dan jurnal dicatat digital — tidak perlu hitung manual lagi.",
                },
                {
                  icon: "fa-folder-open",
                  title: "Tersusun Rapi",
                  desc: "Semua data administrasi ada di satu tempat, rapi dan mudah dicari.",
                },
                {
                  icon: "fa-paper-plane",
                  title: "Langsung Bisa Dipakai",
                  desc: "Daftar gratis, langsung coba semua fitur dasar tanpa instalasi.",
                },
              ].map((t, i) => (
                <div key={i} className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#0D7C66] rounded-xl flex items-center justify-center text-white mb-4">
                    <i className={`fas ${t.icon}`}></i>
                  </div>
                  <h3 className="font-bold text-[#1A2332] mb-2">{t.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
              {[
                { icon: "fa-hand-holding-heart", value: "Rp0", label: "Mulai Gratis" },
                { icon: "fa-clipboard-check", value: "10 detik", label: "Catat Kehadiran" },
                { icon: "fa-box-open", value: "12+ fitur", label: "Siap Dipakai" },
                { icon: "fa-layer-group", value: "1 tempat", label: "Semua Data Guru" },
              ].map((s) => (
                <div key={s.label} className="bg-[#fcfbf8] rounded-2xl border border-[#E8E4DC] p-5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-[#0D7C66]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className={`fas ${s.icon} text-[#0D7C66]`}></i>
                  </div>
                  <p className="text-2xl font-extrabold font-[Outfit] text-[#1A2332] tabular-nums">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[#E8A317] font-bold text-sm uppercase tracking-wider mb-2">
                FAQ
              </p>
              <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] text-[#1A2332]">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="space-y-3">
              {[
                {
                  q: "Apakah Free benar-benar gratis?",
                  a: "Ya. Daftar gratis dan langsung gunakan fitur dasar tanpa batas waktu. Tidak perlu kartu kredit.",
                },
                {
                  q: "Berapa batas Paket Gratis?",
                  a: "Paket Gratis mendukung hingga 1 kelas aktif dan 30 siswa. Fitur yang tersedia: absensi, jurnal, jadwal, dashboard, dan Google Sheets basic.",
                },
                {
                  q: "Apa yang terjadi jika saya mencapai 30 siswa?",
                  a: "Anda tetap bisa mengelola data yang sudah ada. Untuk menambah siswa baru, upgrade ke Pro untuk siswa tanpa batas.",
                },
                {
                  q: "Apakah data saya akan terhapus jika mencapai batas?",
                  a: "Tidak. Data yang sudah ada tetap aman dan bisa dikelola. Limit hanya berlaku untuk penambahan data baru.",
                },
                {
                  q: "Apa yang terjadi jika saya upgrade?",
                  a: "Fitur baru langsung terbuka. Data yang sudah ada tetap tersimpan. Tidak ada data yang hilang.",
                },
                {
                  q: "Apa yang terjadi jika Pro saya berakhir?",
                  a: "Akun kembali ke paket Gratis. Data tetap tersimpan. Fitur Pro/Premium tidak akan bisa diakses sampai berlangganan lagi.",
                },
                {
                  q: "Apakah Google Sheets tersedia di Free?",
                  a: "Ya. Google Sheets basic tersedia di paket Gratis. Fitur sinkronisasi lengkap tersedia di Pro.",
                },
                {
                  q: "Apakah guru lain dapat melihat data saya?",
                  a: "Tidak. Setiap akun memiliki data terisolasi. Tidak ada guru yang bisa mengakses data guru lain.",
                },
                {
                  q: "Apakah data bisa diekspor?",
                  a: "Ya. Fitur export ke Excel dan PDF tersedia di paket Pro dan Premium.",
                },
                {
                  q: "Apakah ada biaya tersembunyi?",
                  a: "Tidak. Harga yang tertera adalah harga final. Tidak ada biaya tambahan atau perpanjangan otomatis.",
                },
              ].map((item, i) => (
                <details key={i} className="group bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#1A2332] text-sm select-none hover:bg-[#fcfbf8] transition-colors">
                    <span>{item.q}</span>
                    <i className="fas fa-chevron-down text-gray-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0"></i>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-5 py-16">
        <Reveal>
          <div className="bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-3xl p-10 md:p-14 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold font-[Outfit] mb-3">
              Siap Mulai Kelola Administrasi Guru?
            </h2>
            <p className="max-w-xl mx-auto text-white/80 mb-7">
              Mulai dari fitur yang Anda butuhkan. Gratis, tanpa ribet, dari HP.
            </p>
            <TrackCta href="/register" className="inline-flex items-center gap-2 bg-[#E8A317] hover:bg-[#ca8a04] text-[#1A2332] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg lp-shimmer-wrap">
              <i className="fas fa-rocket"></i> Mulai Gratis
            </TrackCta>
            <p className="text-white/60 text-sm mt-4">
              <i className="fas fa-shield-halved mr-1"></i> Tanpa kartu kredit &middot; Tanpa biaya tersembunyi
            </p>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
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
                Aplikasi administrasi guru untuk mengelola absensi, nilai, jurnal mengajar, dan sinkronisasi Google Sheets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2">
                <li><a href="#fitur" className="text-gray-400 text-sm hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#harga" className="text-gray-400 text-sm hover:text-white transition-colors">Harga</a></li>
                <li><a href="#google-sheets" className="text-gray-400 text-sm hover:text-white transition-colors">Google Sheets</a></li>
                <li><a href="#faq" className="text-gray-400 text-sm hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Akun</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Masuk</Link></li>
                <li><Link href="/register" className="text-gray-400 text-sm hover:text-white transition-colors">Daftar Gratis</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} Jurnal Guru &middot; Aplikasi Administrasi Guru Indonesia
            </p>
          </div>
        </div>
      </footer>
      <SocialProof />
      <LandingTracker />
    </div>
  );
}
