import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const KOTA = ["Jakarta", "Bandung", "Surabaya", "Semarang", "Yogyakarta", "Medan", "Makassar", "Palembang", "Malang", "Denpasar", "Balikpapan", "Padang", "Bogor", "Tangerang"];

function waktuAgo(t: string): string {
  const ts = Date.parse(t.replace(" ", "T") + "Z");
  if (isNaN(ts)) return "baru saja";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 90) return "baru saja";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const PLAN_LABEL: Record<string, string> = {
  pro_6m: "Pro",
  premium_6m: "Premium",
};

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const [recentUsers, recentPayments, userCount, paidCount] = await Promise.all([
      db.select({ namaLengkap: users.namaLengkap, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.role, "user"))
        .orderBy(desc(users.createdAt))
        .limit(8),
      db.select({ userId: payments.userId, amount: payments.amount, verifiedAt: payments.verifiedAt, createdAt: payments.createdAt })
        .from(payments)
        .where(eq(payments.status, "verified"))
        .orderBy(desc(payments.verifiedAt))
        .limit(8),
      db.$count(users),
      db.$count(payments, eq(payments.status, "verified")),
    ]);

    const events: { id: string; icon: string; title: string; sub: string }[] = [];
    const namaDipakai = new Set<string>();

    for (const p of recentPayments) {
      const plan = PLAN_LABEL[p.amount === 49000 ? "premium_6m" : "pro_6m"] ?? "Pro";
      const user = recentUsers.find((u) => u.namaLengkap);
      const nama = user?.namaLengkap?.split(" ")[0] || "";
      if (nama && !namaDipakai.has(nama)) {
        namaDipakai.add(nama);
        const kota = KOTA[Math.abs(nama.length * 7 + p.amount) % KOTA.length];
        events.push({
          id: `pay-${p.userId}-${p.verifiedAt}`,
          icon: "fa-crown",
          title: `${nama} dari ${kota} baru saja upgrade ke paket ${plan}`,
          sub: `${waktuAgo(p.verifiedAt || p.createdAt)} · pembayaran terverifikasi`,
        });
      }
    }

    for (const u of recentUsers) {
      if (events.length >= 4) break;
      const nama = u.namaLengkap?.split(" ")[0] || "";
      if (!nama || namaDipakai.has(nama)) continue;
      namaDipakai.add(nama);
      const kota = KOTA[Math.abs(nama.length * 13) % KOTA.length];
      events.push({
        id: `reg-${u.createdAt}-${nama}`,
        icon: "fa-user-plus",
        title: `${nama} dari ${kota} baru saja bergabung dengan Jurnal Guru`,
        sub: waktuAgo(u.createdAt),
      });
    }

    if (events.length < 3) {
      events.push({
        id: "stat-users",
        icon: "fa-users",
        title: `${userCount} guru telah menggunakan Jurnal Guru`,
        sub: "dan terus bertambah setiap hari",
      });
      events.push({
        id: "stat-paid",
        icon: "fa-badge-check",
        title: `${paidCount} guru telah upgrade ke paket berbayar`,
        sub: "kepercayaan guru-guru di seluruh Indonesia",
      });
    }

    return Response.json({ ok: true, data: { events: events.slice(0, 4) } });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") return Response.json({ ok: false, msg: "Unauthorized" }, { status: 401 });
    return Response.json({ ok: false, msg: "Gagal memuat notifikasi" }, { status: 500 });
  }
}