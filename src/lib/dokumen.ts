import { apiGet } from "@/lib/useApi";

export interface ProfilDokumen {
  namaSekolah?: string;
  alamat?: string;
  npsn?: string;
  kota?: string;
  provinsi?: string;
  telepon?: string;
  kepalaSekolah?: string;
  nipKepsek?: string;
  namaGuru?: string;
  nipGuru?: string;
  logoUrl?: string;
}

let profilCache: ProfilDokumen | undefined | null;

export async function getProfil(force = false): Promise<ProfilDokumen> {
  if (!force && profilCache !== undefined && profilCache !== null) return profilCache;
  try {
    const res = await apiGet<ProfilDokumen>("/api/profil");
    profilCache = res.ok && res.data ? res.data : {};
  } catch {
    profilCache = {};
  }
  return profilCache ?? {};
}

export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function tglPanjang(d: Date = new Date()): string {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function kapital(s: string): string {
  return s
    .split(/\s+/)
    .map((kata) => (kata ? kata[0]!.toUpperCase() + kata.slice(1).toLowerCase() : kata))
    .join(" ");
}

export function kopTeks(p: ProfilDokumen): string {
  const kotaProv = [p.kota, p.provinsi].filter(Boolean).join(", ");
  const bagian = [p.alamat, kotaProv].filter(Boolean);
  const tambahan = [p.telepon && `Telp. ${p.telepon}`, p.npsn && `NPSN ${p.npsn}`].filter(Boolean);
  if (tambahan.length) bagian.push(tambahan.join(" | "));
  return bagian.join(" | ");
}

export function kopHtml(p: ProfilDokumen): string {
  const logo = p.logoUrl?.trim() ? p.logoUrl : "/logo.svg";
  return `
  <div class="kop">
    <div class="kop-logo"><img src="${esc(logo)}" alt="logo"/></div>
    <div class="kop-teks">
      <div class="kop-nama">${esc(p.namaSekolah || "SEKOLAH")}</div>
      <div class="kop-alamat">${esc(kopTeks(p))}</div>
    </div>
  </div>
  <div class="kop-garis"></div>`;
}

export function ttdHtml(
  p: ProfilDokumen,
  guruNamaAdditional?: string,
  jabatanGuru = "Guru Mata Pelajaran"
): string {
  const kepala = p.kepalaSekolah?.trim() || "............................";
  const nipKep = p.nipKepsek?.trim() ? `NIP. ${p.nipKepsek}` : "NIP. ............................";
  const guruNama = (guruNamaAdditional && guruNamaAdditional.trim()) || p.namaGuru?.trim() || "............................";
  const nipGuru = p.nipGuru?.trim() ? `NIP. ${p.nipGuru}` : "NIP. ............................";
  const kota = kapital(p.kota || "");
  return `
  <div class="ttd">
    <div class="ttd-kota">${esc(kota ? `${kota}, ` : "")}${tglPanjang()}</div>
    <div class="ttd-grid">
      <div class="ttd-kiri">
        <div>Kepala Sekolah</div>
        <div class="ttd-spasi"></div>
        <div class="ttd-nama">${esc(kapital(kepala))}</div>
        <div class="ttd-nip">${esc(nipKep)}</div>
      </div>
      <div class="ttd-kanan">
        <div>${esc(jabatanGuru)}</div>
        <div class="ttd-spasi"></div>
        <div class="ttd-nama">${esc(kapital(guruNama))}</div>
        <div class="ttd-nip">${esc(nipGuru)}</div>
      </div>
    </div>
  </div>`;
}

const CSS_DOKUMEN = `
  @page { size: A4; margin: 11mm 13mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 11pt; margin: 0; }
  .kop { display: grid; grid-template-columns: 72px 1fr; align-items: center; gap: 14px; padding-bottom: 4px; }
  .kop-logo img { width: 58px; height: 58px; object-fit: contain; display: block; }
  .kop-teks { text-align: center; }
  .kop-nama { font-size: 15pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
  .kop-alamat { font-size: 8.5pt; margin-top: 3px; line-height: 1.4; }
  .kop-garis { border-bottom: 2.6px solid #111; margin-bottom: 2px; }
  .kop-garis::after { content: ""; display: block; border-bottom: 1px solid #111; margin-top: 2px; }
  .judul { text-align: center; font-weight: 700; font-size: 12.5pt; text-decoration: underline; margin: 14px 0 6px; }
  .judul-sub { text-align: center; font-size: 10pt; margin-bottom: 6px; }
  .identitas { width: 100%; border-collapse: collapse; margin: 4px 0 10px; font-size: 10pt; }
  .identitas td { padding: 1px 4px; vertical-align: top; }
  .identitas .lv { width: 30%; padding-left: 0; }
  table.data { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 6px; }
  table.data th, table.data td { border: 1px solid #555; padding: 5px 6px; text-align: left; vertical-align: top; }
  table.data th { background: #eee; font-weight: 700; }
  table.data .nomer { text-align: center; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .ttd { margin-top: 26px; }
  .ttd-kota { text-align: right; font-size: 10.5pt; margin-bottom: 34px; }
  .ttd-grid { display: grid; grid-template-columns: 1fr 1fr; max-width: 660px; margin-left: auto; text-align: center; font-size: 10.5pt; }
  .ttd-spasi { height: 52px; }
  .ttd-nama { font-weight: 700; text-decoration: underline; }
  .footer { margin-top: 22px; font-size: 8.5pt; color: #777; text-align: right; }
`;

export interface DokumenParams {
  judul: string;
  subtitle?: string;
  identitas?: string[];
  body: string;
  guru?: string;
  jabatanGuru?: string;
  catatan?: string;
}

function identitasHtml(identitas: string[]): string {
  if (!identitas.length) return "";
  return `<table class="identitas">${identitas
    .map((baris) => {
      const cells = baris.split("~");
      const cols: string[] = [];
      while (cells.length) {
        const c = cells.shift()!;
        const isLabel = c.startsWith(":");
        cols.push(`<td ${isLabel ? 'class="lv"' : ""}>${esc(isLabel ? c.slice(1) : c)}</td>`);
      }
      return `<tr>${cols.join("")}</tr>`;
    })
    .join("")}</table>`;
}

export interface XlsxParams {
  file: string;
  judul: string;
  identitas?: string[];
  headers: string[];
  rows: (string | number)[][];
  catatan?: string;
}

export async function exportXlsx(params: XlsxParams): Promise<void> {
  const { file, judul, identitas = [], headers, rows, catatan } = params;
  const p = await getProfil();
  const guru = p.namaGuru?.trim() || "";
  const kepala = p.kepalaSekolah?.trim() || "";
  const nipKep = p.nipKepsek ? `NIP. ${p.nipKepsek}` : "";
  const nipGuru = p.nipGuru ? `NIP. ${p.nipGuru}` : "";
  const kota = kapital(p.kota || "");

  type MRange = { s: { r: number; c: number }; e: { r: number; c: number } };
  const aoa: (string | number)[][] = [];
  const merges: MRange[] = [];
  const push = (r: (string | number)[], merge = false) => {
    const i = aoa.length;
    aoa.push(r);
    if (merge) merges.push({ s: { r: i, c: 0 }, e: { r: i, c: 3 } });
    return i;
  };
  const lebar = 4;

  push([p.namaSekolah || "SEKOLAH"], true);
  push([kopTeks(p)], true);
  push([]);
  push([judul], true);
  push([]);
  for (const raw of identitas) {
    const cells = raw.split("~");
    const baris: (string | number)[] = [];
    for (let i = 0; i < lebar; i++) baris.push(cells[i] ? cells[i].replace(/^:/, "") : "");
    push(baris);
  }
  push([]);
  push(headers);
  for (const r of rows) push(r as (string | number)[]);
  push([]);
  if (catatan) push([catatan], true);

  const tglRow = push([kota ? `${kota}, ` : "", ""]);
  merges.push({ s: { r: tglRow, c: 0 }, e: { r: tglRow, c: 3 } });
  push(["Kepala Sekolah", "", "", "Guru Mata Pelajaran"], true);
  push([]);
  push([]);
  push([]);
  push(
    [kepala ? kapital(kepala) : "............................", "", "", guru ? kapital(guru) : "............................"],
    true
  );
  push([nipKep, "", "", nipGuru], true);

  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = merges as never;
  ws["!cols"] = [{ wch: 16 }, { wch: 30 }, { wch: 26 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, judul.slice(0, 28) || "Laporan");
  XLSX.writeFile(wb, file);
}

export async function bukaDokumen(params: DokumenParams): Promise<void> {
  const p = await getProfil();
  const { judul, subtitle, identitas = [], body, guru, jabatanGuru, catatan } = params;
  const w = window.open("", "_blank", "width=900,height=640");
  if (!w) return;

  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"/>
    <title>${esc(judul)}</title><style>${CSS_DOKUMEN}</style></head><body>
    ${kopHtml(p)}
    <div class="judul">${esc(judul)}</div>
    ${subtitle ? `<div class="judul-sub">${esc(subtitle)}</div>` : ""}
    ${identitasHtml(identitas)}
    ${body}
    ${ttdHtml(p, guru, jabatanGuru)}
    ${catatan ? `<div class="catatan">${catatan}</div>` : ""}
    <div class="footer">Dicetak dari Jurnal Guru — ${new Date().toLocaleString("id-ID")}</div>
    <script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
  </body></html>`);
  w.document.close();
  w.focus();
}