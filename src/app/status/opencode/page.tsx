import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import StatusCopyButton from "@/components/StatusCopyButton";

export const dynamic = "force-dynamic";

function countSkills(dir: string): number {
  try {
    return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory()).length;
  } catch {
    return 0;
  }
}

function buildReport(): { version: string; report: string } {
  let version = "—";
  try {
    version = execSync("opencode --version", { timeout: 8000 }).toString().trim();
  } catch {
    version = "—";
  }

  const home = os.homedir();
  const cfgDir = path.join(home, ".config", "opencode");
  const projDir = process.cwd();
  const cfgFiles = [
    path.join(cfgDir, "opencode.json"),
    path.join(cfgDir, "opencode.jsonc"),
    path.join(projDir, "opencode.json"),
  ];
  const hasAgentDir = fs.existsSync(path.join(cfgDir, "agent"));
  const hasCommandDir = fs.existsSync(path.join(cfgDir, "command"));
  const hasPluginDir = fs.existsSync(path.join(cfgDir, "plugin"));
  let hasAgentKey = false;
  for (const f of cfgFiles) {
    try {
      if (fs.readFileSync(f, "utf8").includes('"agent"')) hasAgentKey = true;
    } catch {
      // file tidak ada — lewati
    }
  }
  const globalSkills = countSkills(path.join(cfgDir, "skills"));
  const projectSkills = countSkills(path.join(projDir, ".opencode", "skills"));

  const report = [
    "# OPENCode MULTI-AGENT STATUS",
    "",
    `OpenCode Version: ${version}`,
    "",
    "Multi-Agent: NO — belum ada konfigurasi agent kustom (kapabilitas bawaan tersedia, lihat Capabilities)",
    "",
    "Existing Agents:",
    "- explore — pencarian/pemahaman codebase (read-only)",
    "- general — eksekusi tugas multi-langkah umum",
    "(keduanya built-in OpenCode, BUKAN konfigurasi)",
    "",
    "Orchestrator: Tidak dikonfigurasi — sesi utama (agent utama) bertindak sebagai orchestrator via Task tool (bawaan runtime)",
    "",
    "Agent Delegation: Ya (bawaan) — agent utama dapat mendelegasikan ke explore/general, termasuk resume sesi subagent (task_id). Tidak ada delegasi antar-agent kustom.",
    "",
    "Parallel Agents: Ya (bawaan) — beberapa subagent dapat dijalankan paralel dalam satu pesan (multiple tool calls)",
    "",
    "Agent Permissions: Tidak ada permission per-agent — semua mengikuti permission global OpenCode (konfirmasi command, area /tmp/opencode diizinkan)",
    "",
    "Agent Communication: Tidak ada sistem komunikasi antar-agent kustom — hasil subagent dikembalikan sebagai pesan tunggal ke agent utama; shared state hanya via resume task_id",
    "",
    "Agent Configuration Files:",
    `- ${cfgDir}/opencode.json — instructions: [AGENTS.md]`,
    `- ${cfgDir}/opencode.jsonc — duplikat instructions`,
    `- ${projDir}/opencode.json — instructions + MCP playwright + provider openrouter`,
    `- ${cfgDir}/AGENTS.md — instruksi konteks global`,
    `- ${projDir}/AGENTS.md — instruksi konteks project`,
    `- ${projDir}/.agents/ — dokumentasi proyek (BUKAN konfigurasi agent)`,
    `- skills/ — ${globalSkills} global + ${projectSkills} project (instruksi kerja, bukan agent)`,
    `- Agent dir: ${hasAgentDir ? "ADA" : "TIDAK ADA"} | Command dir: ${hasCommandDir ? "ADA" : "TIDAK ADA"} | Plugin dir: ${hasPluginDir ? "ADA" : "TIDAK ADA"} | Key \"agent\" di config: ${hasAgentKey ? "ADA" : "TIDAK ADA"}`,
    "",
    "Current Agent Activity: Sesi ini berjalan dengan agent utama (default) tanpa subagent aktif; 2 skill terkait tersedia sebagai panduan: dispatching-parallel-agents, subagent-driven-development",
    "",
    "Missing Components: Definisi agent kustom (nama/role/permission), orchestrator eksplisit, komunikasi antar-agent, reporting pipeline",
    "",
    "Capabilities (OpenCode built-in):",
    "- Task tool dengan 2 subagent bawaan: explore & general",
    "- Delegasi dan resume sesi subagent (task_id)",
    "- Eksekusi paralel (multiple tool calls dalam satu pesan)",
    "- Permission global (bukan per-agent)",
    "",
    "FINAL STATUS: MULTI-AGENT: NOT CONFIGURED — kapabilitas bawaan (Task tool + subagent explore/general, paralel, delegasi) tersedia dan sudah dipakai di sesi-sesi sebelumnya, tetapi tidak ada sistem multi-agent yang dikonfigurasi secara eksplisit.",
  ].join("\n");

  return { version, report };
}

export default function OpenCodeStatusPage() {
  const { version, report } = buildReport();

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332]">
              OpenCode Multi-Agent Status
            </h1>
            <p className="text-sm text-gray-500">
              OpenCode v{version} · laporan kondisi aktual, siap copy
            </p>
          </div>
          <div className="flex gap-2">
            <StatusCopyButton text={report} />
            <a href="/status" className="btn btn-outline text-sm" style={{ color: "#0D7C66" }}>
              <i className="fa-solid fa-heart-pulse mr-2" />
              Status Center
            </a>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div className="text-sm font-semibold text-[#1A2332] mb-2">
            Ringkasan cepat
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="text-gray-500 text-xs">Versi</div>
              <div className="font-semibold text-[#1A2332]">{version}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="text-gray-500 text-xs">Multi-Agent</div>
              <div className="font-semibold text-[#E8A317]">NOT CONFIGURED</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="text-gray-500 text-xs">Subagent bawaan</div>
              <div className="font-semibold text-[#1A2332]">explore, general</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="text-gray-500 text-xs">Paralel</div>
              <div className="font-semibold text-[#0D7C66]">Tersedia (bawaan)</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <pre
            className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#1A2332] bg-white rounded-lg border border-gray-100 p-4 overflow-x-auto"
            style={{ maxHeight: "65vh" }}
          >
            {report}
          </pre>
        </div>
      </div>
    </div>
  );
}