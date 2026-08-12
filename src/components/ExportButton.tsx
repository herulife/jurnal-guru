"use client";

import { useUserPlan, canExport, canUsePremium } from "@/lib/useUserPlan";
import { bukaDokumen, esc } from "@/lib/dokumen";

type Column = { key: string; label: string };

/**
 * ExportButton PDF. Jika plan tidak memenuhi minPlan, arahkan ke upgrade.
 * Membuka tab baru berisi dokumen resmi: kop sekolah, judul, identitas,
 * tabel data, dan blok tanda tangan kepala sekolah + guru mapel.
 */
export default function ExportButton<T extends object>({
  fileName,
  title,
  subtitle,
  columns,
  rows,
  minPlan,
  identitas,
}: {
  fileName: string;
  title: string;
  subtitle?: string;
  columns: Column[];
  rows: T[];
  minPlan?: "pro" | "premium";
  identitas?: string[];
}) {
  const { plan, loading } = useUserPlan();
  const allowed =
    minPlan === "premium"
      ? canUsePremium(plan)
      : minPlan === "pro"
        ? canExport(plan)
        : true;

  async function doExport() {
    const thead = columns.map((c) => `<th class="${c.key === "no" || c.key === "nomor" ? "nomer" : ""}">${esc(c.label)}</th>`).join("");
    const tbody = rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => {
              const v = (r as Record<string, unknown>)[c.key];
              return `<td>${esc(v === null || v === undefined ? "-" : String(v))}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");

    await bukaDokumen({
      judul: title,
      subtitle,
      identitas,
      body: `<table class="data"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`,
    });
  }

  if (loading) return null;

  if (!allowed) {
    const label = minPlan === "premium" ? "Export PDF (Premium)" : "Export PDF (Pro)";
    return (
      <a
        href={minPlan === "premium" ? "/checkout?plan=premium" : "/checkout?plan=pro"}
        className="btn btn-outline text-xs gap-1"
        title={minPlan === "premium" ? "Export PDF adalah fitur Premium" : "Export PDF adalah fitur Pro"}
      >
        <i className="fas fa-lock text-xs"></i> {label}
      </a>
    );
  }

  return (
    <button onClick={doExport} className="btn btn-primary text-xs gap-1">
      <i className="fas fa-file-pdf text-xs"></i> Export PDF
    </button>
  );
}