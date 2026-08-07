import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { payments, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const row = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!row) return apiError("Pembayaran tidak ditemukan", 404);
    if (row.userId !== session.id) {
      await requireAdmin();
    }
    return apiOk({ payment: row });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

type VerifyBody = {
  status?: string;
  notes?: string;
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = (await req.json()) as VerifyBody;
    const user = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!user) return apiError("Pembayaran tidak ditemukan", 404);

    if (user.userId !== session.id) {
      await requireAdmin();
    }

    if (body.notes !== undefined) {
      await db
        .update(payments)
        .set({ notes: body.notes })
        .where(eq(payments.id, id));
      return apiOk(null, "Catatan disimpan");
    }

    if (body.status === "verifikasi" || body.status === "tolak") {
      await requireAdmin();
      const verified = body.status === "verifikasi";
      await db
        .update(payments)
        .set({
          status: verified ? "paid" : "rejected",
          verifiedAt: verified ? new Date().toISOString() : null,
          verifiedBy: session.id,
        })
        .where(eq(payments.id, id));

      if (verified && user.subscriptionId) {
        const sub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, user.subscriptionId))
          .get();
        if (sub) {
          const now = new Date();
          const expires = new Date(now);
          expires.setMonth(expires.getMonth() + 1);
          await db
            .update(subscriptions)
            .set({ status: "active", startedAt: now.toISOString(), expiresAt: expires.toISOString() })
            .where(eq(subscriptions.id, sub.id));
          await db
            .update(users)
            .set({ plan: sub.planId })
            .where(eq(users.id, user.userId));
        }
      }

      await addLog(session.id, "VERIFY_PAYMENT", `${body.status} ${id}`);
      return apiOk(null, verified ? "Pembayaran diverifikasi" : "Pembayaran ditolak");
    }

    return apiError("Aksi tidak valid");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}