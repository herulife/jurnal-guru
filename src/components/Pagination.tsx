"use client";

export default function Pagination({
  current, total, pageSize, onChange,
}: {
  current: number; total: number; pageSize: number; onChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500">{total} data</span>
      <div className="flex items-center gap-1">
        <button className="btn btn-outline btn-sm px-2" disabled={current <= 1} onClick={() => onChange(current - 1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} className={`btn btn-sm px-3 ${p === current ? "btn-primary" : "btn-outline"}`} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button className="btn btn-outline btn-sm px-2" disabled={current >= totalPages} onClick={() => onChange(current + 1)}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
