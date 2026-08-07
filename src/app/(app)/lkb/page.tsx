"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";

interface Row { id: string; no: string | null; uraianTugas: string | null; vol: number; buktiDokumen: string | null; bulan: string | null; tahun: string | null; }

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function LKBPage() {
  const now = new Date();
  const [bulan, setBulan] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [tahun, setTahun] = useState(String(now.getFullYear()));
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiGet(`/api/lkb?bulan=${bulan}&tahun=${tahun}`);
    if (res.ok && Array.isArray(res.data)) setData(res.data as Row[]);
    setLoading(false);
  }, [bulan, tahun]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [data]);

  async function generate() {
    setLoading(true);
    const res = await apiPost<{ data: Row[] }>("/api/lkb", { action: "generate", bulan, tahun });
    setLoading(false);
    if (res.ok && res.data?.data) {
      setData(res.data.data);
      setMsg("LKB di-generate dari LCKH. Klik Simpan untuk menyimpan.");
    } else {
      setMsg(res.msg || "Generate gagal");
    }
  }

  async function save() {
    setLoading(true);
    const res = await apiPost("/api/lkb", {
      records: data.map((r) => ({ ...r, bulan, tahun })),
      bulan, tahun,
    });
    setLoading(false);
    setMsg(res.msg || (res.ok ? "Disimpan" : "Gagal"));
    if (res.ok) load();
  }

  function addRow() {
    setData((prev) => [...prev, { id: `tmp-${Date.now()}`, no: String(prev.length + 1), uraianTugas: "", vol: 0, buktiDokumen: "", bulan, tahun }]);
  }

  function updateRow(id: string, field: keyof Row, value: string) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: field === "vol" ? Number(value) : value } : r)));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id); else nxt.add(id);
      return nxt;
    });
  }
  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((r) => r.id)));
  }
  function deleteSelected() {
    const ids = selected;
    setData((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelected(new Set());
  }

  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">LKB</h1>
        <ExportButton
          fileName={`lkb-${bulan}-${tahun}`}
          title="Laporan Kinerja Bulanan"
          subtitle={`Bulan ${bulan}/${tahun}`}
          columns={[
            { key: "no", label: "No" },
            { key: "uraianTugas", label: "Uraian Tugas" },
            { key: "vol", label: "Vol" },
            { key: "buktiDokumen", label: "Bukti Dokumen" },
          ]}
          rows={data}
        />
      </header>

      {msg && <div className="p-3 mb-4 rounded-xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">{msg}</div>}

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Pengaturan LKB</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Bulan</label>
            <select className="input text-sm w-36" value={bulan} onChange={(e) => setBulan(e.target.value)}>
              {BULAN.map((b, i) => <option key={b} value={String(i + 1).padStart(2, "0")}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tahun</label>
            <select className="input text-sm w-28" value={tahun} onChange={(e) => setTahun(e.target.value)}>
              {[3, 2, 1, 0].map((d) => <option key={d} value={String(now.getFullYear() - d)}>{now.getFullYear() - d}</option>)}
              <option value={String(now.getFullYear() + 1)}>{now.getFullYear() + 1}</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}><i className="fas fa-magic"></i> Generate dari LCKH</button>
          <button className="btn btn-accent" onClick={save} disabled={loading}><i className="fas fa-save"></i> Simpan</button>
          <button className="btn btn-outline" onClick={addRow}><i className="fas fa-plus"></i> Tambah Baris</button>
          {selected.size > 0 && <button className="btn btn-danger" onClick={deleteSelected}><i className="fas fa-trash"></i> Hapus Terpilih</button>}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Tabel LKB</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length} onChange={toggleAll} /></th>
                <th className="w-10">No</th><th>Uraian Tugas</th><th className="w-24">Vol</th><th>Bukti Dokumen</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Pilih bulan & tahun, klik Generate"}</td></tr>}
              {paginated.map((r, i) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td><input className="input text-sm" value={r.uraianTugas || ""} onChange={(e) => updateRow(r.id, "uraianTugas", e.target.value)} /></td>
                  <td><input type="number" className="input text-sm" value={r.vol} onChange={(e) => updateRow(r.id, "vol", e.target.value)} /></td>
                  <td><input className="input text-sm" value={r.buktiDokumen || ""} onChange={(e) => updateRow(r.id, "buktiDokumen", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />
      </div>
    </div>
  );
}