import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = [".jpg", ".jpeg", ".png", ".pdf"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const row = await db.select().from(payments).where(eq(payments.id, id)).get();
    if (!row) return apiError("Pembayaran tidak ditemukan", 404);
    if (row.userId !== session.id) {
      await requireAdmin();
    }
    if (row.status !== "pending") {
      return apiError("Pembayaran sudah diproses", 400);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("File bukti wajib diunggah");
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED.includes(ext)) return apiError("Format harus JPG / PNG / PDF");
    if (file.size > MAX_BYTES) return apiError("Ukuran file maksimal 5 MB");
    const bytes = Buffer.from(await file.arrayBuffer());

    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    const filename = `payment-${id.slice(0, 8)}-${uuidv4().slice(0, 8)}${ext}`;
    fs.writeFileSync(path.join(dir, filename), bytes);

    await db
      .update(payments)
      .set({ proofUrl: `/uploads/${filename}` })
      .where(eq(payments.id, id));

    await addLog(session.id, "UPLOAD_PROOF", `Bukti pembayaran ${id.slice(0, 8)}`);
    await trackEvent("payment_proof_submitted", {
      userId: session.id,
      meta: { paymentId: id },
    });
    return apiOk({ proofUrl: `/uploads/${filename}` }, "Bukti pembayaran dikirim");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}