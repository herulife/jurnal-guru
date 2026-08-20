import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiServerError } from "@/lib/utils";
import { addLog } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site";

    if (!token) {
      return Response.redirect(`${base}/login?verify=fail`, 302);
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.verifyToken, token))
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

    await db
      .update(users)
      .set({ emailVerified: 1, verifyToken: null, verifyTokenExpires: null })
      .where(eq(users.id, user.id));

    await addLog(user.id, "VERIFY_EMAIL", `${user.email} mengkonfirmasi email`);

    return Response.redirect(`${base}/login?activated=1`, 302);
  } catch (e: unknown) {
    console.error("[VERIFY ERROR]", e);
    return apiServerError();
  }
}