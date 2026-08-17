import { requireAdmin, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingJournal } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const url = new URL(req.url);
    const filterDate = url.searchParams.get("date");

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) conditions.push(eq(marketingJournal.userId, scope));
    if (filterDate) conditions.push(eq(marketingJournal.date, filterDate));

    const rows = await db
      .select()
      .from(marketingJournal)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketingJournal.date))
      .all();

    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    if (!body.date) {
      return apiError("Tanggal wajib diisi");
    }
    const id = uuidv4();
    await db.insert(marketingJournal).values({
      id,
      userId: session.id,
      date: body.date,
      target: body.target || null,
      activities: body.activities || null,
      result: body.result || null,
      problems: body.problems || null,
      learning: body.learning || null,
      nextAction: body.nextAction || null,
    });
    await addLog(session.id, "CREATE_JOURNAL", `Tambah marketing journal ${body.date}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}