import HeaderActions from "@/components/HeaderActions";

const panduan = [
  {
    id: "dashboard",
    judul: "Dashboard",
    icon: "fa-th-large",
    color: "text-[#0D7C66]",
    bg: "bg-[#eefbf8]",
    items: [
      "Dashboard menampilkan ringkasan data: jumlah siswa, kelas, absensi hari ini, dan rata-rata nilai.",
      "Grafik batang menunjukkan distribusi siswa per kelas.",
      "Bagian Ringkasan Data menampilkan total absensi, total nilai, tahun ajaran, dan semester.",
    ],
  },
  {
    id: "siswa",
    judul: "Data Siswa",
    icon: "fa-user-graduate",
    color: "text-[#E8A317]",
    bg: "bg-[#fffbeb]",
    items: [
      "Kelola data siswa: tambah, edit, hapus, atau import dari file CSV/Excel.",
      "Gunakan filter kelas dan pencarian untuk menemukan siswa dengan cepat.",
      "Download template CSV atau Excel sebelum import data siswa.",
      "Centang beberapa siswa untuk hapus massal.",
    ],
  },
  {
    id: "kelas",
    judul: "Data Kelas",
    icon: "fa-chalkboard",
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: [
      "Buat kelas baru dengan mengisi nama kelas, tingkat, jurusan, tahun ajaran, dan wali kelas.",
      "Setiap kelas bisa ditambah/diedit/dihapus.",
      "Jumlah siswa per kelas otomatis terhitung.",
    ],
  },
  {
    id: "jadwal",
    judul: "Jadwal Mengajar",
    icon: "fa-calendar-alt",
    color: "text-red-600",
    bg: "bg-red-50",
    items: [
      "Buat jadwal mengajar per hari, jam, mapel, kelas, dan ruangan.",
      "Filter jadwal berdasarkan hari untuk melihat jadwal tertentu.",
      "Jadwal akan ditampilkan di Kalender Akademik.",
    ],
  },
  {
    id: "absensi",
    judul: "Absensi",
    icon: "fa-clipboard-check",
    color: "text-green-600",
    bg: "bg-green-50",
    items: [
      "Pilih tanggal, kelas, dan mata pelajaran sebelum mengisi absensi.",
      "Tandai status setiap siswa: Hadir (H), Sakit (S), Izin (I), atau Alpa (A).",
      "Bisa menambahkan keterangan untuk siswa yang tidak hadir.",
      "Gunakan filter untuk melihat riwayat absensi tertentu.",
      "Export riwayat ke PDF atau Excel.",
    ],
  },
  {
    id: "nilai",
    judul: "Nilai",
    icon: "fa-chart-bar",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "Input nilai per siswa atau gunakan Input Batch untuk satu kelas sekaligus.",
      "Setiap nilai memiliki: mapel, kategori (Pengetahuan/Keterampilan/Ulangan/Tugas), KKM, dan bab.",
      "Status Tuntas/Belum Tuntas ditentukan berdasarkan KKM.",
      "Export nilai ke PDF atau Excel.",
    ],
  },
  {
    id: "jurnal",
    judul: "Jurnal Mengajar",
    icon: "fa-book-open",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    items: [
      "Catat kegiatan mengajar harian: kelas, mapel, jam ke, materi, kendala, dan solusi.",
      "Filter jurnal berdasarkan kelas dan rentang tanggal.",
      "Data jurnal bisa di-generate ke LCKH.",
    ],
  },
  {
    id: "lainnya",
    judul: "Lainnya",
    icon: "fa-ellipsis-h",
    color: "text-gray-600",
    bg: "bg-gray-100",
    items: [
      "Rekap Absensi: Lihat rekapitulasi kehadiran siswa per rentang tanggal.",
      "Rekap Nilai: Lihat perbandingan nilai siswa per bab.",
      "Kelompok Belajar: Kelompokkan siswa untuk aktivitas belajar kelompok.",
      "Kalender: Lihat jadwal, absensi, dan catatan harian dalam tampilan kalender.",
      "LCKH/LKB: Generate laporan catatan kegiatan harian dan laporan kinerja bulanan.",
      "Template Surat: Download template surat panggilan, keterangan aktif belajar, dan tugas/PR.",
    ],
  },
];

export default function PanduanPage() {
  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Panduan</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="max-w-3xl">
        <p className="text-sm text-gray-500 mb-6">
          Panduan penggunaan aplikasi Jurnal Guru. Klik menu di sidebar untuk navigasi ke fitur yang diinginkan.
        </p>

        <div className="space-y-4">
          {panduan.map((p) => (
            <div key={p.judul} id={p.id} className="card scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.bg} ${p.color}`}>
                  <i className={`fas ${p.icon}`}></i>
                </div>
                <h3 className="font-bold text-gray-800 font-[Outfit]">{p.judul}</h3>
              </div>
              <ul className="space-y-2 ml-13">
                {p.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <i className="fas fa-check-circle text-[#0D7C66] mt-0.5 text-xs"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
