"use client";

import { useUserPlan, canExport } from "@/lib/useUserPlan";

type Column = { key: string; label: string };

/**
 * Exportbutton PDF. Jika plan gratis, arahkan ke upgrade.
 * Gunakan window.print() dengan pratinjau bersih (Save as PDF).
 */
export default function ExportButton<T extends object>({
  fileName,
  title,
  subtitle,
  columns,
  rows,
}: {
  fileName: string;
  title: string;
  subtitle?: string;
  columns: Column[];
  rows: T[];
}) {
  const { plan, loading } = useUserPlan();
  const allowed = canExport(plan);

  function doExport() {
    const thead = columns.map((c) => `<th>${c.key.replace(/_/g, " ").toUpperCase()}</th>`).join("");
    const tbody = rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => {
              const v = (r as Record<string, unknown>)[c.key];
              return `<td>${v === null || v === undefined ? "-" : String(v)}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");

    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:32px}
        .head{text-align:center;margin-bottom:24px}
        .head h1{font-size:18px;margin:0 0 4px}
        .head p{margin:2px 0;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th,td{border:1px solid #ccc;padding:5px 7px;text-align:left}
        th{background:#0D7C66;color:#fff;font-weight:600}
        tr:nth-child(even){background:#f7f4ef}
        .footer{margin-top:24px;font-size:11px;color:#555;text-align:right}
      </style></head><body>
        <div class="head"><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>
        <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
        <div class="footer">Dicetak dari Jurnal Guru — ${new Date().toLocaleString("id-ID")}</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  }

  if (loading) return null;

  if (!allowed) {
    return (
      <a
        href="/checkout?plan=pro"
        className="btn btn-outline text-xs gap-1"
        title="Export PDF adalah fitur Pro"
      >
        <i className="fas fa-lock text-xs"></i> Export PDF (Pro)
      </a>
    );
  }

  return (
    <button onClick={doExport} className="btn btn-primary text-xs gap-1">
      <i className="fas fa-file-pdf text-xs"></i> Export PDF
    </button>
  );
}