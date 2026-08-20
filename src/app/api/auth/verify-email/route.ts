import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { apiServerError } from "@/lib/utils";
import { addLog } from "@/lib/auth";
import { hashToken } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site";

    if (!token) {
      return Response.redirect(`${base}/login?verify=fail`, 302);
    }

    // Token baru disimpan sebagai SHA-256 hash; token lama (legacy) masih plaintext.
    const hash = hashToken(token);

    const user = await db
      .select()
      .from(users)
      .where(or(eq(users.verifyTokenHash, hash), eq(users.verifyToken, token)))
      .get();

    if (!user) {
      return Response.redirect(`${base}/login?verify=invalid`, 302);
    }

    const expired =
      user.verifyTokenExpires && new Date(user.verifyTokenExpires).getTime() < Date.now();

    if (expired) {
      return Response.redirect(`${base}/login?verify=expired`, 302);
    }

    if (user.emailVerified === 1) {
      return Response.redirect(`${base}/login?activated=1`, 302);
    }

    // Update atomik bersyarat: hanya bertransisi jika belum terverifikasi.
    // Menjamin token hanya bisa dipakai sekali (replay / concurrent = satu sukses).
    const updated = await db
      .update(users)
      .set({ emailVerified: 1, verifyTokenHash: null, verifyToken: null })
      .where(and(eq(users.id, user.id), eq(users.emailVerified, 0)))
      .run();

    if (updated.rowsAffected === 1) {
      await addLog(user.id, "VERIFY_EMAIL", `${user.email} mengkonfirmasi email`);
    }

    return Response.redirect(`${base}/login?activated=1`, 302);
  } catch (e: unknown) {
    console.error("[VERIFY ERROR]", e);
    return apiServerError();
  }
}