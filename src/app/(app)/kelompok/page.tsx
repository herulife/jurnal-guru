"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/useApi";
import { bukaDokumen, esc } from "@/lib/dokumen";
import ExportButton from "@/components/ExportButton";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import PlanGuard from "@/components/PlanGuard";
import { useToast } from "@/components/Feedback";

interface Kelas { id: string; namaKelas: string; }
interface Row {
  id: string; no: string; kelompok: string; siswaId: string; nis: string; namaSiswa: string; jenisKelamin: string; kelasAsal: string; nilai: string;
}

const GROUP_COUNT = 2;

function KelompokBelajarPageInner() {
  const { show } = useToast();
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadKelas = useCallback(async () => {
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setKelas(res.data);
  }, []);

  const load = useCallback(async () => {
    if (!kelasId) { setData([]); return; }
    setLoading(true);
    const res = await apiGet<Row[]>(`/api/kelompok?kelasId=${kelasId}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [kelasId]);

  useEffect(() => { loadKelas(); }, [loadKelas]);
  useEffect(() => { load(); }, [load]);

  async function autoGenerate() {
    if (!kelasId) { setMsg("Pilih kelas dulu"); return; }
    setLoading(true);
    setMsg("");
    const siswa = await apiGet<{ id: string; nis: string; namaSiswa: string; jenisKelamin: string }[]>(
      `/api/siswa?kelasId=${kelasId}`
    );
    if (!siswa.ok || !siswa.data?.length) {
      setMsg("Tidak ada siswa di kelas ini");
      setLoading(false);
      return;
    }
    const existing = data.filter((r) => r.siswaId);
    const assigned = new Set(existing.map((r) => r.siswaId));
    const unassigned = (siswa.data || []).filter((sw) => !assigned.has(sw.id));
    const newRows: Row[] = unassigned.map((sw, i) => ({
      id: `tmp-${sw.id}`,
      no: String(i + 1),
      kelompok: `Kelompok ${(i % GROUP_COUNT) + 1}`,
      siswaId: sw.id,
      nis: sw.nis,
      namaSiswa: sw.namaSiswa,
      jenisKelamin: sw.jenisKelamin,
      kelasAsal: kelasId,
      nilai: "",
    }));
    setData([...existing, ...newRows]);
    setLoading(false);
    setMsg(`${newRows.length} siswa dibagi ke ${GROUP_COUNT} kelompok. Klik "Simpan" untuk menyimpan.`);
  }

  function removeStudent(id: string) {
    setData((prev) => prev.filter((r) => r.id !== id));
  }

  async function save() {
    if (!kelasId) return;
    setLoading(true);
    const res = await apiPost("/api/kelompok", {
      kelasId,
      records: data.filter((r) => r.kelompok).map((r) => ({
        kelompok: r.kelompok, no: r.no, siswaId: r.siswaId, nis: r.nis,
        namaSiswa: r.namaSiswa, jenisKelamin: r.jenisKelamin, kelasAsal: r.kelasAsal, nilai: r.nilai,
      })),
    });
    setLoading(false);
    setMsg(res.msg || (res.ok ? "Disimpan" : "Gagal menyimpan"));
    if (res.ok) {
      show("Data kelompok berhasil disimpan", "success");
      load();
    } else {
      show(res.msg || "Gagal menyimpan data kelompok", "error");
    }
  }

  async function reset() {
    if (!kelasId) return;
    setLoading(true);
    const res = await apiDelete(`/api/kelompok?kelasId=${kelasId}`);
    setLoading(false);
    setMsg(res.msg || "");
    if (res.ok) {
      show("Data kelompok berhasil dihapus", "success");
      setData([]);
    } else {
      show(res.msg || "Gagal menghapus data kelompok", "error");
    }
    setShowConfirm(false);
  }

  async function importExcel(file: File) {
    if (!kelasId) { setMsg("Pilih kelas dulu"); return; }
    setLoading(true);
    try {
      const text = await file.text();
      const sep = text.includes("\t") ? "\t" : (text.includes(";") ? ";" : ",");
      const rows = text.split(/\r?\n/).filter((l) => l.trim()).map((l) =>
        l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""))
      );
      const headerIdx = rows.findIndex((r) => r.some((c) => /kelompok|nama|nis/i.test(c)));
      const dataRows = headerIdx >= 0 ? rows.slice(headerIdx + 1) : rows;
      const records = dataRows
        .map((r) => ({
          kelompok: r[1] || "",
          no: r[0] || "",
          nis: r[2] || "",
          namaSiswa: r[3] || "",
          jenisKelamin: r[4] || "",
          kelasAsal: kelasId,
          siswaId: "",
          nilai: "",
        }))
        .filter((r) => r.kelompok && r.namaSiswa);
      if (!records.length) {
        setLoading(false);
        setMsg("Tidak ada baris valid di file. Format: No, Kelompok, NIS, Nama, L/P");
        return;
      }
      const res = await apiPost("/api/kelompok", { kelasId, records });
      setLoading(false);
      setMsg(res.msg || (res.ok ? `${records.length} data berhasil diimpor` : "Gagal import"));
      if (res.ok) {
        show(`${records.length} data berhasil diimpor`, "success");
        load();
      } else {
        show(res.msg || "Gagal mengimpor data kelompok", "error");
      }
    } catch {
      setLoading(false);
      setMsg("Gagal membaca file");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const kelompokNames = Array.from(new Set(data.map((r) => r.kelompok).filter(Boolean)));

  async function cetakPDF() {
    const namaKelas = kelas.find((k) => k.id === kelasId)?.namaKelas || "";
    const tbody = data
      .map(
        (r, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(r.kelompok)}</td><td>${esc(r.nis)}</td><td>${esc(r.namaSiswa)}</td><td>${esc(r.jenisKelamin)}</td></tr>`
      )
      .join("");
    await bukaDokumen({
      judul: "KELOMPOK BELAJAR",
      identitas: [`:Kelas~${namaKelas}`],
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>Kelompok</th><th>NIS</th><th>Nama Siswa</th><th>L/P</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }
  const tanpaKelompok = data.filter((r) => !r.kelompok);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Kelompok Belajar</h1>
        <div className="flex items-center gap-2">
        <HeaderActions />
        <ExportButton
          fileName={`kelompok-${kelas.find((k) => k.id === kelasId)?.namaKelas || "kelas"}`}
          title="Kelompok Belajar"
          subtitle={kelas.find((k) => k.id === kelasId)?.namaKelas || ""}
          minPlan="pro"
          columns={[
            { key: "no", label: "No" },
            { key: "kelompok", label: "Kelompok" },
            { key: "nis", label: "NIS" },
            { key: "namaSiswa", label: "Nama" },
            { key: "jenisKelamin", label: "Kel" },
          ]}
          rows={data.filter((r) => r.kelompok)}
        />
        </div>
      </header>

      {msg && (
        <div className="p-3 mb-4 rounded-xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">{msg}</div>
      )}

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Pengaturan Kelompok</h3>
          <TutorialLink href="/panduan#lainnya" label="Panduan" />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Kelas</label>
            <select className="input text-sm w-48" value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">Pilih Kelas</option>
              {kelas.map((k) => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={autoGenerate} disabled={loading || !kelasId}><i className="fas fa-magic"></i> Auto Generate</button>
          <button className="btn btn-accent" onClick={save} disabled={loading || !kelasId}><i className="fas fa-save"></i> Simpan</button>
          <button className="btn btn-accent" onClick={cetakPDF} disabled={!kelasId}><i className="fas fa-file-pdf"></i> Cetak PDF</button>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><i className="fas fa-file-excel"></i> Import Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.csv,text/csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) importExcel(e.target.files[0]); }} />
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)} disabled={loading || !kelasId}><i className="fas fa-trash"></i> Reset</button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-800 mb-2">Reset Kelompok?</h3>
            <p className="text-sm text-gray-500 mb-4">Semua data kelompok untuk kelas ini akan dihapus.</p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>Batal</button>
              <button className="btn btn-danger" onClick={reset}>Ya, Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-bold text-gray-800 font-[Outfit]">Daftar Kelompok</h3>
        {data.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">{loading ? "Memuat..." : "Pilih kelas lalu klik Auto Generate"}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {kelompokNames.map((gn) => {
            const members = data.filter((r) => r.kelompok === gn);
            return (
              <div key={gn} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 font-[Outfit]">{gn}</h3>
                  <span className="badge">{members.length} siswa</span>
                </div>
                {members.length === 0 && <p className="text-sm text-gray-400">Kosong</p>}
                {members.length > 0 && (
                  <ul className="space-y-2">
                    {members.map((r, i) => (
                      <li key={r.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="w-6 text-center text-gray-400 shrink-0">{i + 1}</span>
                          <span className="font-semibold truncate">{r.namaSiswa}</span>
                          <span className="text-xs text-gray-400 shrink-0">{r.nis}</span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className={`badge ${r.jenisKelamin === "L" ? "badge-izin" : ""}`} style={r.jenisKelamin === "P" ? { backgroundColor: "#FCE7F3", color: "#9D174D" } : undefined}>{r.jenisKelamin}</span>
                          <button className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer" onClick={() => removeStudent(r.id)} title="Hapus dari grup">
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {tanpaKelompok.length > 0 && (
          <div className="mt-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-700 mb-2">{tanpaKelompok.length} siswa belum masuk kelompok</p>
            <button className="btn btn-outline btn-sm" onClick={autoGenerate}><i className="fas fa-magic"></i> Bagi otomatis</button>
          </div>
        )}
      </div>
    </div>
  );
}
export default function KelompokBelajarPage() {
  return (
    <PlanGuard min="pro">
      <KelompokBelajarPageInner />
    </PlanGuard>
  );
}
