"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/useApi";
import { bukaDokumen, esc } from "@/lib/dokumen";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";
import HeaderActions from "@/components/HeaderActions";

interface Rekap {
  id: string; nis: string; namaSiswa: string; namaKelas: string;
  totalHari: number; hadir: number; sakit: number; izin: number; alpha: number; persentase: number;
}
interface Kelas { id: string; namaKelas: string; }

export default function RekapAbsensiPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Rekap[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const loadKelas = useCallback(async () => {
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setKelas(res.data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (kelasId) params.set("kelasId", kelasId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const qs = params.toString();
    const res = await apiGet<Rekap[]>(`/api/rekap-absensi${qs ? "?" + qs : ""}`);
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, [kelasId, startDate, endDate]);

  useEffect(() => { loadKelas(); }, [loadKelas]);

  const sudahCetak = useRef(false);

  async function cetakRekap() {
    const namaKelas = kelas.find((k) => k.id === kelasId)?.namaKelas || "Semua Kelas";
    const tbody = data
      .map(
        (r, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(r.nis)}</td><td>${esc(r.namaSiswa)}</td><td>${esc(r.namaKelas)}</td><td class="nomer">${esc(r.totalHari)}</td><td class="nomer">${esc(r.hadir)}</td><td class="nomer">${esc(r.sakit)}</td><td class="nomer">${esc(r.izin)}</td><td class="nomer">${esc(r.alpha)}</td><td class="nomer">${esc(r.persentase)}%</td></tr>`
      )
      .join("");
    await bukaDokumen({
      judul: "REKAP ABSENSI SISWA",
      identitas: [`:Kelas~${namaKelas}`, `:Periode~${startDate || "Awal"} s.d. ${endDate || "Akhir"}`],
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>NIS</th><th>Nama Siswa</th><th>Kelas</th><th class="nomer">Total Hari</th><th class="nomer">Hadir</th><th class="nomer">Sakit</th><th class="nomer">Izin</th><th class="nomer">Alpha</th><th class="nomer">%</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }

  useEffect(() => {
    if (searchParams.get("cetak") === "1" && !loading && data.length > 0 && !sudahCetak.current) {
      sudahCetak.current = true;
      void cetakRekap();
    }
  }, [searchParams, loading, data]);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Rekap Absensi</h1>
        <div className="flex items-center gap-2">
        <HeaderActions />
        <ExportButton
          fileName="rekap-absensi"
          title="Rekap Absensi Siswa"
          subtitle={kelas.find((k) => k.id === kelasId)?.namaKelas || "Semua Kelas"}
          columns={[
            { key: "nis", label: "NIS" },
            { key: "namaSiswa", label: "Nama" },
            { key: "namaKelas", label: "Kelas" },
            { key: "totalHari", label: "Total" },
            { key: "hadir", label: "Hadir" },
            { key: "sakit", label: "Sakit" },
            { key: "izin", label: "Izin" },
            { key: "alpha", label: "Alpha" },
            { key: "persentase", label: "%" },
          ]}
          rows={data}
        />
        </div>
      </header>

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Filter Rekap Absensi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="label">Kelas</label><select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Semua Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className="label">Tanggal Mulai</label><input type="date" className="input text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div><label className="label">Tanggal Selesai</label><input type="date" className="input text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          <div className="flex items-end"><button className="btn btn-primary w-full justify-center" onClick={load}><i className="fas fa-search"></i> Tampilkan</button></div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Rekap Absensi Siswa</h3>

        <div className="table-wrap">
          <table>
            <thead><tr><th>No</th><th>NIS</th><th>Nama Siswa</th><th>Kelas</th><th>Total</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpha</th><th>%</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Klik Tampilkan"}</td></tr>}
              {paginatedData.map((r, i) => (
                <tr key={r.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{r.nis}</td>
                  <td>{r.namaSiswa}</td>
                  <td>{r.namaKelas}</td>
                  <td>{r.totalHari}</td>
                  <td className="text-green-600 font-semibold">{r.hadir}</td>
                  <td className="text-yellow-600 font-semibold">{r.sakit}</td>
                  <td className="text-blue-600 font-semibold">{r.izin}</td>
                  <td className="text-red-600 font-semibold">{r.alpha}</td>
                  <td className="font-bold">{r.persentase}%</td>
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
