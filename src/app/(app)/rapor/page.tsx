"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/useApi";
import { useUserPlan, canExport } from "@/lib/useUserPlan";

interface Kelas { id: string; namaKelas: string; }
interface Siswa { id: string; nis: string; namaSiswa: string; }
interface RaporData {
  siswa: { nis: string; nisn: string | null; nama: string; kelas: string };
  profil: { namaSekolah: string | null; alamat: string | null; npsn: string | null; kepalaSekolah: string | null; kota: string | null } | null;
  subjectRows: { mapel: string; rata: number; keterangan: string }[];
  rataKeseluruhan: number;
  totalMapel: number;
}

export default function RaporPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [siswaId, setSiswaId] = useState("");
  const [rapor, setRapor] = useState<RaporData | null>(null);
  const [loading, setLoading] = useState(false);
  const { plan, loading: planLoading } = useUserPlan();
  const allowed = canExport(plan);

  const loadKelas = useCallback(async () => {
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setKelas(res.data);
  }, []);

  useEffect(() => { loadKelas(); }, [loadKelas]);

  useEffect(() => {
    if (!kelasId) { setSiswa([]); setSiswaId(""); setRapor(null); return; }
    apiGet<Siswa[]>(`/api/siswa?kelasId=${kelasId}`).then((r) => {
      if (r.ok && r.data) { setSiswa(r.data); setSiswaId(""); setRapor(null); }
    });
  }, [kelasId]);

  async function loadRapor() {
    if (!siswaId) return;
    setLoading(true);
    const res = await apiGet<RaporData>(`/api/rapor?siswaId=${siswaId}`);
    setLoading(false);
    if (res.ok && res.data) setRapor(res.data);
  }

  function cetak() {
    if (!rapor) return;
    const p = rapor.profil;
    const thead = "<th>No</th><th>Mata Pelajaran</th><th>Rata-rata</th><th>Keterangan</th>";
    const tbody = rapor.subjectRows.map((s, i) => `<tr><td>${i + 1}</td><td>${s.mapel}</td><td>${s.rata}</td><td>${s.keterangan}</td></tr>`).join("");
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
      <title>Rapor ${rapor.siswa.nama}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:32px}
        .head{text-align:center;margin-bottom:24px}
        .head h1{font-size:20px;margin:4px 0}
        .head p{margin:2px 0;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-top:20px}
        th,td{border:1px solid #999;padding:6px 8px;text-align:left}
        th{background:#0D7C66;color:#fff}
        .info{margin-top:16px;font-size:13px}
        .info .row{display:flex;margin:4px 0}
        .info .lbl{width:120px;font-weight:600;color:#555}
        .sign{margin-top:40px;text-align:right;font-size:12px}
        .footer{margin-top:40px;font-size:11px;color:#777;text-align:center}
      </style></head><body>
      <div class="head">
        ${p?.namaSekolah ? `<h1>${p.namaSekolah}</h1>` : "<h1>RAPOR</h1>"}
        ${p?.alamat ? `<p>${p.alamat}</p>` : ""}
        ${p?.npsn ? `<p>NPSN: ${p.npsn}</p>` : ""}
      </div>
      <div style="text-align:center"><h2 style="margin:0">RAPOR SEMESTER</h2></div>
      <div class="info">
        <div class="row"><span class="lbl">Nama</span><span>: ${rapor.siswa.nama}</span></div>
        <div class="row"><span class="lbl">NIS</span><span>: ${rapor.siswa.nis}</span></div>
        <div class="row"><span class="lbl">Kelas</span><span>: ${rapor.siswa.kelas}</span></div>
      </div>
      <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
      <p style="margin-top:16px;font-weight:700">Rata-rata Keseluruhan: ${rapor.rataKeseluruhan}</p>
      <div class="sign">
        <p>${p?.kota || "............"}, ${new Date().toLocaleDateString("id-ID")}</p>
        <p>Kepala Sekolah</p><br/><br/><br/>
        <p><b>${p?.kepalaSekolah || "........................"}</b></p>
      </div>
      <div class="footer">Dicetak dari Jurnal Guru</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  }

  const p = rapor?.profil;

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Rapor Siswa</h1>
        {!allowed ? (
          <a href="/checkout?plan=pro" className="btn btn-outline text-xs gap-1" title="Export PDF adalah fitur Pro">
            <i className="fas fa-lock text-xs"></i> Export PDF (Pro)
          </a>
        ) : rapor ? (
          <button className="btn btn-primary text-xs gap-1" onClick={cetak}><i className="fas fa-file-pdf"></i> Cetak Rapor</button>
        ) : null}
      </header>

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Pilih Siswa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div><label className="label">Kelas</label><select className="input text-sm" value={kelasId} onChange={(e) => setKelasId(e.target.value)}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className="label">Siswa</label><select className="input text-sm" value={siswaId} onChange={(e) => setSiswaId(e.target.value)}><option value="">Pilih Siswa</option>{siswa.map(s => <option key={s.id} value={s.id}>{s.namaSiswa}</option>)}</select></div>
          <button className="btn btn-primary" onClick={loadRapor} disabled={!siswaId || loading}><i className="fas fa-search"></i> Tampilkan</button>
        </div>
      </div>

      {rapor && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="font-bold text-lg text-gray-800 font-[Outfit]">{p?.namaSekolah || "RAPORAN"}</h2>
            {p?.alamat && <p className="text-sm text-gray-500">{p.alamat}</p>}
            {p?.npsn && <p className="text-sm text-gray-500">NPSN: {p.npsn}</p>}
            <h3 className="font-bold text-gray-700 mt-2">RAPORAN HASIL BELAJAR</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
            <p><span className="text-gray-500">Nama:</span> <b>{rapor.siswa.nama}</b></p>
            <p><span className="text-gray-500">NIS:</span> {rapor.siswa.nis}</p>
            <p><span className="text-gray-500">Kelas:</span> {rapor.siswa.kelas}</p>
            <p><span className="text-gray-500">Jumlah Mapel:</span> {rapor.totalMapel} mapel</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Rata-rata</th><th>Keterangan</th></tr></thead>
              <tbody>
                {rapor.subjectRows.map((s, i) => (
                  <tr key={s.mapel}>
                    <td>{i + 1}</td><td>{s.mapel}</td>
                    <td className="font-bold">{s.rata}</td>
                    <td><span className={`badge ${s.keterangan === "Tuntas" ? "badge-tuntas" : "badge-belum-tuntas"}`}>{s.keterangan}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm font-bold">Rata-rata Keseluruhan: <span className="text-[#0D7C66]">{rapor.rataKeseluruhan}</span></p>
        </div>
      )}
    </div>
  );
}