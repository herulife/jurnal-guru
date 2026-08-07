"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/useApi";
import ExportButton from "@/components/ExportButton";

interface Kelas { id: string; namaKelas: string; }
interface Row {
  id: string; no: string; kelompok: string; siswaId: string; nis: string; namaSiswa: string; jenisKelamin: string; kelasAsal: string; nilai: string;
}

const GROUP_COUNT = 2;

export default function KelompokBelajarPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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
    if (res.ok) load();
  }

  async function reset() {
    if (!kelasId) return;
    setLoading(true);
    const res = await apiDelete(`/api/kelompok?kelasId=${kelasId}`);
    setLoading(false);
    setMsg(res.msg || "");
    if (res.ok) setData([]);
    setShowConfirm(false);
  }

  const kelompokNames = Array.from(new Set(data.map((r) => r.kelompok).filter(Boolean)));
  const tanpaKelompok = data.filter((r) => !r.kelompok);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Kelompok Belajar</h1>
        <ExportButton
          fileName={`kelompok-${kelas.find((k) => k.id === kelasId)?.namaKelas || "kelas"}`}
          title="Kelompok Belajar"
          subtitle={kelas.find((k) => k.id === kelasId)?.namaKelas || ""}
          columns={[
            { key: "no", label: "No" },
            { key: "kelompok", label: "Kelompok" },
            { key: "nis", label: "NIS" },
            { key: "namaSiswa", label: "Nama" },
            { key: "jenisKelamin", label: "Kel" },
          ]}
          rows={data.filter((r) => r.kelompok)}
        />
      </header>

      {msg && (
        <div className="p-3 mb-4 rounded-xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">{msg}</div>
      )}

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Pengaturan Kelompok</h3>
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

        {kelompokNames.map((gn) => (
          <div key={gn} className="border border-[#E8E4DC] rounded-xl overflow-hidden mt-4">
            <div className="px-4 py-2 bg-[#F5F3EF] font-semibold text-gray-700 text-sm">{gn}</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>No</th><th>NIS</th><th>Nama Siswa</th><th>L/P</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {data.filter((r) => r.kelompok === gn).map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.nis}</td>
                      <td>{r.namaSiswa}</td>
                      <td>{r.jenisKelamin}</td>
                      <td className="text-right">
                        <button className="text-red-500 hover:text-red-700" onClick={() => removeStudent(r.id)} title="Hapus dari grup">
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.filter((r) => r.kelompok === gn).length === 0 && (
                    <tr><td colSpan={5} className="text-center text-gray-400 py-4">Kosong</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

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