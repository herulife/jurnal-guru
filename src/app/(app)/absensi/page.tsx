"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/useApi";
import { bukaDokumen, exportXlsx, esc } from "@/lib/dokumen";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import { ConfirmModal, AlertModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Feedback";

interface Siswa { id: string; namaSiswa: string; }
interface Kelas { id: string; namaKelas: string; }
interface Absen { id: string; tanggal: string; siswaId: string; namaSiswa: string; namaKelas: string; mataPelajaran: string; status: string; keterangan: string; }

export default function AbsensiPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [riwayat, setRiwayat] = useState<Absen[]>([]);
  const [loading, setLoading] = useState(true);
  const [absenKelas, setAbsenKelas] = useState("");
  const [absenTanggal, setAbsenTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [absenMapel, setAbsenMapel] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  
  // Confirm/Alert modal state
  const [confirmModal, setConfirmModal] = useState<{open: boolean; title: string; message: string; variant: "danger"|"warning"|"info"; onConfirm: () => void; onCancel?: () => void; confirmText?: string; cancelText?: string} | null>(null);
  const [alertModal, setAlertModal] = useState<{open: boolean; title: string; message: string; variant: "success"|"error"|"info"} | null>(null);
  const { show } = useToast();

  function showConfirm(options: {title?: string; message: string; variant?: "danger"|"warning"|"info"; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel?: () => void}) {
    setConfirmModal({ open: true, title: options.title || "Konfirmasi", message: options.message, variant: options.variant || "danger", onConfirm: options.onConfirm, onCancel: options.onCancel, confirmText: options.confirmText, cancelText: options.cancelText });
  }

  function showAlert(options: {title?: string; message: string; variant?: "success"|"error"|"info"}) {
    setAlertModal({ open: true, title: options.title || "Informasi", message: options.message, variant: options.variant || "info" });
  }

  function formatTanggal(value: string) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  async function exportRiwayatExcel() {
    const headers = ["No", "Tanggal", "Siswa", "Kelas", "Mapel", "Status", "Keterangan"];
    const rows = sortedRiwayat.map((a, i) => [i + 1, formatTanggal(a.tanggal), a.namaSiswa, a.namaKelas, a.mataPelajaran, a.status, a.keterangan]);
    const kelasNama = kelas.find((k) => k.id === filterKelas)?.namaKelas || "Semua Kelas";
    await exportXlsx({
      file: "riwayat-absensi.xlsx",
      judul: "RIWAYAT ABSENSI SISWA",
      identitas: [`:Tanggal~${filterTanggal || "Semua Tanggal"}`, `:Kelas~${kelasNama}`],
      headers,
      rows,
    });
  }

  async function exportRiwayatPdf() {
    const tbody = sortedRiwayat
      .map(
        (a, i) =>
          `<tr><td class="nomer">${i + 1}</td><td>${esc(formatTanggal(a.tanggal))}</td><td>${esc(a.namaSiswa)}</td><td>${esc(a.namaKelas)}</td><td>${esc(a.mataPelajaran)}</td><td>${esc(a.status)}</td><td>${esc(a.keterangan || "-")}</td></tr>`
      )
      .join("");
    const kelasNama = kelas.find((k) => k.id === filterKelas)?.namaKelas || "Semua Kelas";
    await bukaDokumen({
      judul: "REKAP ABSENSI SISWA",
      identitas: [`:Tanggal~${filterTanggal || "Semua Tanggal"}`, `:Kelas~${kelasNama}`],
      body: `<table class="data"><thead><tr><th class="nomer">No</th><th>Tanggal</th><th>Siswa</th><th>Kelas</th><th>Mapel</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }

  const loadKelas = useCallback(async () => {
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setKelas(res.data);
  }, []);

  const loadSiswa = useCallback(async () => {
    if (!absenKelas) { setSiswa([]); return; }
    const res = await apiGet<Siswa[]>(`/api/siswa?kelasId=${absenKelas}`);
    if (res.ok && res.data) setSiswa(res.data);
  }, [absenKelas]);

  const loadRiwayat = useCallback(async () => {
    setLoading(true);
    let url = "/api/absensi";
    const params = new URLSearchParams();
    if (filterTanggal) params.set("tanggal", filterTanggal);
    if (filterKelas) params.set("kelasId", filterKelas);
    const qs = params.toString();
    if (qs) url += "?" + qs;
    const res = await apiGet<Absen[]>(url);
    if (res.ok && res.data) setRiwayat(res.data);
    setLoading(false);
  }, [filterTanggal, filterKelas]);

  useEffect(() => { loadKelas(); }, [loadKelas]);
  useEffect(() => { loadSiswa(); }, [loadSiswa]);
  useEffect(() => { loadRiwayat(); }, [loadRiwayat]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    setSelectAll(false);
  }, [riwayat]);

  async function handleSave() {
    if (!absenTanggal || !absenKelas || !absenMapel) return showAlert({ message: "Isi tanggal, kelas, dan mapel", variant: "error" });
    const inputs = document.querySelectorAll<HTMLInputElement>('[name^="ab_"]:checked');
    const seen = new Set<string>();
    const records: { tanggal: string; siswaId: string; kelasId: string; mataPelajaran: string; status: string; keterangan: string }[] = [];
    inputs.forEach((inp) => {
      const sid = inp.name.replace("ab_", "");
      if (!seen.has(sid)) {
        seen.add(sid);
        const ket = (document.getElementById(`ket_${sid}`) as HTMLInputElement)?.value || "";
        records.push({ tanggal: absenTanggal, siswaId: sid, kelasId: absenKelas, mataPelajaran: absenMapel, status: inp.value, keterangan: ket });
      }
    });
    if (!records.length) return showAlert({ message: "Tidak ada data", variant: "error" });
    const res = await apiPost("/api/absensi", { records });
    if (res.ok) {
      show("Absensi berhasil disimpan", "success");
      loadRiwayat();
    } else {
      show(res.msg || "Gagal menyimpan absensi", "error");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map((a) => a.id)));
    }
    setSelectAll(!selectAll);
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    showConfirm({ title: "Hapus Absensi", message: `Hapus ${selected.size} absensi?`, variant: "danger", confirmText: "Hapus", cancelText: "Batal", onConfirm: async () => {
      for (const id of selected) {
        await apiDelete(`/api/absensi/${id}`);
      }
      show("Data absensi berhasil dihapus", "success");
      setSelected(new Set());
      setSelectAll(false);
      loadRiwayat();
    } });
  }

  const sortedRiwayat = [...riwayat].sort((a, b) =>
    sortAsc ? a.namaSiswa.localeCompare(b.namaSiswa) : b.namaSiswa.localeCompare(a.namaSiswa)
  );

  const paginatedData = sortedRiwayat.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Absensi</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Input Absensi</h3>
          <TutorialLink href="/panduan#absensi" label="Panduan" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="label">Tanggal</label><input type="date" className="input text-sm" placeholder="Pilih tanggal" value={absenTanggal} onChange={(e) => setAbsenTanggal(e.target.value)} /></div>
          <div><label className="label">Kelas</label><select className="input text-sm" value={absenKelas} onChange={(e) => setAbsenKelas(e.target.value)}><option value="">Pilih Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className="label">Mata Pelajaran</label><input type="text" className="input text-sm" placeholder="Matematika" value={absenMapel} onChange={(e) => setAbsenMapel(e.target.value)} /></div>
          <div className="flex items-end"><button className="btn btn-primary w-full justify-center" onClick={handleSave}><i className="fas fa-save"></i> Simpan</button></div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">Daftar Siswa</h3>
        <div className="space-y-2">
          {!absenKelas && <p className="text-sm text-gray-400 text-center py-4">Pilih kelas terlebih dahulu</p>}
          {siswa.map((s, i) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-3 bg-[#F5F3EF] rounded-xl">
              <span className="text-sm font-semibold w-8">{i + 1}</span>
              <span className="text-sm flex-1 min-w-[120px]">{s.namaSiswa}</span>
              {["Hadir","Sakit","Izin","Alpa"].map((st) => (
                <label key={st} className="text-xs cursor-pointer">
                  <input type="radio" name={`ab_${s.id}`} value={st} defaultChecked={st === "Hadir"} className="mr-1" />
                  <span className={`badge ${st === "Hadir" ? "badge-hadir" : st === "Sakit" ? "badge-sakit" : st === "Izin" ? "badge-izin" : "badge-alpha"}`}>{st[0]}</span>
                </label>
              ))}
              <input type="text" placeholder="Ket." id={`ket_${s.id}`} className="input w-28 text-xs py-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Riwayat Absensi</h3>
          <div className="flex gap-2">
            <button className="btn btn-accent btn-sm" onClick={exportRiwayatPdf}><i className="fas fa-file-pdf"></i> PDF</button>
            <button className="btn btn-accent btn-sm" onClick={exportRiwayatExcel}><i className="fas fa-file-excel"></i> Excel</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <input type="date" className="input w-44 text-sm" placeholder="Filter tanggal" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
          <select className="input w-48 text-sm" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}><option value="">Semua Kelas</option>{kelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select>
          <label className="cursor-pointer text-xs text-gray-600 hover:text-blue-600 ml-auto flex items-center gap-1" onClick={() => setSortAsc(!sortAsc)}>
            <i className={`fas fa-sort-alpha-${sortAsc ? "up" : "down"}`}></i>
            <span>{sortAsc ? "A-Z" : "Z-A"}</span>
          </label>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-sm text-red-700 font-semibold">{selected.size} terpilih</span>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              <i className="fas fa-trash"></i> Hapus terpilih
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th className="w-10"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} aria-label="Pilih semua" /></th><th>No</th><th>Tanggal</th><th>Siswa</th><th>Kelas</th><th>Mapel</th><th>Status</th><th>Keterangan</th><th>Aksi</th></tr></thead>
            <tbody>
              {riwayat.length === 0 && <tr><td colSpan={9} className="text-center text-gray-400 py-8">{loading ? "Memuat..." : "Belum ada data"}</td></tr>}
              {paginatedData.map((a, i) => (
                <tr key={a.id}>
                  <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} aria-label={`Pilih absensi ${a.namaSiswa}`} /></td>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{formatTanggal(a.tanggal)}</td>
                  <td>{a.namaSiswa}</td>
                  <td>{a.namaKelas}</td>
                  <td>{a.mataPelajaran}</td>
                  <td><span className={`badge ${a.status === "Hadir" ? "badge-hadir" : a.status === "Sakit" ? "badge-sakit" : a.status === "Izin" ? "badge-izin" : "badge-alpha"}`}>{a.status}</span></td>
                  <td>{a.keterangan}</td>
                  <td>
                    <EditAbsenModal absen={a} onSave={loadRiwayat} />
                    <button className="btn btn-danger btn-sm ml-1" onClick={() => showConfirm({ title: "Hapus", message: "Hapus data absensi ini?", variant: "danger", confirmText: "Hapus", cancelText: "Batal", onConfirm: async () => { await apiDelete(`/api/absensi/${a.id}`); show("Data absensi berhasil dihapus", "success"); loadRiwayat(); } })}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination current={page} total={riwayat.length} pageSize={pageSize} onChange={setPage} />
      </div>
    </div>
    <ConfirmModal
      open={confirmModal !== null}
      onClose={() => setConfirmModal(null)}
      onConfirm={confirmModal?.onConfirm ?? (() => {})}
      title={confirmModal?.title ?? ""}
      message={confirmModal?.message ?? ""}
      variant={confirmModal?.variant ?? "danger"}
      confirmText={confirmModal?.confirmText}
      cancelText={confirmModal?.cancelText}
    />
    <AlertModal
      open={alertModal !== null}
      onClose={() => setAlertModal(null)}
      title={alertModal?.title ?? ""}
      message={alertModal?.message ?? ""}
      variant={alertModal?.variant ?? "info"}
    />
    </>
  );
}

function EditAbsenModal({ absen, onSave }: { absen: Absen; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(absen.status);
  const [keterangan, setKeterangan] = useState(absen.keterangan);
  const { show } = useToast();

  useEffect(() => {
    if (open) { setStatus(absen.status); setKeterangan(absen.keterangan); }
  }, [open, absen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiPut(`/api/absensi/${absen.id}`, { status, keterangan });
    if (res.ok) {
      show("Absensi berhasil diperbarui", "success");
      setOpen(false);
      onSave();
    } else {
      show(res.msg || "Gagal memperbarui absensi", "error");
    }
  }

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}><i className="fas fa-edit"></i></button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
              <h3 className="font-bold text-gray-800 font-[Outfit]">Edit Absensi</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <p className="text-sm mb-4">{absen.namaSiswa} - {absen.tanggal}</p>
              <div className="mb-4"><label className="label">Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Hadir">Hadir</option><option value="Sakit">Sakit</option><option value="Izin">Izin</option><option value="Alpa">Alpa</option>
                </select>
              </div>
              <div className="mb-4"><label className="label">Keterangan</label><input type="text" className="input" placeholder="Misal: Demam, izin keluarga" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
