import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { jadwalMengajar, absensi, dataKelas, kalenderCatatan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const month = Number(url.searchParams.get("month")) || 0;
    const year = Number(url.searchParams.get("year")) || 0;
    const scope = scopeUserId(session.role, session.id);

    const kelasList = scope
      ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
      : await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const events: {
      date: string;
      title: string;
      time: string;
      type: string;
      id?: string;
    }[] = [];

    const hariMap: Record<string, string> = {
      Monday: "Senin",
      Tuesday: "Selasa",
      Wednesday: "Rabu",
      Thursday: "Kamis",
      Friday: "Jumat",
      Saturday: "Sabtu",
      Sunday: "Minggu",
    };

    if (month && year) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const jadwalList = scope
        ? await db.select().from(jadwalMengajar).where(eq(jadwalMengajar.userId, scope)).all()
        : await db.select().from(jadwalMengajar).all();
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month - 1, d);
        const dayName = hariMap[dt.toLocaleDateString("en-US", { weekday: "long" })];
        if (dayName === "Minggu") continue;
        for (const j of jadwalList) {
          if (j.hari === dayName) {
            const kN = j.kelasId ? kelasMap[j.kelasId] || "-" : "-";
            events.push({
              date:
                year +
                "-" +
                String(month).padStart(2, "0") +
                "-" +
                String(d).padStart(2, "0"),
              title: `${j.mataPelajaran} - ${kN}`,
              time: (j.jamMulai || "") + "-" + (j.jamSelesai || ""),
              type: "jadwal",
            });
          }
        }
      }
    }

    const absenList = scope
      ? await db.select().from(absensi).where(eq(absensi.userId, scope)).all()
      : await db.select().from(absensi).all();
    for (const a of absenList) {
      const kN = a.kelasId ? kelasMap[a.kelasId] || "-" : "-";
      events.push({
        date: a.tanggal || "",
        title: `Absensi ${kN} (${a.status})`,
        time: "",
        type: "absensi",
      });
    }

    const catatans = scope
      ? await db
          .select()
          .from(kalenderCatatan)
          .where(eq(kalenderCatatan.userId, scope))
          .all()
      : await db
          .select()
          .from(kalenderCatatan)
          .all();
    for (const c of catatans) {
      events.push({
        date: c.tanggal,
        title: c.isi.length > 30 ? c.isi.slice(0, 30) + "…" : c.isi,
        time: "",
        type: "catatan",
        id: c.id,
      });
    }

    events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return apiOk(events.slice(0, 200));
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
    const { tanggal, isi } = body;
    if (!tanggal || typeof isi !== "string" || !isi.trim()) {
      return apiError("Tanggal dan isi catatan wajib diisi");
    }
    const id = uuidv4();
    await db.insert(kalenderCatatan).values({
      id,
      tanggal,
      isi: isi.trim(),
      userId: session.id,
    });
    await addLog(session.id, "CREATE_CATATAN", `Catatan ${tanggal}`);
    return apiOk({ id }, "Catatan disimpan");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { id, isi } = body;
    if (!id || typeof isi !== "string" || !isi.trim()) {
      return apiError("Data catatan tidak lengkap");
    }
    const existing = await db
      .select()
      .from(kalenderCatatan)
      .where(eq(kalenderCatatan.id, id))
      .get();
    if (!existing) return apiError("Catatan tidak ditemukan", 404);
    const scope = scopeUserId(session.role, session.id);
    if (scope && existing.userId !== scope) {
      return apiError("Catatan milik pengguna lain", 403);
    }
    await db
      .update(kalenderCatatan)
      .set({ isi: isi.trim(), updatedAt: new Date().toISOString() })
      .where(eq(kalenderCatatan.id, id));
    return apiOk(null, "Catatan diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return apiError("ID catatan wajib diisi");
    const existing = await db
      .select()
      .from(kalenderCatatan)
      .where(eq(kalenderCatatan.id, id))
      .get();
    if (!existing) return apiError("Catatan tidak ditemukan", 404);
    const scope = scopeUserId(session.role, session.id);
    if (scope && existing.userId !== scope) {
      return apiError("Catatan lain pengguna lain", 403);
    }
    await db.delete(kalenderCatatan).where(eq(kalenderCatatan.id, id));
    await addLog(session.id, "DELETE_CATATAN", `Hapus catatan ${existing.tanggal}`);
    return apiOk(null, "Catatan dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}