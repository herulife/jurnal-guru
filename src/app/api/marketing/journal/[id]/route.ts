import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingJournal } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

function journalWhere(id: string, scope: string | null) {
  return scope
    ? and(eq(marketingJournal.id, id), eq(marketingJournal.userId, scope))
    : eq(marketingJournal.id, id);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const { id } = await params;
    const body = await req.json();

    const existing = await db
      .select()
      .from(marketingJournal)
      .where(journalWhere(id, scope))
      .get();
    if (!existing) return apiError("Journal tidak ditemukan", 404);

    if (body.date !== undefined && !String(body.date).trim()) {
      return apiError("Tanggal wajib diisi");
    }

    const fields = [
      "date",
      "target",
      "activities",
      "result",
      "problems",
      "learning",
      "nextAction",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    await db
      .update(marketingJournal)
      .set(updateData)
      .where(journalWhere(id, scope));
    await addLog(session.id, "UPDATE_JOURNAL", `Update marketing journal ${existing.date}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const { id } = await params;

    const existing = await db
      .select()
      .from(marketingJournal)
      .where(journalWhere(id, scope))
      .get();
    if (!existing) return apiError("Journal tidak ditemukan", 404);

    await db
      .delete(marketingJournal)
      .where(journalWhere(id, scope));
    await addLog(session.id, "DELETE_JOURNAL", `Hapus marketing journal ${existing.date}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}