import { db } from "@/db";
import {
  users,
  settings,
  profilSekolah,
  dataKelas,
  dataSiswa,
  jadwalMengajar,
  absensi,
  nilai,
  jurnalMengajar,
  kelompokBelajar,
  lckh,
  lkb,
  kalenderCatatan,
} from "@/db/schema";
import { hashPassword } from "./auth";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  const existingUsers = await db.select().from(users).all();
  if (existingUsers.length > 0) return;

  const hashed = await hashPassword("admin123");
  await db.insert(users).values({
    id: uuidv4(),
    username: "admin",
    passwordHash: hashed,
    namaLengkap: "Administrator",
    role: "admin",
  });

  await db.insert(settings).values({ key: "app_name", value: "Jurnal Guru" });
  await db.insert(settings).values({ key: "tahun_ajaran", value: "2024/2025" });
  await db.insert(settings).values({ key: "semester", value: "1" });
  await db.insert(settings).values({ key: "kkm_default", value: "75" });

  await db.insert(profilSekolah).values({
    id: uuidv4(),
    namaSekolah: "Sekolah",
    alamat: "",
    npsn: "",
    kota: "",
    provinsi: "",
    telepon: "",
    kepalaSekolah: "",
    nipKepsek: "",
    namaGuru: "",
    nipGuru: "",
    logoUrl: "",
  });

  console.log("Database seeded successfully!");
}

const NAMA = [
  "Ahmad Fauzan", "Anisa Rahma", "Bagas Pratama", "Citra Ayu",
  "Dimas Aditya", "Eka Sari", "Fajar Nugroho", "Gita Permata",
  "Hendra Wijaya", "Intan Permatasari", "Joko Prasetyo", "Kirana Dewi",
];
const JK = ["L", "P", "L", "P", "L", "P", "L", "P", "L", "P", "L", "P"];

/**
 * Isi data dummy untuk satu user baru (dipanggil otomatis saat registrasi).
 * Membuat 2 kelas, 12 siswa, jadwal, absensi, nilai, jurnal, kelompok, LCKH, LKB & catatan kalender.
 */
export async function seedDummyData(userId: string) {
  const tahun = "2026/2027";

  // Profil sekolah — kosong, agar dokumen tidak menampilkan data palsu.
  // User mengisi data sekolah asli di menu "Profil Sekolah".
  await db.insert(profilSekolah).values({
    id: uuidv4(),
    userId,
    namaSekolah: "",
    alamat: "",
    npsn: "",
    kota: "",
    provinsi: "",
    telepon: "",
    kepalaSekolah: "",
    nipKepsek: "",
    namaGuru: "",
    nipGuru: "",
    logoUrl: "",
  });

  // Kelas — limit to 1 for free plan (max 1 kelas aktif)
  const k1 = uuidv4();
  await db.insert(dataKelas).values([
    { id: k1, userId, namaKelas: "X IPA 1", tingkat: 10, jurusan: "IPA", tahunAjaran: tahun, waliKelas: "Wali Kelas 1" },
  ]);

  // Siswa (6 in single class) — insert per row because D1 limits 100 params/query
  const siswaIds: string[] = [];
  const siswaRows = NAMA.slice(0, 6).map((nama, i) => {
    const id = uuidv4();
    siswaIds.push(id);
    const no = String(i + 1).padStart(3, "0");
    return {
      id,
      userId,
      nis: `2026${no}${String(i + 1).padStart(3, "0")}`,
      nisn: `0111123${String(i + 1).padStart(4, "0")}`,
      namaSiswa: nama,
      jenisKelamin: JK[i],
      kelasId: k1,
      alamat: `Jl. Contoh No. ${i + 1}`,
      telepon: `08123456${String(i + 1).padStart(4, "0")}`,
      email: `siswa${i + 1}@mail.test`,
      namaOrtu: `Orang Tua ${nama}`,
    };
  });
  for (const row of siswaRows) {
    await db.insert(dataSiswa).values(row);
  }

  // Jadwal
  await db.insert(jadwalMengajar).values([
    { id: uuidv4(), userId, kelasId: k1, mataPelajaran: "Matematika", hari: "Senin", jamMulai: "07:00", jamSelesai: "08:30", semester: "1", ruangan: "R.101" },
    { id: uuidv4(), userId, kelasId: k1, mataPelajaran: "Bahasa Indonesia", hari: "Senin", jamMulai: "08:30", jamSelesai: "10:00", semester: "1", ruangan: "R.101" },
    { id: uuidv4(), userId, kelasId: k1, mataPelajaran: "Biologi", hari: "Selasa", jamMulai: "07:00", jamSelesai: "08:30", semester: "1", ruangan: "R.Lab" },
    { id: uuidv4(), userId, kelasId: k1, mataPelajaran: "Fisika", hari: "Kamis", jamMulai: "07:00", jamSelesai: "08:30", semester: "1", ruangan: "R.102" },
  ]);

  // Absensi (kelas 1, mapel Matematika)
  const tanggal = "2026-08-10";
  const statusArr = ["Hadir", "Hadir", "Sakit", "Hadir", "Izin", "Hadir", "Alpha", "Hadir"];
  for (let i = 0; i < 8; i++) {
    await db.insert(absensi).values({
      id: uuidv4(),
      userId,
      tanggal,
      siswaId: siswaIds[i],
      kelasId: k1,
      mataPelajaran: "Matematika",
      status: statusArr[i],
      keterangan: statusArr[i] === "Hadir" ? "" : statusArr[i] === "Sakit" ? "Demam" : statusArr[i] === "Izin" ? "Acara keluarga" : "Tanpa keterangan",
    });
  }

  // Nilai (8 siswa)
  const nilaiArr = [88, 92, 70, 85, 76, 80, 65, 90];
  for (let i = 0; i < 8; i++) {
    await db.insert(nilai).values({
      id: uuidv4(),
      userId,
      tanggal: "2026-08-09",
      siswaId: siswaIds[i],
      kelasId: k1,
      mataPelajaran: "Matematika",
      kategori: "Ulangan Harian",
      bab: "Persamaan Linear",
      tujuanPembelajaran: "Menyelesaikan SPLDV",
      bentukPenugasan: "Tes Tulis",
      nilai: nilaiArr[i],
      kkm: 75,
    });
  }

  // Jurnal
  const jurnalId = uuidv4();
  await db.insert(jurnalMengajar).values({
    id: jurnalId,
    userId,
    tanggal: "2026-08-10",
    kelasId: k1,
    mataPelajaran: "Matematika",
    jamKe: "1-2",
    materi: "Persamaan Linear Dua Variabel",
    deskripsi: "Pembahasan konsep SPLDV dan contoh soal",
    kendala: "Beberapa siswa kesulitan aljabar dasar",
    solusi: "Diberikan latihan bertingkat",
    kehadiranSiswa: "8 hadir, 1 sakit, 1 izin, 1 alpha",
    catatan: "Lanjutkan pertemuan ke-2",
  });

  // Kelompok belajar
  for (let i = 0; i < 6; i++) {
    await db.insert(kelompokBelajar).values({
      id: uuidv4(),
      userId,
      kelasId: k1,
      kelompok: i < 3 ? "Kelompok A" : "Kelompok B",
      no: String((i % 3) + 1),
      siswaId: siswaIds[i],
      nis: siswaRows[i].nis,
      namaSiswa: NAMA[i],
      jenisKelamin: JK[i],
      kelasAsal: "X IPA 1",
      nilai: String(nilaiArr[i]),
    });
  }

  // LCKH
  await db.insert(lckh).values([
    { id: uuidv4(), userId, no: "1", kegiatan: "Kegiatan pembelajaran Matematika", pekerjaan: "Penyusunan materi ajar, pelaksanaan PBM", tanggal: "2026-08-10", jurnalId },
    { id: uuidv4(), userId, no: "2", kegiatan: "Kegiatan penilaian harian", pekerjaan: "Penyusunan dan koreksi soal", tanggal: "2026-08-11", jurnalId: null },
  ]);

  // LKB
  await db.insert(lkb).values([
    { id: uuidv4(), userId, no: "1", uraianTugas: "Penyusunan silabus dan RPP", vol: 3, buktiDokumen: "Dokumen RPP 3 pertemuan", bulan: "Agustus", tahun: "2026" },
    { id: uuidv4(), userId, no: "2", uraianTugas: "Evaluasi hasil belajar siswa", vol: 2, buktiDokumen: "Analisis nilai ulangan harian", bulan: "Agustus", tahun: "2026" },
  ]);

  // Kalender catatan
  await db.insert(kalenderCatatan).values({
    id: uuidv4(),
    userId,
    tanggal: "2026-08-18",
    isi: "Batas pengumpulan nilai tengah semester",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`[SEED] Data dummy dibuat untuk user ${userId}`);
}