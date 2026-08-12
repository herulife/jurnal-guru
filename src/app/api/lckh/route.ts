import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { requirePlan } from "@/lib/plans";
import { db } from "@/db";
import { lckh, jurnalMengajar, dataKelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await requirePlan(session.role, session.id, "premium");
    const url = new URL(req.url);
    const bulan = url.searchParams.get("bulan");
    const tahun = url.searchParams.get("tahun");
    const scope = scopeUserId(session.role, session.id);

    let rows = scope
      ? await db.select().from(lckh).where(eq(lckh.userId, scope)).all()
      : await db.select().from(lckh).all();
    if (bulan) {
      rows = rows.filter(
        (r) => r.tanggal?.includes(`-${bulan}-`) || r.tanggal?.includes(`/${bulan}/`)
      );
    }
    if (tahun) {
      rows = rows.filter((r) => r.tanggal?.includes(tahun));
    }
    rows.sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
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
    await requirePlan(session.role, session.id, "premium");
    const body = await req.json();
    const records = body.records;
    const { action, bulan, tahun } = body;
    const scope = scopeUserId(session.role, session.id);

    if (!Array.isArray(records) && action !== "generate") {
      return apiError("Data tidak lengkap");
    }

    if (action === "generate") {
      // Generate dari jurnal mengajar per bulan/tahun
      const jurnal = scope
        ? await db.select().from(jurnalMengajar).where(eq(jurnalMengajar.userId, scope)).all()
        : await db.select().from(jurnalMengajar).all();
      const kelasList = scope
        ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
        : await db.select().from(dataKelas).all();
      const kelasMap: Record<string, string> = {};
      for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

      const groups: Record<string, { tgl: string; mapel: string; kelas: string[]; jids: string[] }> = {};
      for (const j of jurnal) {
        const d = j.tanggal;
        if (!d) continue;
        const [th, b] = d.split("-");
        if (bulan && String(b).padStart(2, "0") !== String(bulan).padStart(2, "0")) continue;
        if (tahun && th !== String(tahun)) continue;
        const kn = j.kelasId ? kelasMap[j.kelasId] || "-" : j.kelasId || "-";
        const tglKey = d;
        const mapel = j.mataPelajaran || "-";
        const key = `${tglKey}|${mapel}`;
        if (!groups[key]) groups[key] = { tgl: tglKey, mapel, kelas: [], jids: [] };
        if (groups[key].kelas.indexOf(kn) < 0) groups[key].kelas.push(kn);
        if (j.id && groups[key].jids.indexOf(j.id) < 0) groups[key].jids.push(j.id);
      }

      const out = Object.keys(groups)
        .sort()
        .map((k, i) => {
          const g = groups[k];
          return {
            id: `tmp-${uuidv4()}`,
            no: String(i + 1),
            kegiatan: "Mengajar",
            pekerjaan: `KBM di kelas ${g.kelas.join(", ")} mapel ${g.mapel}`,
            tanggal: g.tgl,
            jurnalId: g.jids.join("|"),
          };
        });
      return apiOk({ data: out });
    }

    // Simpan records (hapus lama sesuai filter bulan/tahun lalu insert)
    let toDelete = scope
      ? await db.select().from(lckh).where(eq(lckh.userId, scope)).all()
      : await db.select().from(lckh).all();
    if (bulan) toDelete = toDelete.filter((r) => r.tanggal?.includes(`-${bulan}-`));
    if (tahun) toDelete = toDelete.filter((r) => r.tanggal?.includes(tahun));
    const idsToDelete = toDelete.map((r) => r.id);
    if (idsToDelete.length) {
      for (const id of idsToDelete) await db.delete(lckh).where(eq(lckh.id, id));
    }

    if (records.length) {
      const rows = records.map((r: Record<string, unknown>) => ({
        id: r.id && typeof r.id === "string" && r.id.startsWith("tmp-") ? uuidv4() : String(r.id || uuidv4()),
        userId: session.id,
        no: String(r.no || ""),
        kegiatan: String(r.kegiatan || ""),
        pekerjaan: String(r.pekerjaan || ""),
        tanggal: String(r.tanggal || ""),
        jurnalId: String(r.jurnalId || ""),
      }));
      await db.insert(lckh).values(rows);
    }
    await addLog(session.id, "SAVE_LCKH", `Simpan ${records.length} LCKH`);
    return apiOk({ msg: `${records.length} LCKH disimpan` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}