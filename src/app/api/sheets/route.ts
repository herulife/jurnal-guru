import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  dataKelas,
  dataSiswa,
  jadwalMengajar,
  absensi,
  nilai,
  jurnalMengajar,
  dataSurat,
  kelompokBelajar,
  lckh,
  lkb,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { writeToSpreadsheet, getServiceAccountEmail } from "@/lib/sheets";

const SCOPE_COL = ["Kelas", "Siswa", "Jadwal", "Absensi", "Nilai", "Jurnal", "Surat", "Kelompok", "LCKH", "LKB"];

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await db.select({ googleSheetsUrl: users.googleSheetsUrl }).from(users).where(eq(users.id, session.id)).get();
    return apiOk({
      spreadsheetUrl: user?.googleSheetsUrl || "",
      serviceAccountEmail: getServiceAccountEmail(),
      scopes: SCOPE_COL,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const spreadsheetUrl = String(body.spreadsheetUrl || "").trim();

    if (body.action === "sync") {
      if (!spreadsheetUrl) return apiError("Isi URL spreadsheet dulu");
      const result = await syncAll(session.id, spreadsheetUrl);
      await addLog(session.id, "SYNC_SHEETS", result.msg);
      return apiOk(result);
    }

    // simpan URL
    if (!spreadsheetUrl) return apiError("URL spreadsheet wajib diisi");
    await db.update(users).set({ googleSheetsUrl: spreadsheetUrl }).where(eq(users.id, session.id));
    await addLog(session.id, "SAVE_SHEETS_URL", "Simpan URL spreadsheet");
    return apiOk(null, "URL spreadsheet disimpan");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

async function syncAll(userId: string, spreadsheetUrl: string): Promise<{ msg: string }> {
  const kelas = await db.select().from(dataKelas).all();
  const kelasMap: Record<string, string> = {};
  for (const k of kelas) kelasMap[k.id] = k.namaKelas;
  const siswa = await db.select().from(dataSiswa).all();
  const siswaMap: Record<string, string> = {};
  for (const s of siswa) siswaMap[s.id] = s.namaSiswa;

  const tables: { name: string; header: string[]; rows: (string | number)[][] }[] = [
    {
      name: "Kelas",
      header: ["Nama Kelas", "Tingkat", "Jurusan", "Tahun Ajaran", "Wali Kelas", "Jumlah Siswa"],
      rows: kelas.map((k) => [
        k.namaKelas, k.tingkat, k.jurusan || "", k.tahunAjaran || "", k.waliKelas || "",
        siswa.filter((s) => s.kelasId === k.id).length,
      ]),
    },
    {
      name: "Siswa",
      header: ["NIS", "NISN", "Nama", "Jenis Kelamin", "Kelas", "Alamat", "Telepon", "Email", "Nama Ortu"],
      rows: siswa.map((s) => [
        s.nis, s.nisn || "", s.namaSiswa, s.jenisKelamin, s.kelasId ? kelasMap[s.kelasId] || "" : "",
        s.alamat || "", s.telepon || "", s.email || "", s.namaOrtu || "",
      ]),
    },
    {
      name: "Jadwal",
      header: ["Kelas", "Mapel", "Hari", "Jam Mulai", "Jam Selesai", "Semester", "Ruangan"],
      rows: (await db.select().from(jadwalMengajar).all()).map((j) => [
        j.kelasId ? kelasMap[j.kelasId] || "" : "", j.mataPelajaran, j.hari, j.jamMulai || "", j.jamSelesai || "",
        j.semester || "", j.ruangan || "",
      ]),
    },
    {
      name: "Absensi",
      header: ["Tanggal", "Siswa", "Kelas", "Mapel", "Status", "Keterangan"],
      rows: (await db.select().from(absensi).all()).map((a) => [
        a.tanggal, a.siswaId ? siswaMap[a.siswaId] || "" : "", a.kelasId ? kelasMap[a.kelasId] || "" : "",
        a.mataPelajaran || "", a.status, a.keterangan || "",
      ]),
    },
    {
      name: "Nilai",
      header: ["Tanggal", "Siswa", "Kelas", "Mapel", "Kategori", "BAB", "Nilai", "KKM", "Remedial"],
      rows: (await db.select().from(nilai).all()).map((n) => [
        n.tanggal || "", n.siswaId ? siswaMap[n.siswaId] || "" : "", n.kelasId ? kelasMap[n.kelasId] || "" : "",
        n.mataPelajaran || "", n.kategori || "", n.bab || "", Number(n.nilai) || 0, Number(n.kkm) || 75, n.remedial || "",
      ]),
    },
    {
      name: "Jurnal",
      header: ["Tanggal", "Kelas", "Mapel", "Jam Ke", "Materi", "Deskripsi", "Kendala", "Solusi", "Kehadiran", "Catatan"],
      rows: (await db.select().from(jurnalMengajar).all()).map((j) => [
        j.tanggal || "", j.kelasId ? kelasMap[j.kelasId] || "" : "", j.mataPelajaran || "", j.jamKe || "",
        j.materi || "", j.deskripsi || "", j.kendala || "", j.solusi || "", j.kehadiranSiswa || "", j.catatan || "",
      ]),
    },
    {
      name: "Surat",
      header: ["Judul", "Jenis", "Tujuan", "Template"],
      rows: (await db.select().from(dataSurat).all()).map((s) => [
        s.judul, s.jenis, s.tujuan || "", s.template,
      ]),
    },
    {
      name: "Kelompok",
      header: ["Kelas", "Kelompok", "No", "NIS", "Nama", "JK", "Kelas Asal"],
      rows: (await db.select().from(kelompokBelajar).all()).map((kb) => [
        kb.kelasId ? kelasMap[kb.kelasId] || "" : "", kb.kelompok, kb.no || "",
        kb.nis || "", kb.namaSiswa || "", kb.jenisKelamin || "", kb.kelasAsal || "",
      ]),
    },
    {
      name: "LCKH",
      header: ["No", "Kegiatan", "Pekerjaan", "Tanggal"],
      rows: (await db.select().from(lckh).all()).map((l) => [l.no || "", l.kegiatan || "", l.pekerjaan || "", l.tanggal || ""]),
    },
    {
      name: "LKB",
      header: ["No", "Uraian Tugas", "Vol", "Bukti Dokumen", "Bulan", "Tahun"],
      rows: (await db.select().from(lkb).all()).map((l) => [
        l.no || "", l.uraianTugas || "", Number(l.vol) || 0, l.buktiDokumen || "", l.bulan || "", l.tahun || "",
      ]),
    },
  ];

  const lines: string[] = [];
  for (const t of tables) {
    const res = await writeToSpreadsheet(spreadsheetUrl, t.name, [t.header, ...t.rows]);
    lines.push(`${t.name}: ${res.msg}`);
    if (!res.ok) return { msg: lines.join("; ") };
  }
  return { msg: `Sinkronisasi selesai. ${lines.length} tabel ditulis.` };
}