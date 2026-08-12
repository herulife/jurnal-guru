"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal";
import { apiPost } from "@/lib/useApi";

interface UploadModalProps {
  onDone: () => void;
  onClose: () => void;
}

export default function UploadModal({ onDone, onClose }: UploadModalProps) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      setParsing(true);
      try {
        const rows = raw
          .split(/\r?\n/)
          .filter((l) => l.trim().length > 0)
          .slice(1);
        const mapped = rows.map((line) => {
          const c = line.split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
          return {
            nis: c[0] || "",
            nisn: c[1] || "",
            namaSiswa: c[2] || "",
            jenisKelamin: (c[3] || "L").toUpperCase() === "P" ? "P" : "L",
            namaKelas: c[4] || "",
            telepon: c[5] || "",
            namaOrtu: c[6] || "",
          };
        });
        setText(JSON.stringify(mapped));
      } catch {
        setText("");
      }
      setParsing(false);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  async function handleSubmit() {
    let data: unknown[];
    try {
      data = JSON.parse(text || "[]");
    } catch {
      setResult({ added: 0, skipped: 0, errors: ["Format data tidak valid. Gunakan template CSV atau paste JSON."] });
      return;
    }
    if (!Array.isArray(data) || !data.length) {
      setResult({ added: 0, skipped: 0, errors: ["Tidak ada data untuk diupload."] });
      return;
    }
    const res = await apiPost<{ added: number; skipped: number; errors: string[] }>("/api/upload", { data });
    if (res.ok && res.data) {
      setResult(res.data);
      onDone();
    } else {
      setResult({ added: 0, skipped: 0, errors: [res.msg || "Upload gagal"] });
    }
  }

  return (
    <Modal open maxWidth="max-w-lg" onClose={onClose} title="Upload Data Siswa">
      <div className="p-5">
        <p className="text-sm text-gray-500 mb-4">
          Unggah data siswa massal. Gunakan template CSV (NIS, NISN, Nama Siswa, L/P, Kelas, Telepon, Ortu) — baris pertama adalah header.
        </p>
        <div className="mb-4">
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
            <i className="fas fa-file-csv mr-1"></i> Pilih File CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt,.json" className="hidden" onChange={handleFile} />
        </div>
        <textarea
          className="input min-h-[140px] mb-4 text-xs font-mono"
          placeholder='[{"nis":"001","namaSiswa":"Contoh","jenisKelamin":"L","namaKelas":"X IPA 1"}]'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {parsing && <p className="text-xs text-gray-500 mb-3">Memproses file...</p>}
        {result && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${result.errors.length ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
            <p><b>{result.added}</b> ditambahkan, <b>{result.skipped}</b> dilewati.</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((er, i) => <li key={i}>{er}</li>)}
              </ul>
            )}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn btn-outline" onClick={onClose}>Tutup</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!text.trim()}>
            <i className="fas fa-upload mr-1"></i> Upload
          </button>
        </div>
      </div>
    </Modal>
  );
}
