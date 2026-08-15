"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/useApi";

interface Kelas { id: string; namaKelas: string; }

interface Row {
  nis: string; nisn: string; namaSiswa: string; jenisKelamin: string;
  namaKelas: string; alamat: string; telepon: string; email: string; namaOrtu: string;
}

const HEADER_MAP: Record<string, string> = {
  nis: "nis", nisn: "nisn", nama: "namaSiswa", "nama siswa": "namaSiswa",
  "nama_siswa": "namaSiswa", "l/p": "jenisKelamin", lp: "jenisKelamin",
  jeniskelamin: "jenisKelamin", kelas: "namaKelas", "nama kelas": "namaKelas",
  alamat: "alamat", telepon: "telepon", nohp: "telepon", "no. hp": "telepon",
  email: "email", ortu: "namaOrtu", "nama ortu": "namaOrtu", "nama_ortu": "namaOrtu",
};

export default function UploadSiswaModal({ kelas }: { kelas: Kelas[] }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [parsedKelas, setParsedKelas] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [onDone, setOnDone] = useState<(() => void) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (window as any).__uploadModal = {
      open: (_kelas: Kelas[], cb: () => void) => {
        setOnDone(() => cb);
        setOpen(true);
        setRows([]);
        setParsedKelas([]);
        setFileName("");
        setMsg(null);
      },
    };
  }, []);

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
    const cells = lines.map((l) =>
      l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""))
    );
    const headerIdx = cells.findIndex((r) => r.some((c) => /nis|nama|siswa/i.test(c)));
    if (headerIdx < 0) return [];
    const header = cells[headerIdx].map((h) => h.toLowerCase());
    const dataRows = cells.slice(headerIdx + 1);
    const result: Row[] = [];
    for (const r of dataRows) {
      if (!r.some((c) => c)) continue;
      const row: Row = {
        nis: "", nisn: "", namaSiswa: "", jenisKelamin: "L", namaKelas: "",
        alamat: "", telepon: "", email: "", namaOrtu: "",
      };
      r.forEach((cell, i) => {
        const key = HEADER_MAP[header[i]] || header[i];
        if (key && key in row) {
          const target = key as keyof Row;
          (row as any)[target] = cell;
        }
      });
      result.push(row);
    }
    return result;
  }

  function parseExcel(rows2D: unknown[][]) {
    const headerIdx = rows2D.findIndex((r) => r.some((c) => /nis|nama|siswa/i.test(String(c))));
    if (headerIdx < 0) return [];
    const header = rows2D[headerIdx].map((h) => String(h).toLowerCase());
    const dataRows = rows2D.slice(headerIdx + 1);
    const result: Row[] = [];
    for (const r of dataRows) {
      if (!r.some((c) => c !== null && c !== undefined && String(c) !== "")) continue;
      const row: Row = {
        nis: "", nisn: "", namaSiswa: "", jenisKelamin: "L", namaKelas: "",
        alamat: "", telepon: "", email: "", namaOrtu: "",
      };
      r.forEach((cell, i) => {
        const key = HEADER_MAP[header[i]] || header[i];
        if (key && key in row) {
          const target = key as keyof Row;
          (row as any)[target] = String(cell ?? "");
        }
      });
      result.push(row);
    }
    return result;
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    setMsg(null);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buf = await file.arrayBuffer();
        const XLSX = await import("xlsx-js-style");
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        setRows(parseExcel(aoa));
      } else {
        const text = await file.text();
        setRows(parseCsv(text));
      }
    } catch {
      setRows([]);
      setMsg({ text: "Gagal membaca file. Pastikan format CSV/Excel benar.", type: "error" });
    }
  }

  useEffect(() => {
    const known = new Set(kelas.map((k) => k.namaKelas.toLowerCase()));
    const found = Array.from(new Set(rows.map((r) => r.namaKelas).filter(Boolean)));
    const notFound = found.filter((k) => !known.has(k.toLowerCase()));
    setParsedKelas(notFound);
  }, [rows, kelas]);

  async function handleUpload() {
    const valid = rows.filter((r) => r.namaSiswa && r.nis);
    if (!valid.length) {
      setMsg({ text: "Tidak ada baris valid (butuh NIS dan Nama Siswa)", type: "error" });
      return;
    }
    setLoading(true);
    setMsg(null);
    const res = await apiPost<{ msg?: string }>("/api/upload", { data: valid });
    setLoading(false);
    if (res.ok) {
      setMsg({ text: res.data?.msg || "Upload berhasil", type: "success" });
      setRows([]);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
      onDone?.();
    } else {
      setMsg({ text: res.msg || "Upload gagal", type: "error" });
    }
  }

  if (!open) return null;

  const kelasList = Array.from(new Set(rows.map((r) => r.namaKelas).filter(Boolean)));
  const kelasNama = new Map(kelas.map((k) => [k.namaKelas.toLowerCase(), k.namaKelas]));
  const badRows = rows.filter((r) => r.namaKelas && !kelasNama.has(r.namaKelas.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">Upload Data Siswa</h3>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button className="btn btn-outline" onClick={() => fileRef.current?.click()}>
              <i className="fas fa-folder-open"></i> Pilih File CSV/Excel
            </button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {fileName && <span className="text-sm text-gray-600"><i className="fas fa-file mr-1 text-[#0D7C66]"></i>{fileName}</span>}
          </div>

          <p className="text-xs text-gray-500 mb-1">
            Format kolom: <span className="font-semibold">NIS, NISN, Nama Siswa, L/P, Kelas, Telepon, Ortu</span>.
            Kolom Kelas harus sama persis dengan nama kelas yang sudah dibuat.
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); downloadTemplate(); }} className="text-xs text-[#0D7C66] hover:underline inline-flex items-center gap-1 mb-4">
            <i className="fas fa-download"></i> Download template
          </a>

          {parsedKelas.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Kelas tidak ditemukan: <span className="font-semibold">{parsedKelas.join(", ")}</span>. Baris tanpa kelas yang valid akan dilewati. Buat kelas terlebih dahulu di menu Data Kelas.
            </div>
          )}

          {rows.length > 0 && (
            <>
              <div className="table-wrap max-h-72 overflow-auto mb-3">
                <table className="text-xs">
                  <thead><tr><th>NIS</th><th>Nama</th><th>L/P</th><th>Kelas</th><th>Telepon</th></tr></thead>
                  <tbody>
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className={r.namaSiswa && r.nis ? "" : "bg-red-50"}>
                        <td>{r.nis || "-"}</td>
                        <td>{r.namaSiswa || "-"}</td>
                        <td>{r.jenisKelamin || "-"}</td>
                        <td>{r.namaKelas || "-"}</td>
                        <td>{r.telepon || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mb-3">{rows.length} baris dibaca{rows.length > 50 ? " (menampilkan 50 pertama)" : ""}</p>
            </>
          )}

          {msg && (
            <div className={`p-3 mb-3 rounded-xl border text-sm ${msg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <i className={`fas ${msg.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} mr-1`}></i>{msg.text}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button className="btn btn-outline" onClick={() => setOpen(false)}>Tutup</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={loading || rows.length === 0}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-upload"></i> Upload</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function downloadTemplate() {
    const headers = ["NIS", "NISN", "Nama Siswa", "L/P", "Kelas", "Telepon", "Ortu"];
    const sample = ["0012345678", "0012345689", "Contoh Nama Siswa", "L", "X IPA 1", "081234567890", "Nama Orang Tua"];
    const csv = [headers.join(","), sample.join(",")].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-upload-siswa.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}