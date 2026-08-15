"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/useApi";
import { bukaDokumen, esc, getProfil, tglPanjang, kapital } from "@/lib/dokumen";
import type { ProfilDokumen } from "@/lib/dokumen";
import Pagination from "@/components/Pagination";
import ExportButton from "@/components/ExportButton";
import TutorialLink from "@/components/TutorialLink";
import HeaderActions from "@/components/HeaderActions";

interface Rekap {
  id: string; nis: string; namaSiswa: string; namaKelas: string;
  totalHari: number; hadir: number; sakit: number; izin: number; alpha: number; persentase: number;
}
interface Kelas { id: string; namaKelas: string; }

function formatTanggal(s: string): string {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function StatCard({ label, value, icon, bg }: { label: string; value: number; icon: string; bg: string }) {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${bg}`}>
        <i className={`fas ${icon}`} aria-hidden="true"></i>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-800 font-[Outfit] leading-tight">{value}</div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{label}</div>
      </div>
    </div>
  );
}

export default function RekapAbsensiPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Rekap[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [profil, setProfil] = useState<ProfilDokumen | null>(null);
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
  useEffect(() => { getProfil().then(setProfil); }, []);

  const namaKelasTerpilih = kelas.find((k) => k.id === kelasId)?.namaKelas || "Semua Kelas";
  const ringkasan = data.reduce(
    (acc, r) => ({ hadir: acc.hadir + r.hadir, sakit: acc.sakit + r.sakit, izin: acc.izin + r.izin, alpha: acc.alpha + r.alpha }),
    { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
  );

  const sudahCetak = useRef(false);

  async function cetakRekap() {
    const tbody = data
      .map(
        (r, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(r.nis)}</td><td>${esc(r.namaSiswa)}</td><td>${esc(r.namaKelas)}</td><td class="nomer">${esc(r.totalHari)}</td><td class="nomer">${esc(r.hadir)}</td><td class="nomer">${esc(r.sakit)}</td><td class="nomer">${esc(r.izin)}</td><td class="nomer">${esc(r.alpha)}</td><td class="nomer">${esc(r.persentase)}%</td></tr>`
      )
      .join("");
    await bukaDokumen({
      judul: "REKAP ABSENSI SISWA",
      identitas: [`:Kelas~${namaKelasTerpilih}`, `:Periode~${startDate ? formatTanggal(startDate) : "Awal"} s.d. ${endDate ? formatTanggal(endDate) : "Akhir"}`],
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>NIS</th><th>Nama Siswa</th><th>Kelas</th><th class="nomer">Total Hari</th><th class="nomer">Hadir</th><th class="nomer">Sakit</th><th class="nomer">Izin</th><th class="nomer">Alpa</th><th class="nomer">%</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }

  useEffect(() => {
    if (searchParams.get("cetak") === "1" && !loading && data.length > 0 && !sudahCetak.current) {
      sudahCetak.current = true;
      void cetakRekap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, data]);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  const logoRaw = profil?.logoUrl?.trim() || "/logo.svg";
  const logoAbs = logoRaw.startsWith("http") ? logoRaw : `${window.location.origin}${logoRaw.startsWith("/") ? "" : "/"}${logoRaw}`;
  const alamatSekolah = [
    [profil?.alamat, [profil?.kota, profil?.provinsi].filter(Boolean).join(", ")].filter(Boolean).join(" | "),
    [profil?.telepon && `Telp. ${profil.telepon}`, profil?.npsn && `NPSN ${profil.npsn}`].filter(Boolean).join(" | "),
  ].filter(Boolean).join(" | ");

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Rekap Absensi</h1>
        <div className="flex items-center gap-2">
          <HeaderActions />
          <button onClick={cetakRekap} className="btn btn-outline text-xs gap-1" title="Cetak dokumen resmi"><i className="fas fa-print text-xs"></i> Cetak</button>
          <ExportButton
            fileName="rekap-absensi"
            title="Rekap Absensi Siswa"
            subtitle={namaKelasTerpilih}
            columns={[
              { key: "nis", label: "NIS" },
              { key: "namaSiswa", label: "Nama" },
              { key: "namaKelas", label: "Kelas" },
              { key: "totalHari", label: "Total" },
              { key: "hadir", label: "Hadir" },
              { key: "sakit", label: "Sakit" },
              { key: "izin", label: "Izin" },
              { key: "alpha", label: "Alpa" },
              { key: "persentase", label: "%" },
            ]}
            rows={data}
          />
        </div>
      </header>

      {/* Kop sekolah — hanya muncul saat print */}
      <div className="hidden print:block mb-4">
        <div className="flex items-center gap-4">
          <img src={logoAbs} alt="Logo sekolah" className="w-14 h-14 object-contain shrink-0" />
          <div className="text-center flex-1">
            <div className="text-lg font-bold uppercase tracking-wide leading-snug">{profil?.namaSekolah || "SEKOLAH"}</div>
            <div className="text-[11px] text-gray-600 mt-1">{alamatSekolah}</div>
          </div>
        </div>
        <div className="border-b-[2.5px] border-black mt-3"></div>
        <div className="border-b border-black mt-[2px]"></div>
      </div>

      {/* Judul laporan */}
      <div className="mb-6 print:mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1A2332] font-[Outfit] tracking-tight">
          Rekapitulasi Absensi Siswa
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {startDate || endDate
            ? `Periode: ${startDate ? formatTanggal(startDate) : "Awal"} s.d. ${endDate ? formatTanggal(endDate) : "Akhir"}`
            : "Rekap absensi seluruh periode"}
        </p>
        <div className="h-px bg-[#E8E4DC] mt-3"></div>
      </div>

      {/* Filter */}
      <div className="card mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Filter Rekap</h3>
          <TutorialLink href="/panduan#lainnya" label="Panduan" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label"><i className="fas fa-users w-4 mr-1 text-[#1A2332]"></i>Kelas</label>
            <select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
              <option value="">Semua Kelas</option>
              {kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
            </select>
          </div>
          <div>
            <label className="label"><i className="fas fa-calendar-plus w-4 mr-1 text-[#1A2332]"></i>Tanggal Mulai</label>
            <input type="date" className="input text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label"><i className="fas fa-calendar-minus w-4 mr-1 text-[#1A2332]"></i>Tanggal Selesai</label>
            <input type="date" className="input text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full justify-center bg-[#1A2332] hover:bg-[#0d1420]" onClick={load}>
              <i className="fas fa-search"></i> Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Siswa" value={data.length} icon="fa-users" bg="bg-[#1A2332]" />
        <StatCard label="Hadir" value={ringkasan.hadir} icon="fa-user-check" bg="bg-emerald-500" />
        <StatCard label="Sakit" value={ringkasan.sakit} icon="fa-thermometer-half" bg="bg-amber-500" />
        <StatCard label="Izin" value={ringkasan.izin} icon="fa-file-signature" bg="bg-blue-500" />
        <StatCard label="Alpa" value={ringkasan.alpha} icon="fa-user-slash" bg="bg-red-500" />
      </div>

      {/* Tabel */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Rekap Absensi Siswa</h3>
          <span className="text-xs font-semibold text-gray-500">{namaKelasTerpilih}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>No</th><th>NIS</th><th>Nama Siswa</th><th>Kelas</th><th>Total Hari</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpa</th><th>Persentase</th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Klik Tampilkan"}</td></tr>}
              {paginatedData.map((r, i) => (
                <tr key={r.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td className="font-medium">{r.nis}</td>
                  <td className="font-medium">{r.namaSiswa}</td>
                  <td>{r.namaKelas}</td>
                  <td>{r.totalHari}</td>
                  <td className="text-emerald-600 font-semibold">{r.hadir}</td>
                  <td className="text-amber-600 font-semibold">{r.sakit}</td>
                  <td className="text-blue-600 font-semibold">{r.izin}</td>
                  <td className="text-red-600 font-semibold">{r.alpha}</td>
                  <td>
                    <span className={`badge ${r.persentase >= 90 ? "badge-hadir" : r.persentase >= 75 ? "badge-sakit" : "badge-alpha"}`}>
                      {r.persentase}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />
      </div>

      {/* Tanda tangan */}
      <div className="card mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto text-center text-sm">
          <div>
            <div>Mengetahui,</div>
            <div className="font-semibold mt-1">Kepala Sekolah</div>
            <div className="h-20"></div>
            <div className="font-bold underline">{profil?.kepalaSekolah ? kapital(profil.kepalaSekolah) : "............................"}</div>
            <div className="text-xs text-gray-500 mt-1">{profil?.nipKepsek ? `NIP. ${profil.nipKepsek}` : "NIP. ............................"}</div>
          </div>
          <div>
            <div>{profil?.kota ? `${kapital(profil.kota)}, ` : ""}{tglPanjang()}</div>
            <div className="font-semibold mt-1">Guru Mata Pelajaran</div>
            <div className="h-20"></div>
            <div className="font-bold underline">{profil?.namaGuru ? kapital(profil.namaGuru) : "............................"}</div>
            <div className="text-xs text-gray-500 mt-1">{profil?.nipGuru ? `NIP. ${profil.nipGuru}` : "NIP. ............................"}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-[#E8E4DC] text-xs text-gray-400 text-right">
        Dicetak dari Sistem Jurnal Guru | {tglPanjang()}, {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
      </div>
    </div>
  );
}