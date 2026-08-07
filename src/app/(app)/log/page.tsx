"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";
import Pagination from "@/components/Pagination";
import AdminGuard from "@/components/AdminGuard";

interface LogEntry { id: string; timestamp: string; userId: string; action: string; description: string; }

export default function LogPage() {
  const [data, setData] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    apiGet<LogEntry[]>("/api/log").then((r) => { if (r.ok && r.data) setData(r.data); });
  }, []);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    setSelectAll(false);
  }, [data]);

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
      setSelected(new Set(paginatedData.map((l) => l.id)));
    }
    setSelectAll(!selectAll);
  }

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Activity Log</h1>
      </header>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm text-blue-700 font-semibold">{selected.size} terpilih</span>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th className="w-10"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /></th><th>No</th><th>Waktu</th><th>User</th><th>Aksi</th><th>Deskripsi</th></tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-8">Belum ada data</td></tr>}
            {paginatedData.map((l, i) => (
              <tr key={l.id}>
                <td><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} /></td>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td className="text-xs">{new Date(l.timestamp).toLocaleString("id-ID")}</td>
                <td className="text-xs text-gray-500">{l.userId?.substring(0, 8)}...</td>
                <td><span className="badge badge-hadir">{l.action}</span></td>
                <td className="text-sm">{l.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={page} total={data.length} pageSize={pageSize} onChange={setPage} />
    </div>
    </AdminGuard>
  );
}
