import type { SessionUser } from "@/lib/auth";

/**
 * Admin melihat semua data; guru hanya melihat data miliknya sendiri.
 * Mengembalikan true bila sess harus dibatasi ke user sendiri.
 */
export function isAdminRole(session: SessionUser | { role: string }): boolean {
  return session.role.toLowerCase() === "admin";
}

/**
 * ownerId yang digunakan untuk menandai baris baru milik user.
 */
export function ownerOf(session: SessionUser): string {
  return session.id;
}

/**
 * Kondisi scope: untuk non-admin kembalikan SQL `eq(table.ownerId, session.id)`.
 * Karena bisa dipakai lintas tabel dinamis, disini hanya helper sederhana.
 * Sebenarnya filter diterapkan manual di tiap route via `isAdminRole`.
 */