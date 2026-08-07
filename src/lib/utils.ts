export function formatDate(v: string | Date | null | undefined): string {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(v: string | Date | null | undefined): string {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "")
    .replace(/^(\d+)\s+(\w+)\s+(\d+)$/, "$1 $2 $3");
}

export function todayISO(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normDate(v: string): string {
  if (!v) return "";
  const s = String(v);
  if (s.includes("-")) return s;
  if (s.includes("/")) {
    const p = s.split("/");
    if (p.length === 3) return p[2] + "-" + p[1] + "-" + p[0];
  }
  return s;
}

export function apiResponse(ok: boolean, data?: unknown, msg?: string) {
  return Response.json({ ok, data, msg });
}

export function apiOk(data?: unknown, msg?: string) {
  return Response.json({ ok: true, data, msg });
}

export function apiError(msg: string, status = 400) {
  return Response.json({ ok: false, msg }, { status });
}

export function apiServerError(msg = "Terjadi kesalahan server") {
  return apiError(msg, 500);
}

export const hariList = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
export const kategoriNilai = [
  "Pengetahuan",
  "Keterampilan",
  "Ulangan",
  "Tugas",
];
