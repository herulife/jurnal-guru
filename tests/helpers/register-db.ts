import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";

export const DB_PATH = "file:./tests/.tmp/reg.db";

export const db = createClient({ url: DB_PATH });

export async function q(sql: string, args: unknown[] = []) {
  const r = await db.execute({ sql, args: args as never });
  return r.rows;
}

export async function getRow(table: string, column: string, value: unknown) {
  const rows = await q(
    `SELECT * FROM ${table} WHERE ${column} = ? LIMIT 1`,
    [String(value)]
  );
  return rows[0] ?? null;
}

export async function countWhere(table: string, column: string, value: unknown) {
  const rows = await q(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column} = ?`, [String(value)]);
  return Number(rows[0]?.n ?? 0);
}

export async function tableCount(table: string) {
  const rows = await q(`SELECT COUNT(*) AS n FROM ${table}`);
  return Number(rows[0]?.n ?? 0);
}

export function sha256hex(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

const MOCK_BASE = "http://localhost:3199";

export async function mockEmailReset() {
  await fetch(`${MOCK_BASE}/reset`);
}

export async function mockEmailSetFail(fail: boolean) {
  await fetch(`${MOCK_BASE}/set?fail=${fail ? 1 : 0}`);
}

export async function mockEmailLast() {
  const res = await fetch(`${MOCK_BASE}/last`);
  return res.json();
}

export function extractTokenFromEmail(html: string): string | null {
  const m = html.match(/verify-email\?token=([0-9a-f]+)/);
  return m ? m[1] : null;
}