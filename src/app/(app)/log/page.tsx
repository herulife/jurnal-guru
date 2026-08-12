"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";
import AdminGuard from "@/components/AdminGuard";
import HeaderActions from "@/components/HeaderActions";

interface LogEntry { id: string; timestamp: string; userId: string; action: string; description: string; }

export default function LogPage() {
  const [data, setData] = useState<LogEntry[]>([]);

  useEffect(() => {
    apiGet<LogEntry[]>("/api/log").then((r) => { if (r.ok && r.data) setData(r.data); });
  }, []);

  return (
    <AdminGuard>
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Riwayat Aktivitas</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="table-wrap">
        <table>
          <thead><tr><th>No</th><th>Waktu</th><th>User</th><th>Aksi</th><th>Deskripsi</th></tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">Belum ada data</td></tr>}
            {data.map((l, i) => (
              <tr key={l.id}>
                <td>{i + 1}</td>
                <td className="text-xs">{new Date(l.timestamp).toLocaleString("id-ID")}</td>
                <td className="text-xs text-gray-500">{l.userId?.substring(0, 8)}...</td>
                <td><span className="badge badge-hadir">{l.action}</span></td>
                <td className="text-sm">{l.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminGuard>
  );
}
