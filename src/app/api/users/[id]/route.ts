import { requireAdmin, AuthError, hashPassword, addLog } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { resolveUserRole } from "@/lib/plan-helpers";
import { validatePasswordForCreation } from "@/lib/password-policy";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { namaLengkap, role, password } = body;

    const existing = await db.select().from(users).where(eq(users.id, id)).get();
    if (!existing) {
      return apiError("User tidak ditemukan", 404);
    }

    const updates: Record<string, unknown> = {};
    if (namaLengkap) updates.namaLengkap = namaLengkap;
    if (role) {
      const resolved = resolveUserRole(role);
      updates.role = resolved.role;
      if (resolved.plan) updates.plan = resolved.plan;
    }
    if (password) {
      const passwordError = validatePasswordForCreation(password);
      if (passwordError) return apiError(passwordError);
      updates.passwordHash = await hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
      return apiError("Tidak ada data yang diubah");
    }

    await db.update(users).set(updates).where(eq(users.id, id));
    await addLog(session.id, "UPDATE_USER", `Update user ${existing.username}`);
    return apiOk(null, "User berhasil diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.id) {
      return apiError("Tidak bisa menghapus akun sendiri", 400);
    }

    const existing = await db.select().from(users).where(eq(users.id, id)).get();
    if (!existing) {
      return apiError("User tidak ditemukan", 404);
    }

    await db.delete(users).where(eq(users.id, id));
    await addLog(session.id, "DELETE_USER", `Hapus user ${existing.username}`);
    return apiOk(null, "User berhasil dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
