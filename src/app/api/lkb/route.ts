import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { lkb, lckh } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const bulan = url.searchParams.get("bulan");
    const tahun = url.searchParams.get("tahun");

    let rows = await db.select().from(lkb).all();
    if (bulan) rows = rows.filter((r) => String(r.bulan) === String(bulan).padStart(2, "0"));
    if (tahun) rows = rows.filter((r) => String(r.tahun) === String(tahun));
    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const records = body.records;
    const { action, bulan, tahun } = body;

    if (action === "generate") {
      // Generate dari LCKH per bulan/tahun
      const lckhRows = await db.select().from(lckh).all();
      const grouped: Record<string, { kegiatan: string; pekerjaan: string; count: number }> = {};
      for (const r of lckhRows) {
        const d = r.tanggal || "";
        const [th, b] = d.split("-");
        if (bulan && String(b).padStart(2, "0") !== String(bulan).padStart(2, "0")) continue;
        if (tahun && th !== String(tahun)) continue;
        const key = `${r.kegiatan}|${r.pekerjaan}`;
        if (!grouped[key]) grouped[key] = { kegiatan: r.kegiatan || "", pekerjaan: r.pekerjaan || "", count: 0 };
        grouped[key].count++;
      }
      const out = Object.keys(grouped).map((k, i) => ({
        id: `tmp-${uuidv4()}`,
        no: String(i + 1),
        uraianTugas: `${grouped[k].kegiatan} ${grouped[k].pekerjaan}`.trim(),
        vol: grouped[k].count,
        buktiDokumen: "Dokumentasi kegiatan dan presensi",
        bulan: bulan || "",
        tahun: tahun || "",
      }));
      return apiOk({ data: out });
    }

    if (!Array.isArray(records)) return apiError("Data tidak lengkap");

    // Hapus sesuai filter bulan/tahun lalu simpan
    let toDelete = await db.select().from(lkb).all();
    if (bulan) toDelete = toDelete.filter((r) => String(r.bulan) === String(bulan).padStart(2, "0"));
    if (tahun) toDelete = toDelete.filter((r) => String(r.tahun) === String(tahun));
    for (const r of toDelete) await db.delete(lkb).where(eq(lkb.id, r.id));

    if (records.length) {
      const rows = records.map((r: Record<string, unknown>) => ({
        id: r.id && typeof r.id === "string" && r.id.startsWith("tmp-") ? uuidv4() : String(r.id || uuidv4()),
        no: String(r.no || ""),
        uraianTugas: String(r.uraianTugas || ""),
        vol: Number(r.vol) || 0,
        buktiDokumen: String(r.buktiDokumen || ""),
        bulan: String(r.bulan || ""),
        tahun: String(r.tahun || ""),
      }));
      await db.insert(lkb).values(rows);
    }
    await addLog(session.id, "SAVE_LKB", `Simpan ${records.length} LKB`);
    return apiOk({ msg: `${records.length} LKB disimpan` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}