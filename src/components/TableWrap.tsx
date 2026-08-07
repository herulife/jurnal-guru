"use client";

import { ReactNode } from "react";

export default function TableWrap({ children }: { children: ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

export function EmptyRow({ colSpan, loading, msg = "Belum ada data" }: { colSpan: number; loading?: boolean; msg?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-gray-400 py-8">
        {loading ? "Memuat..." : msg}
      </td>
    </tr>
  );
}
