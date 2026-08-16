"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import { bukaDokumen, exportXlsx, esc } from "@/lib/dokumen";
import PlanGuard from "@/components/PlanGuard";
import { useToast } from "@/components/Feedback";

interface Row { id: string; no: string; kegiatan: string; pekerjaan: string; tanggal: string; jurnalId: string; }

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function LCKHPageInner() {
  const { show } = useToast();
  const now = new Date();
  const [bulan, setBulan] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [tahun, setTahun] = useState(String(now.getFullYear()));
  const [data, setData] = useState<LCKHJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [formKegiatan, setFormKegiatan] = useState("");
  const [formPekerjaan, setFormPekerjaan] = useState("");
  const [formTanggal, setFormTanggal] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiGet(`/api/lckh?bulan=${bulan}&tahun=${tahun}`);
    if (res.ok && Array.isArray(res.data)) setData(res.data as LCKHJson[]);
    setLoading(false);
  }, [bulan, tahun]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [data]);

  async function generate() {
    setLoading(true);
    const res = await apiPost<{ data: LCKHJson[] }>("/api/lckh", { action: "generate", bulan, tahun });
    setLoading(false);
    if (res.ok && res.data?.data) {
      setData(res.data.data);
      setMsg("LCKH di-generate dari jurnal. Klik Simpan untuk menyimpan.");
      show("LCKH berhasil di-generate dari jurnal", "success");
    } else {
      setMsg(res.msg || "Generate gagal");
      show(res.msg || "Gagal generate LCKH", "error");
    }
  }

  async function save() {
    setLoading(true);
    const res = await apiPost("/api/lckh", { records: data, bulan, tahun });
    setLoading(false);
    setMsg(res.msg || (res.ok ? "Disimpan" : "Gagal"));
    if (res.ok) {
      show("LCKH berhasil disimpan", "success");
      load();
    } else {
      show(res.msg || "Gagal menyimpan LCKH", "error");
    }
  }

  function addRow() {
    setData((prev) => [...prev, { id: `tmp-${Date.now()}`, no: String(prev.length + 1), kegiatan: "", pekerjaan: "", tanggal: `${tahun}-${bulan}-01`, jurnalId: "" }]);
    setPage(Math.ceil((data.length + 1) / pageSize));
  }

  function updateRow(id: string, field: keyof LCKHJson, value: string) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function openEdit(r: LCKHJson) {
    setEditId(r.id);
    setFormKegiatan(r.kegiatan || "");
    setFormPekerjaan(r.pekerjaan || "");
    setFormTanggal(r.tanggal || "");
  }

  function closeEdit() {
    setEditId(null);
  }

  function saveEdit() {
    if (!editId) return;
    updateRow(editId, "kegiatan", formKegiatan);
    updateRow(editId, "pekerjaan", formPekerjaan);
    updateRow(editId, "tanggal", formTanggal);
    setEditId(null);
  }

  async function exportExcel() {
    const headers = ["No", "Kegiatan", "Pekerjaan", "Tanggal"];
    const rows = data.map((r, i) => [i + 1, r.kegiatan || "", r.pekerjaan || "", r.tanggal || ""]);
    await exportXlsx({
      file: `lckh-${bulan}-${tahun}.xlsx`,
      judul: "LAPORAN CATATAN KEGIATAN HARIAN",
      identitas: [`:Bulan~${BULAN[Number(bulan) - 1] || bulan} ${tahun}`],
      headers,
      rows,
    });
  }

  async function cetakPDF() {
    const tbody = data
      .map(
        (r, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(r.kegiatan || "-")}</td><td>${esc(r.pekerjaan || "-")}</td><td>${esc(r.tanggal || "-")}</td></tr>`
      )
      .join("");
    await bukaDokumen({
      judul: "LAPORAN CATATAN KEGIATAN HARIAN",
      identitas: [`:Periode~${BULAN[Number(bulan) - 1] || bulan} ${tahun}`],
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>Kegiatan</th><th>Pekerjaan</th><th>Tanggal</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
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
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">LCKH</h1>
        <div className="flex items-center gap-2">
        <HeaderActions />
        <ExportButton
          fileName={`lckh-${bulan}-${tahun}`}
          title="Laporan Catatan Kegiatan Harian"
          subtitle={`Bulan ${bulan}/${tahun}`}
          minPlan="premium"
          columns={[
            { key: "no", label: "No" },
            { key: "kegiatan", label: "Kegiatan" },
            { key: "pekerjaan", label: "Pekerjaan" },
            { key: "tanggal", label: "Tanggal" },
          ]}
          rows={data}
        />
        </div>
      </header>

      {msg && <div className="p-3 mb-4 rounded-xl border text-sm bg-emerald-50 border-emerald-200 text-emerald-700">{msg}</div>}

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Pengaturan LCKH</h3>
          <TutorialLink href="/panduan#lainnya" label="Panduan" />
        </div>
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
          <button className="btn btn-primary" onClick={generate} disabled={loading}><i className="fas fa-magic"></i> Generate dari Jurnal</button>
          <button className="btn btn-accent" onClick={save} disabled={loading}><i className="fas fa-save"></i> Simpan</button>
          <button className="btn btn-accent" onClick={cetakPDF}><i className="fas fa-print"></i> Cetak PDF</button>
          <button className="btn btn-accent" onClick={exportExcel}><i className="fas fa-file-excel"></i> Export Excel</button>
          <button className="btn btn-outline" onClick={addRow}><i className="fas fa-plus"></i> Tambah Baris</button>
          {selected.size > 0 && <button className="btn btn-danger" onClick={deleteSelected}><i className="fas fa-trash"></i> Hapus Terpilih</button>}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Tabel LCKH</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length} onChange={toggleAll} aria-label="Pilih semua LCKH" /></th>
                <th className="w-10">No</th><th>Kegiatan</th><th>Pekerjaan</th><th className="w-40">Tanggal</th><th className="w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Pilih bulan & tahun, klik Generate"}</td></tr>}
              {paginated.map((r, i) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} aria-label={`Pilih LCKH ${r.kegiatan}`} /></td>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{r.kegiatan || "-"}</td>
                  <td>{r.pekerjaan || "-"}</td>
                  <td>{r.tanggal || "-"}</td>
                  <td><button className="btn btn-sm btn-accent" onClick={() => openEdit(r)}><i className="fas fa-edit"></i> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />
      </div>

      {editId !== null && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
              <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">Edit LCKH</h3>
              <button onClick={closeEdit} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div><label className="label">Kegiatan</label><input className="input" placeholder="Misal: Kegiatan pembelajaran" value={formKegiatan} onChange={(e) => setFormKegiatan(e.target.value)} /></div>
                <div><label className="label">Pekerjaan</label><input className="input" placeholder="Rincian pekerjaan" value={formPekerjaan} onChange={(e) => setFormPekerjaan(e.target.value)} /></div>
                <div><label className="label">Tanggal</label><input type="date" className="input" placeholder="Pilih tanggal" value={formTanggal} onChange={(e) => setFormTanggal(e.target.value)} /></div>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button className="btn btn-outline" onClick={closeEdit}>Batal</button>
                <button className="btn btn-primary" onClick={saveEdit}><i className="fas fa-save"></i> Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type LCKHJson = { id: string; no: string | null; kegiatan: string | null; pekerjaan: string | null; tanggal: string | null; jurnalId: string | null };
export default function LCKHPage() {
  return (
    <PlanGuard min="premium" feature="lckh">
      <LCKHPageInner />
    </PlanGuard>
  );
}
