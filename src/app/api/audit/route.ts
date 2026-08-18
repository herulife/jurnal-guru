import fs from "fs";
import path from "path";
import { requireAdmin, AuthError } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/utils";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const REPO = "herulife/jurnal-guru";

type Meta = {
  project: Record<string, string>;
  phases: { id: string; name: string; status: string; progress: number; notes?: string }[];
  features: Record<string, unknown>[];
  agents: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  activity_log: Record<string, unknown>[];
  test_status: Record<string, { status: string; last_run?: string | null; detail?: string }>;
  security: Record<string, { status: string; detail?: string }>;
  blockers: Record<string, unknown>[];
  next_action: Record<string, string>;
};

function loadMeta(): Meta | null {
  try {
    const p = path.join(process.cwd(), ".agents", "audit-center.json");
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

async function gitInfo() {
  const currentSha = process.env.VERCEL_GIT_COMMIT_SHA || "";
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "main";
  let commits: { sha: string; message: string; date: string; author: string }[] = [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=10`, {
      headers: { "User-Agent": "jurnal-guru-audit", Accept: "application/vnd.github+json" },
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (res.ok) {
      const list = (await res.json()) as {
        sha: string;
        commit: { message: string; author: { name: string }; committer: { date: string } };
      }[];
      commits = list.map((c) => ({
        sha: c.sha.slice(0, 7),
        message: (c.commit?.message || "").split("\n")[0],
        date: c.commit?.committer?.date || "",
        author: c.commit?.author?.name || "",
      }));
    }
  } catch {
    // GitHub tidak terjangkau — pakai SHA dari env build
  }
  return { branch, current_sha: currentSha, commits };
}

const TABLE_NAME = /^[a-z][a-z0-9_]*$/;

async function dbInfo() {
  try {
    const tablesRes = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`);
    const tables = (tablesRes as { name: string }[]).map((r) => r.name);
    const counts: Record<string, number> = {};
    for (const t of tables) {
      if (!t.startsWith("marketing_") || !TABLE_NAME.test(t)) continue;
      try {
        const c = await db.all(sql.raw(`SELECT COUNT(*) AS c FROM ${t}`));
        counts[t] = Number((c as { c: number }[])[0]?.c || 0);
      } catch {
        counts[t] = -1;
      }
    }
    return { tables, counts };
  } catch (e) {
    return { tables: [], counts: {}, error: String(e).slice(0, 120) };
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const meta = loadMeta();
    const [git, dbi] = await Promise.all([gitInfo(), dbInfo()]);
    return apiOk({
      meta,
      git,
      db: dbi,
      generated_at: new Date().toISOString(),
      source: "reconciliation: metadata file + GitHub API + sqlite_master",
    });
  } catch (e) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiError("Gagal memuat audit center", 500);
  }
}
