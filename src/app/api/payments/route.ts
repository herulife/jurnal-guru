import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { payments, subscriptions, users, settings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export const PLANS: Record<string, { name: string; price: number; months: number; tagline: string }> = {
  pro_6m: { name: "Pro", price: 29000, months: 6, tagline: "6 bulan" },
  premium_6m: { name: "Premium", price: 49000, months: 6, tagline: "6 bulan, akses semua" },
  // legacy: untuk verifikasi order lama yang masih pending
  pro_1m: { name: "Pro", price: 29000, months: 1, tagline: "1 bulan" },
  pro_3m: { name: "Pro", price: 79000, months: 3, tagline: "3 bulan" },
  pro_12m: { name: "Pro", price: 279000, months: 12, tagline: "1 tahun" },
  pro_24m: { name: "Pro", price: 499000, months: 24, tagline: "2 tahun" },
  premium: { name: "Premium", price: 499000, months: 6, tagline: "6 bulan" },
};

const ACTIVE_PLAN_IDS = ["pro_6m", "premium_6m"];

export async function getPaymentSettings() {
  const rows = await db.select().from(settings).all();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value || "";
  return {
    bank_name: map.bank_name || "BRI",
    bank_account_name: map.bank_account_name || "Jurnal Guru",
    bank_account_number: map.bank_account_number || "",
    bank_note: map.bank_note || "Konfirmasi otomatis setelah admin verifikasi bukti transfer.",
  };
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const planId = body.planId;
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) return apiError("Paket tidak valid");
    if (!ACTIVE_PLAN_IDS.includes(planId)) return apiError("Paket tidak valid");

    const last = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, session.id),
          eq(payments.status, "pending")
        )
      )
      .all();

    if (last.length > 0) {
      return apiOk(
        { paymentId: last[0].id, status: "pending", planId },
        "Ada pembayaran pending"
      );
    }

    const paymentId = uuidv4();
    const subscriptionId = uuidv4();

    await db.insert(subscriptions).values({
      id: subscriptionId,
      userId: session.id,
      planId,
      status: "pending",
      startedAt: new Date().toISOString(),
    });

    await db.insert(payments).values({
      id: paymentId,
      userId: session.id,
      subscriptionId,
      amount: plan.price,
      currency: "IDR",
      status: "pending",
      paymentMethod: "bank_transfer",
      bankName: "BRI",
      createdAt: new Date().toISOString(),
    });

    await addLog(session.id, "CREATE_PAYMENT", `Order ${plan.name} Rp ${plan.price}`);

    const bank = await getPaymentSettings();
    return apiOk({
      paymentId,
      planId,
      amount: plan.price,
      bank,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "1";

    if (admin) {
      await requireAdmin();
      const rows = await db
        .select({
          id: payments.id,
          amount: payments.amount,
          status: payments.status,
          paymentMethod: payments.paymentMethod,
          bankName: payments.bankName,
          createdAt: payments.createdAt,
          notes: payments.notes,
          verifiedAt: payments.verifiedAt,
          userId: payments.userId,
          plan: subscriptions.planId,
          username: users.username,
        })
        .from(payments)
        .leftJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
        .leftJoin(users, eq(payments.userId, users.id))
        .orderBy(payments.createdAt)
        .all();
      const bank = await getPaymentSettings();
      return apiOk({ payments: rows, bank });
    }

    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, session.id))
      .orderBy(payments.createdAt)
      .all();
    const bank = await getPaymentSettings();
    const user = await db.select({ plan: users.plan }).from(users).where(eq(users.id, session.id)).get();
    return apiOk({ payments: rows, bank, plan: user?.plan || "gratis" });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}