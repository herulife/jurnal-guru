import { requireAuth, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { jadwalMengajar, absensi, dataKelas } from "@/db/schema";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const month = Number(url.searchParams.get("month")) || 0;
    const year = Number(url.searchParams.get("year")) || 0;

    const kelasList = await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const events: {
      date: string;
      title: string;
      time: string;
      type: string;
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
      const jadwalList = await db.select().from(jadwalMengajar).all();
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

    const absenList = await db.select().from(absensi).all();
    for (const a of absenList) {
      const kN = a.kelasId ? kelasMap[a.kelasId] || "-" : "-";
      events.push({
        date: a.tanggal || "",
        title: `Absensi ${kN} (${a.status})`,
        time: "",
        type: "absensi",
      });
    }

    events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return apiOk(events.slice(0, 100));
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
