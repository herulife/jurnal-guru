"use client";

function pageWindow(current: number, totalPages: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const set = new Set<number>([1, totalPages, current - 1, current, current + 1]);
  for (let i = 1; i <= totalPages; i++) {
    if (set.has(i)) pages.push(i);
  }
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (typeof p === "number" && prev && p - prev > 1) out.push("…");
    out.push(p);
    if (typeof p === "number") prev = p;
  }
  return out;
}

export default function Pagination({
  current, total, pageSize, onChange,
}: {
  current: number; total: number; pageSize: number; onChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = pageWindow(current, totalPages);

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500">
        {total} data · Halaman {current}/{totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button className="btn btn-outline btn-sm px-2" disabled={current <= 1} onClick={() => onChange(current - 1)} aria-label="Halaman sebelumnya">
          <i className="fas fa-chevron-left"></i>
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button key={p} className={`btn btn-sm px-3 ${p === current ? "btn-primary" : "btn-outline"}`} onClick={() => onChange(p)} aria-label={`Halaman ${p}`} aria-current={p === current ? "page" : undefined}>
              {p}
            </button>
          )
        )}
        <button className="btn btn-outline btn-sm px-2" disabled={current >= totalPages} onClick={() => onChange(current + 1)} aria-label="Halaman berikutnya">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
