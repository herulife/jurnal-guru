import { db } from "@/db";
import { sql } from "drizzle-orm";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import StatusCopyButton from "@/components/StatusCopyButton";

export const dynamic = "force-dynamic";

const TABLE_NAME = /^[a-z][a-z0-9_]*$/;

function countSkills(dir: string): number {
  try {
    return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory()).length;
  } catch {
    return 0;
  }
}

function opencodeInfo(): { version: string; multiAgent: string; skills: string } {
  let version = "—";
  try {
    version = execSync("opencode --version", { timeout: 8000 }).toString().trim();
  } catch {
    version = "—";
  }
  const cfgDir = path.join(os.homedir(), ".config", "opencode");
  const projectDir = path.join(process.cwd(), ".opencode");
  const hasAgentDir = fs.existsSync(path.join(cfgDir, "agent"));
  const cfg = ["opencode.json", "opencode.jsonc", path.join(projectDir, "opencode.json")].some((f) =>
    fs.existsSync(f)
  );
  let hasAgentKey = false;
  for (const f of ["opencode.json", "opencode.jsonc", path.join(projectDir, "opencode.json")]) {
    try {
      const raw = fs.readFileSync(f, "utf8");
      if (raw.includes('"agent"') || raw.includes('"agents"')) hasAgentKey = true;
    } catch {
      // file tidak ada — lewati
    }
  }
  const globalSkills = countSkills(path.join(cfgDir, "skills"));
  const projectSkills = countSkills(path.join(projectDir, "skills"));
  const multiAgent =
    hasAgentDir || hasAgentKey
      ? "KONFIGURASI ADA"
      : `NOT CONFIGURED (subagent bawaan: explore, general)${cfg ? "" : ""}`;
  return { version, multiAgent, skills: `${globalSkills} global + ${projectSkills} project` };
}

export default async function StatusPage() {
  let git: string = "";
  try {
    git = execSync("git log --oneline -1", { cwd: process.cwd() }).toString().trim();
  } catch {
    git = "—";
  }

  let dbOk = false;
  let tables: string[] = [];
  let counts: Record<string, number> = {};
  let dbError = "";
  try {
    const tablesRes = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );
    tables = (tablesRes as { name: string }[]).map((r) => r.name);
    for (const t of tables) {
      if (!TABLE_NAME.test(t)) continue;
      try {
        const c = await db.all(sql.raw(`SELECT COUNT(*) AS c FROM ${t}`));
        counts[t] = Number((c as { c: number }[])[0]?.c || 0);
      } catch {
        counts[t] = -1;
      }
    }
    dbOk = true;
  } catch (e) {
    dbError = String(e).slice(0, 160);
  }

  const generated = new Date().toISOString();
  const oc = opencodeInfo();

  const statusText = [
    "STATUS APLIKASI — JURNAL GURU",
    `Generated: ${generated}`,
    `Server: ${dbOk ? "OK — VPS (pm2, port 3000, Cloudflare Tunnel)" : "ERROR"}`,
    `Database: ${dbOk ? `OK — SQLite (${tables.length} tabel, file:./data.db)` : `GAGAL — ${dbError}`}`,
    `Deployment: ${git}`,
    "Record per tabel:",
    ...(dbOk
      ? tables.map((t) => `- ${t}: ${counts[t]}`)
      : ["- (tidak tersedia)"]),
    "",
    "OPENCODE:",
    `Versi: ${oc.version}`,
    `Multi-Agent: ${oc.multiAgent}`,
    `Skills: ${oc.skills}`,
    "",
    "Audit lengkap: https://guru.cintabuku.site/documentation",
  ].join("\n");

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332]">Status Center</h1>
            <p className="text-sm text-gray-500">
              Status aplikasi Jurnal Guru — {generated}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusCopyButton text={statusText} />
            <a
              href="/documentation"
              className="btn btn-outline text-sm"
              style={{ color: "#0D7C66" }}
            >
              <i className="fa-solid fa-book mr-2" />
              Application Audit
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-5">
            <div className="text-sm text-gray-500 mb-1">Server</div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: dbOk ? "#22c55e" : "#ef4444" }}
              />
              <span className="font-semibold text-[#1A2332]">
                {dbOk ? "OK — VPS (pm2, port 3000)" : "ERROR"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Cloudflare Tunnel → localhost:3000</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-500 mb-1">Database</div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: dbOk ? "#22c55e" : "#ef4444" }}
              />
              <span className="font-semibold text-[#1A2332]">
                {dbOk ? `${tables.length} tabel SQLite` : "GAGAL"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">file:./data.db (lokal VPS)</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-500 mb-1">Deployment</div>
            <div className="font-semibold text-[#1A2332] truncate">{git}</div>
            <div className="text-xs text-gray-400 mt-1">next build + pm2 restart</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-500 mb-1">OpenCode</div>
            <div className="font-semibold text-[#1A2332]">v{oc.version}</div>
            <div className="text-xs text-gray-400 mt-1 break-words">
              Multi-Agent: {oc.multiAgent} · Skills: {oc.skills}
            </div>
            <a
              href="/status/opencode"
              className="text-xs font-medium mt-2 inline-block"
              style={{ color: "#0D7C66" }}
            >
              Laporan lengkap →
            </a>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold text-[#1A2332] mb-3">
            Jumlah record per tabel
          </div>
          {dbOk ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tables.map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-3 py-2 text-sm"
                >
                  <span className="text-gray-600 truncate">{t}</span>
                  <span className="font-semibold text-[#0D7C66] ml-2">{counts[t]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-red-500">{dbError || "Database tidak terhubung"}</div>
          )}
        </div>
      </div>
    </div>
  );
}