import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { payments, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import { PLANS } from "@/lib/payment-plans";
import { normalizePhone, sendWaNotification } from "@/lib/notifWa";
import { invoiceWaText, invoiceHtml, invoiceNumber } from "@/lib/invoice";
import { sendInvoiceEmail } from "@/lib/email";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const row = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        amount: payments.amount,
        notes: payments.notes,
        status: payments.status,
        whatsapp: payments.whatsapp,
        planId: subscriptions.planId,
        createdAt: payments.createdAt,
        verifiedAt: payments.verifiedAt,
        proofUrl: payments.proofUrl,
        subStartedAt: subscriptions.startedAt,
        subExpiresAt: subscriptions.expiresAt,
      })
      .from(payments)
      .leftJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
      .where(eq(payments.id, id))
      .get();
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
  whatsapp?: string;
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

    if (body.whatsapp !== undefined) {
      const whatsapp = normalizePhone(body.whatsapp);
      if (!whatsapp || !/^62\d{8,13}$/.test(whatsapp)) {
        return apiError("Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx");
      }
      await db
        .update(payments)
        .set({ whatsapp })
        .where(eq(payments.id, id));
      return apiOk(null, "Nomor WhatsApp disimpan");
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
      if (user.status !== "pending") {
        return apiError("Pembayaran ini sudah diproses sebelumnya", 400);
      }
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
          const planDef = PLANS[sub.planId];
          const months = planDef?.months ?? 1;
          const now = new Date();
          const expires = months > 0 ? new Date(now) : null;
          if (expires) expires.setMonth(expires.getMonth() + months);
          await db
            .update(subscriptions)
            .set({ status: "active", startedAt: now.toISOString(), expiresAt: expires ? expires.toISOString() : null })
            .where(eq(subscriptions.id, sub.id));
          const planDb = sub.planId === "sekolah" ? "premium" : planDef?.name === "Premium" ? "premium" : "pro";
          await db
            .update(users)
            .set({ plan: planDb, planExpires: expires ? expires.toISOString() : null })
            .where(eq(users.id, user.userId));

          if (user.whatsapp) {
            const planDef = PLANS[sub.planId];
            const invoiceInfo = {
              paymentId: id,
              planName: planDef?.name ?? "Premium",
              duration: planDef?.tagline ?? "6 bulan",
              amount: user.amount,
              bankName: "BRI",
              bankAccountNumber: "",
              bankAccountName: "Jurnal Guru",
              date: new Date().toLocaleString("id-ID", { dateStyle: "long" }),
            };
            await sendWaNotification(user.whatsapp, invoiceWaText(invoiceInfo, "paid"));
            const buyer = await db
              .select({ email: users.email })
              .from(users)
              .where(eq(users.id, user.userId))
              .get();
            if (buyer?.email) {
              await sendInvoiceEmail(
                buyer.email,
                `Invoice Lunas ${planDef?.name ?? "Premium"} — Jurnal Guru (${invoiceNumber(id)})`,
                invoiceHtml(invoiceInfo, "paid")
              );
            }
          }
        }
      }

      if (verified) {
        await trackEvent("payment_approved", {
          userId: user.userId,
          meta: { paymentId: id },
        });
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