import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { activityLog } from "@/db/schema";
import { isAdminRole } from "@/lib/plan-helpers";

export { isAdminRole };

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const SECRET = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "session";

export type SessionUser = {
  id: string;
  username: string;
  role: string;
  nama: string;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (!isAdminRole(session.role)) {
    throw new AuthError("Forbidden: Admin only", 403);
  }
  return session;
}

export function scopeUserId(role: string, userId: string): string | null {
  return isAdminRole(role) ? null : userId;
}

export class AuthError extends Error {
  status: number;
  constructor(msg: string, status = 401) {
    super(msg);
    this.status = status;
  }
}

export async function verifyCredentials(identifier: string, password: string) {
  const bcrypt = await import("bcryptjs");
  const user = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, identifier.toLowerCase().trim()),
        eq(users.username, identifier.trim())
      )
    )
    .get();
  if (!user) {
    await bcrypt.compare(password, "$2a$10$7QBy6m6Y1c0wU8kZzD9k2eJkQyW1P6KX9wB0sVcYr0fGt1Hq4LmG");
    return null;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    nama: user.namaLengkap,
  };
}

export async function hashPassword(password: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

export async function addLog(
  userId: string,
  action: string,
  description: string
) {
  try {
    await db.insert(activityLog).values({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      description,
    });
  } catch (e: unknown) {
    console.error("Failed to write activity log:", e);
  }
}
