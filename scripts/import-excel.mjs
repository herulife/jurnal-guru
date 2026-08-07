import { createClient } from "@libsql/client";
import XLSX from "xlsx";
import bcrypt from "bcryptjs";

const EXCEL_PATH = "C:/Users/Administrator/Documents/UMMI/Teacher Dashboard/Teacher Dashboard.xlsx";
const DB_PATH = "file:./data.db";

function excelDateToISO(serial) {
  if (!serial && serial !== 0) return "";
  if (typeof serial === "string") return serial;
  return new Date((serial - 25569) * 86400 * 1000).toISOString().split("T")[0];
}

function excelTimeToString(serial) {
  if (!serial && serial !== 0) return "";
  if (typeof serial === "string") return serial;
  const totalSeconds = Math.round(serial * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const wb = XLSX.readFile(EXCEL_PATH);

function getData(sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

const client = createClient({ url: DB_PATH });

async function run(sql, params) {
  await client.execute({ sql, args: params });
}

async function main() {
  console.log("Reading Excel...");
  const usersList = getData("Users");
  const pList = getData("Profil_Sekolah");
  const kelasList = getData("Data_Kelas");
  const siswaList = getData("Data_Siswa");
  const jadwalList = getData("Jadwal_Mengajar");
  const absensiList = getData("Absensi");
  const nilaiList = getData("Nilai");
  const jurnalList = getData("Jurnal_Mengajar");
  const settingsList = getData("Settings");
  const logList = getData("Activity_Log");

  await run("DELETE FROM activity_log", []);
  await run("DELETE FROM data_surat", []);
  await run("DELETE FROM settings", []);
  await run("DELETE FROM jurnal_mengajar", []);
  await run("DELETE FROM nilai", []);
  await run("DELETE FROM absensi", []);
  await run("DELETE FROM jadwal_mengajar", []);
  await run("DELETE FROM data_siswa", []);
  await run("DELETE FROM data_kelas", []);
  await run("DELETE FROM profil_sekolah", []);
  await run("DELETE FROM users", []);

  console.log(`Users: ${usersList.length}`);
  for (const u of usersList) {
    const pw = bcrypt.hashSync(u.Password || "admin123", 10);
    await run(
      "INSERT INTO users (id, username, password_hash, nama_lengkap, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [u.ID, u.Username, pw, u.Nama_Lengkap || "", u.Role || "admin", u.Created_At ? excelDateToISO(u.Created_At) : new Date().toISOString()]
    );
  }

  console.log(`Profil Sekolah: ${pList.length}`);
  for (const p of pList) {
    await run(
      "INSERT INTO profil_sekolah (id, nama_sekolah, alamat, npsn, kota, provinsi, telepon, kepala_sekolah, nip_kepsek, nama_guru, nip_guru, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [p.ID, p.Nama_Sekolah || "", p.Alamat || "", String(p.NPSN || ""), p.Kota || "", p.Provinsi || "", p.Telepon || "", p.Kepala_Sekolah || "", p.NIP_Kepsek || "", p.Nama_Guru || "", p.NIP_Guru || "", p.Logo_URL || ""]
    );
  }

  console.log(`Data Kelas: ${kelasList.length}`);
  for (const k of kelasList) {
    await run(
      "INSERT INTO data_kelas (id, nama_kelas, tingkat, jurusan, tahun_ajaran, wali_kelas) VALUES (?, ?, ?, ?, ?, ?)",
      [k.ID, k.Nama_Kelas, Number(k.Tingkat) || 0, k.Jurusan || "", k.Tahun_Ajaran || "", k.Wali_Kelas || ""]
    );
  }

  console.log(`Data Siswa: ${siswaList.length}`);
  for (const s of siswaList) {
    await run(
      "INSERT INTO data_siswa (id, nis, nisn, nama_siswa, jenis_kelamin, kelas_id, alamat, telepon, email, nama_ortu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [s.ID, String(s.NIS), String(s.NISN || ""), s.Nama_Siswa, s.Jenis_Kelamin || "L", s.Kelas_ID || "", s.Alamat || "", s.Telepon || "", s.Email || "", s.Nama_Ortu || ""]
    );
  }

  console.log(`Jadwal Mengajar: ${jadwalList.length}`);
  for (const j of jadwalList) {
    await run(
      "INSERT INTO jadwal_mengajar (id, kelas_id, mata_pelajaran, hari, jam_mulai, jam_selesai, semester, ruangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [j.ID, j.Kelas_ID || "", j.Mata_Pelajaran, j.Hari, excelTimeToString(j.Jam_Mulai), excelTimeToString(j.Jam_Selesai), j.Semester || "", j.Ruangan || ""]
    );
  }

  console.log(`Absensi: ${absensiList.length}`);
  for (const a of absensiList) {
    await run(
      "INSERT INTO absensi (id, tanggal, siswa_id, kelas_id, mata_pelajaran, status, keterangan, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [a.ID, excelDateToISO(a.Tanggal), a.Siswa_ID || "", a.Kelas_ID || "", a.Mata_Pelajaran || "", a.Status || "Hadir", a.Keterangan || "", a.Guru_ID || ""]
    );
  }

  console.log(`Nilai: ${nilaiList.length}`);
  for (const n of nilaiList) {
    await run(
      "INSERT INTO nilai (id, tanggal, siswa_id, kelas_id, mata_pelajaran, kategori, bab, tujuan_pembelajaran, bentuk_penugasan, nilai, kkm, remedial) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [n.ID, excelDateToISO(n.Tanggal), n.Siswa_ID || "", n.Kelas_ID || "", n.Mata_Pelajaran || "", n.Kategori || "", n.BAB || "", n.Tujuan_Pembelajaran || "", n.Bentuk_Penugasan || "", Number(n.Nilai) || 0, Number(n.KKM) || 75, n.Remedial || ""]
    );
  }

  console.log(`Jurnal Mengajar: ${jurnalList.length}`);
  for (const j of jurnalList) {
    await run(
      "INSERT INTO jurnal_mengajar (id, tanggal, kelas_id, mata_pelajaran, jam_ke, materi, deskripsi, kendala, solusi, kehadiran_siswa, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [j.ID, excelDateToISO(j.Tanggal), j.Kelas_ID || "", j.Mata_Pelajaran || "", String(j.Jam_Ke || ""), j.Materi || "", j.Deskripsi || "", j.Kendala || "", j.Solusi || "", j.Kehadiran_Siswa || "", j.Catatan || ""]
    );
  }

  console.log(`Settings: ${settingsList.length}`);
  for (const s of settingsList) {
    await run("INSERT INTO settings (key, value) VALUES (?, ?)", [s.Key, s.Value || ""]);
  }

  const suratList = getData("Surat");
  console.log(`Surat: ${suratList.length}`);
  for (const s of suratList) {
    await run("INSERT INTO data_surat (id, judul, jenis, tujuan, template, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [s.ID, s.Judul || "", s.Jenis || "", s.Tujuan || "", s.Template || "", s.Created_At || new Date().toISOString(), s.Updated_At || new Date().toISOString()]);
  }

  console.log(`Activity Log: ${logList.length}`);
  for (const a of logList) {
    const ts = a.Timestamp
      ? (typeof a.Timestamp === "number" ? excelDateToISO(a.Timestamp) + "T" + excelTimeToString(a.Timestamp % 1) + ":00" : String(a.Timestamp))
      : new Date().toISOString();
    await run("INSERT INTO activity_log (id, timestamp, user_id, action, description) VALUES (?, ?, ?, ?, ?)", [a.ID, ts, a.User_ID || "", a.Action || "", a.Description || ""]);
  }

  // Verify
  const v = await client.execute("SELECT 'users' as tbl, COUNT(*) as c FROM users UNION ALL SELECT 'profil_sekolah', COUNT(*) FROM profil_sekolah UNION ALL SELECT 'data_kelas', COUNT(*) FROM data_kelas UNION ALL SELECT 'data_siswa', COUNT(*) FROM data_siswa UNION ALL SELECT 'jadwal_mengajar', COUNT(*) FROM jadwal_mengajar UNION ALL SELECT 'absensi', COUNT(*) FROM absensi UNION ALL SELECT 'jurnal_mengajar', COUNT(*) FROM jurnal_mengajar UNION ALL SELECT 'activity_log', COUNT(*) FROM activity_log UNION ALL SELECT 'data_surat', COUNT(*) FROM data_surat");
  for (const row of v.rows) {
    console.log(`  ${row.tbl}: ${row.c}`);
  }
  console.log("Done!");
  client.close();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
