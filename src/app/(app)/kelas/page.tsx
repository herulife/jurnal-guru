"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import HeaderActions from "@/components/HeaderActions";

interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: number;
  jurusan: string;
  tahunAjaran: string;
  waliKelas: string;
  jumlahSiswa: number;
}

export default function KelasPage() {
  const [data, setData] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Kelas[]>("/api/kelas");
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    setSelectAll(false);
  }, [data]);

  async function handleSave(form: {
    namaKelas: string;
    tingkat: number;
    jurusan: string;
    tahunAjaran: string;
    waliKelas: string;
  }) {
    const res = await apiPost("/api/kelas", form);
    return res.ok;
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kelas ini?")) return;
    const res = await apiDelete(`/api/kelas/${id}`);
    if (res.ok) load();
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
      setSelected(new Set(paginatedData.map((k) => k.id)));
    }
    setSelectAll(!selectAll);
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Hapus ${selected.size} kelas?`)) return;
    for (const id of selected) {
      await apiDelete(`/api/kelas/${id}`);
    }
    setSelected(new Set());
    setSelectAll(false);
    load();
  }

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">
          Data Kelas
        </h1>
        <div className="flex items-center gap-2">
        <HeaderActions />
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            (window as any).__kelasModal &&
            (window as any).__kelasModal.open(null)
          }
        >
          <i className="fas fa-plus"></i> Tambah Kelas
        </button>
        </div>
      </header>

      <p className="text-sm text-gray-500 mb-5">{data.length} kelas</p>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-sm text-red-700 font-semibold">{selected.size} terpilih</span>
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i> Hapus Semua
          </button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="w-10">
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} aria-label="Pilih semua kelas" />
              </th>
              <th>No</th>
              <th>Nama Kelas</th>
              <th>Tingkat</th>
              <th>Jurusan</th>
              <th>Tahun Ajaran</th>
              <th>Wali Kelas</th>
              <th>Jml</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-8">
                  {loading ? "Memuat..." : "Belum ada data"}
                </td>
              </tr>
            )}
            {paginatedData.map((k, i) => (
              <tr key={k.id}>
                <td>
                  <input type="checkbox" checked={selected.has(k.id)} onChange={() => toggleSelect(k.id)} aria-label={`Pilih kelas ${k.namaKelas}`} />
                </td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td className="font-semibold">{k.namaKelas}</td>
                <td>{k.tingkat}</td>
                <td>{k.jurusan}</td>
                <td>{k.tahunAjaran}</td>
                <td>{k.waliKelas}</td>
                <td>
                  <span className="badge badge-hadir">{k.jumlahSiswa}</span>
                </td>
                <td>
                  <button
                    className="btn btn-outline btn-sm mr-1"
                    onClick={() => {
                      const modal = (window as any).__kelasModal;
                      if (modal) modal.open(k);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(k.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />

      <KelasModal onSave={load} />
    </div>
  );
}

function KelasModal({ onSave }: { onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Kelas | null>(null);
  const [form, setForm] = useState({
    namaKelas: "",
    tingkat: "10",
    jurusan: "IPA",
    tahunAjaran: "2024/2025",
    waliKelas: "",
  });

  useEffect(() => {
    (window as any).__kelasModal = { open: (k: Kelas | null) => {
      setEdit(k);
      if (k) {
        setForm({
          namaKelas: k.namaKelas,
          tingkat: String(k.tingkat),
          jurusan: k.jurusan || "IPA",
          tahunAjaran: k.tahunAjaran || "2024/2025",
          waliKelas: k.waliKelas || "",
        });
      } else {
        setForm({ namaKelas: "", tingkat: "10", jurusan: "IPA", tahunAjaran: "2024/2025", waliKelas: "" });
      }
      setOpen(true);
    }};
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = edit
      ? (await apiPut(`/api/kelas/${edit.id}`, form)).ok
      : (await apiPost("/api/kelas", form)).ok;
    if (ok) {
      setOpen(false);
      onSave();
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DC]">
          <h3 className="font-bold text-lg text-gray-800 font-[Outfit]">
            {edit ? "Edit Kelas" : "Tambah Kelas"}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 bg-transparent border-none cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Kelas</label>
              <input
                type="text"
                className="input"
                value={form.namaKelas}
                onChange={(e) => setForm({ ...form, namaKelas: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Tingkat</label>
              <select
                className="input"
                value={form.tingkat}
                onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
              >
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
            </div>
            <div>
              <label className="label">Jurusan</label>
              <select
                className="input"
                value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
              >
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Bahasa">Bahasa</option>
              </select>
            </div>
            <div>
              <label className="label">Tahun Ajaran</label>
              <input
                type="text"
                className="input"
                value={form.tahunAjaran}
                onChange={(e) =>
                  setForm({ ...form, tahunAjaran: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Wali Kelas</label>
              <input
                type="text"
                className="input"
                value={form.waliKelas}
                onChange={(e) => setForm({ ...form, waliKelas: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
