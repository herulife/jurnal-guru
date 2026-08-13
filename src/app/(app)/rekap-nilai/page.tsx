"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import PlanGuard from "@/components/PlanGuard";

interface Nilai { id: string; namaSiswa: string; siswaId: string; namaKelas: string; kelasId: string; mataPelajaran: string; kategori: string; bab: string; nilai: number; kkm: number; }
interface Kelas { id: string; namaKelas: string; }

function RekapNilaiPageInner() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [mapel, setMapel] = useState("");
  const [kategori, setKategori] = useState("");
  const [data, setData] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadKelas = useCallback(async () => {
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setKelas(res.data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (kelasId) params.set("kelasId", kelasId);
    if (kategori) params.set("kategori", kategori);
    const qs = params.toString();
    const res = await apiGet<Nilai[]>(`/api/nilai${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [kelasId, kategori]);

  useEffect(() => { loadKelas(); }, [loadKelas]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [data]);

  const mp = mapel.trim().toLowerCase();
  const filtered = mp ? data.filter((n) => (n.mataPelajaran || "").toLowerCase().includes(mp)) : data;

  // Build pivot: babes (sorted columns) and cell map siswaId|bab -> avg
  const babes: string[] = [];
  const babSet = new Set<string>();
  filtered.forEach((n) => { if (n.bab) babSet.add(n.bab); });
  babes.push(...Array.from(babSet).sort((a, b) => a.localeCompare(b)));

  const cell: Record<string, number[]> = {};
  filtered.forEach((n) => {
    const key = `${n.siswaId}|${n.bab || ""}`;
    if (!cell[key]) cell[key] = [];
    cell[key].push(Number(n.nilai) || 0);
  });

  const siswaMap = new Map<string, { nama: string; kelas: string }>();
  filtered.forEach((n) => {
    if (!siswaMap.has(n.siswaId)) siswaMap.set(n.siswaId, { nama: n.namaSiswa, kelas: n.namaKelas });
  });
  const siswaList = Array.from(siswaMap.entries());

  function avg(vals?: number[]) {
    if (!vals || !vals.length) return "-";
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }
  function rowAvg(siswaId: string) {
    let sum = 0, cnt = 0;
    babes.forEach((b) => {
      const v = avg(cell[`${siswaId}|${b}`]);
      if (v !== "-") { sum += Number(v); cnt++; }
    });
    return cnt ? Math.round((sum / cnt) * 10) / 10 : "-";
  }
  function rowTotal(siswaId: string) {
    let sum = 0;
    babes.forEach((b) => {
      const v = avg(cell[`${siswaId}|${b}`]);
      if (v !== "-") sum += Number(v);
    });
    return Math.round(sum * 10) / 10;
  }

  const paginated = siswaList.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Rekap Nilai Siswa</h1>
        <div className="flex items-center gap-2">
        <HeaderActions />
        <ExportButton
          fileName="rekap-nilai"
          title="Rekap Nilai Siswa"
          subtitle={kelas.find((k) => k.id === kelasId)?.namaKelas || "Semua Kelas"}
          minPlan="pro"
          columns={[
            { key: "nama", label: "Nama Siswa" },
            ...babes.map((b) => ({ key: b, label: b })),
            { key: "rata", label: "Rata-rata" },
            { key: "total", label: "Total" },
          ]}
          rows={siswaList.map(([id, s]) => {
            const row: Record<string, string | number> = { nama: s.nama };
            babes.forEach((b) => { row[b] = avg(cell[`${id}|${b}`]); });
            row.rata = rowAvg(id);
            row.total = rowTotal(id);
            return row as unknown as { nama: string; rata: string | number };
          })}
        />
        </div>
      </header>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Filter Rekap Nilai</h3>
          <TutorialLink href="/panduan#nilai" label="Panduan" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="label">Kelas</label><select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Semua Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className="label">Mapel</label><input type="text" className="input text-sm" value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Filter mapel..." /></div>
          <div><label className="label">Kategori</label><select className="input text-sm" value={kategori} onChange={(e) => setKategori(e.target.value)}><option value="">Semua</option><option>Pengetahuan</option><option>Keterampilan</option><option>Ulangan</option><option>Tugas</option></select></div>
          <div className="flex items-end"><button className="btn btn-primary w-full justify-center" onClick={load}><i className="fas fa-search"></i> Tampilkan</button></div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Tabel Rekap Nilai</h3>
          <span className="text-xs text-gray-500">{siswaList.length} siswa, {babes.length} bab</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th><th>Nama Siswa</th>
                {babes.map((b) => <th key={b}>{b}</th>)}
                <th>Rata-rata</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={babes.length + 4} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Klik Tampilkan"}</td></tr>}
              {paginated.map(([id, s], i) => (
                <tr key={id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="font-semibold">{s.nama}</td>
                  {babes.map((b) => {
                    const v = avg(cell[`${id}|${b}`]);
                    return <td key={b}>{v}</td>;
                  })}
                  <td className="font-bold">{rowAvg(id)}</td>
                  <td className="font-bold">{rowTotal(id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={siswaList.length} pageSize={pageSize} onChange={setPage} />
      </div>
    </div>
  );
}
export default function RekapNilaiPage() {
  return (
    <PlanGuard min="pro">
      <RekapNilaiPageInner />
    </PlanGuard>
  );
}
