import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { createClient } from "@libsql/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB?: import("drizzle-orm/d1").AnyD1Database;
  }
}

type AnyDb = LibSQLDatabase<typeof schema>;

let dbInstance: AnyDb | null = null;

function resolveDb(): AnyDb {
  if (dbInstance) return dbInstance;

  try {
    const { env } = getCloudflareContext();
    if (env.DB) {
      dbInstance = drizzleD1(env.DB, { schema }) as unknown as AnyDb;
      return dbInstance;
    }
  } catch {
    // not running inside Cloudflare context
  }

  const url = process.env.DATABASE_URL;
  if (url) {
    const client = createClient({ url });
    dbInstance = drizzleLibsql(client, { schema });
    return dbInstance;
  }

  const client = createClient({ url: "file:./data.db" });
  dbInstance = drizzleLibsql(client, { schema });
  return dbInstance;
}

export function getDb(): AnyDb {
  return resolveDb();
}

export const db: AnyDb = new Proxy({} as AnyDb, {
  get(_target, prop) {
    const instance = resolveDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(instance) : value;
  },
});
