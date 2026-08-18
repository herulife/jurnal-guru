import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import ReportTabs from "@/components/ReportTabs";

export const dynamic = "force-dynamic";

const ARCH_REPORT = `# MARKETINGOS MULTI-AGENT ARCHITECTURE

## Current OpenCode Capability

OpenCode 1.18.18 menyediakan:
- Task tool dengan 2 subagent built-in: explore (read-only, pemahaman codebase) dan general (eksekusi tugas multi-langkah)
- Delegation dari agent utama + resume sesi via task_id
- Parallel execution (beberapa subagent dalam satu pesan)
- TIDAK ada message bus / shared memory antar-agent - satu-satunya saluran hasil adalah pesan tunggal kembali ke agent utama
- Custom agent definition (agent key di opencode.json) secara teknis didukung, tetapi di versi 1.18.18 perilakunya lebih terbatas dibanding mekanisme brief file; dan project ini satu repo, satu pengembang - kompleksitas custom agent tidak terbayar sekarang

Konsekuensi desain: arsitektur harus file-state based + orchestrator-centric, bukan network/message based.

## Recommended Agents

| Agent | Purpose | Required? | Phase |
|---|---|---|---|
| ORCHESTRATOR | Agent utama (sudah ada) | YES - sudah aktif | semua |
| explore | Riset codebase, audit, mapping | YES (built-in) | semua |
| general (per-task brief) | Eksekutor domain dgn brief file | YES (built-in) | semua |
| CORE DEV (DB + API) | schema, migration, API, validation | YES - agent pertama | 1 |
| FRONTEND | pages, komponen, UI, forms, charts | YES (task-brief) | 1 |
| MARKETING FEATURES (CRM/Campaign) | fitur domain per fase | Dibuat per fase via brief | 2-3 |
| ANALYTICS & REPORTS | KPI, funnel, ROI, reports | Dibuat saat fase 4 | 4 |
| AI FEATURES | AI assistant, briefing, generator | Dibuat saat fase 5 | 5 |
| ARCHITECT | - | TIDAK PERLU - peran dipegang orchestrator + dokumen arsitektur | - |
| DATABASE (terpisah) | - | GABUNG ke CORE DEV (satu sumber: schema.ts) | - |
| QA | - | KOMBINASI: subagent general + skill Playwright per task, review penuh sebelum merge | - |
| SECURITY | - | BUKAN agent permanen - dipanggil on-demand sebagai subagent read-only | on-demand |
| DOCUMENTATION | - | GABUNG - setiap agent wajib update .agents/*.md; orchestrator finalisasi | - |

Total agent kustom yang perlu: 1 (CORE DEV). Sisanya = built-in + brief file.

## Agent Responsibilities

ORCHESTRATOR (agent utama): membaca ROADMAP, memilih subagent, menetapkan task di PROJECT_STATUS.md (claimed/done/blocked), mencegah duplikasi, memvalidasi hasil, meminta QA & Security, memperbarui status + audit-center.json, menentukan NEXT ACTION.

CORE DEV (subagent general + brief briefs/core-dev.md): schema (src/db/schema.ts), migrasi (drizzle-kit push), API routes, validation, authorization, ownership scoping.

FRONTEND (subagent general + brief briefs/frontend.md): halaman, komponen, forms, charts - hanya mengonsumsi API contract dari API.md, tidak mengubah schema/API.

MARKETING/ANALYTICS/AI (subagent general + brief per fase): fitur domain sesuai roadmap; mengikuti pola API + schema yang sudah ada.

## Agent Boundaries

CORE DEV
- NAME: core-dev
- ROLE: Pemilik data & API
- RESPONSIBILITY: schema.ts, drizzle migrations, semua src/app/api/**, validasi, authz
- ALLOWED AREAS: src/db/, src/app/api/, src/lib/ (auth, utils)
- READ AREAS: seluruh repo
- DO NOT TOUCH: src/components/, halaman src/app/(app)/** (kecuali server components API-only), .agents/ (kecuali catatan DB/API), isi data.db
- INPUT: task dari PROJECT_STATUS.md + brief
- OUTPUT: kode + update DATABASE.md, API.md, laporan singkat ke orchestrator
- DEPENDENCIES: tidak ada (jalur pertama)

FRONTEND
- NAME: frontend
- ROLE: Pemilik UI
- RESPONSIBILITY: halaman, komponen, interaksi, forms (hanya client-side)
- ALLOWED AREAS: src/components/, src/app/(app)/** (tampilan)
- READ AREAS: seluruh repo + API.md + schema.ts (read-only)
- DO NOT TOUCH: src/db/schema.ts, src/app/api/**, src/lib/auth*, .agents/
- INPUT: task + API contract
- OUTPUT: kode + update PROJECT_STATUS + laporan
- DEPENDENCIES: API contract dari CORE DEV (API.md)

MARKETING/ANALYTICS/AI agents: aturan sama - backend-adjacent (API+DB) -> CORE DEV; UI -> FRONTEND. Agent fase ini hanya mengerjakan layer yang ditugaskan orchestrator, tidak pernah menyentuh area milik agent lain.

## Orchestrator Workflow

1. Baca ROADMAP -> pilih task berikutnya -> tandai CLAIMED di PROJECT_STATUS.md
2. Pilih subagent sesuai domain (built-in general + brief)
3. Subagent bekerja -> mengembalikan hasil (1 pesan) + update file status yang diizinkan
4. Orchestrator verifikasi (baca diff, cek file ownership, run lint/build bila perlu)
5. QA task: subagent general + Playwright skill (hanya utk task ber-UI)
6. SECURITY: dipanggil hanya jika task menyentuh auth/authorization/payment/upload/input eksternal
7. Commit terpisah per task -> update audit-center.json (activity_log + status) -> NEXT ACTION

Kecocokan dengan Task tool 1.18.18: cocok - workflow ini persis satu-orchestrator-multi-subagent yang didukung Task tool. Resume via task_id dipakai utk iterasi QA.

## Parallelization Strategy

PHASE 0 (paralel, read-only, AMAN):
  explore (audit) | explore (arsitektur) | explore (inventaris API/DB)

PHASE 1 (serial inti, paralel di samping):
  CORE DEV (schema+migration)
     |
     +-> FRONTEND (mulai saat API.md selesai)
  DOCUMENTATION (update .agents/*.md) -- PARALEL dengan CORE DEV
     |
  QA (setelah FRONTEND selesai) -> SECURITY (on-demand)

Aturan paralel:
- AMAN paralel: explore read-only; dokumentasi vs coding; FRONTEND vs CORE DEV (setelah contract ditulis); fitur di file disjoint
- TIDAK AMAN paralel: dua agent menyentuh schema.ts/migration; dua agent mengedit file yang sama; FRONTEND sebelum API.md final; CORE DEV vs agent lain di src/app/api/**

## Communication Strategy

Tanpa message bus, gunakan file board + handoff:
1. PROJECT_STATUS.md = single source of truth - orchestrator menulis CLAIMED/DONE/BLOCKED sebelum/sesudah setiap subagent; subagent hanya menulis "selesai + ringkasan" di bagian yang diizinkan
2. Task handoff = konten file + prompt resume (task_id): "Lanjutkan: perbaiki kegagalan berikut"
3. Contract handoff = API.md (backend->frontend), DATABASE.md (semua), ARCHITECTURE.md (semua)
4. Setiap hasil subagent disampaikan ke orchestrator dalam 1 pesan terstruktur: file diubah, tes, status, blocker

## Shared Project State

Diperlukan (hanya 4 file inti, jangan lebih):
| File | Isi | Diupdate oleh |
| .agents/PROJECT_STATUS.md | phase, task list + status, file ownership map, next action | ORCHESTRATOR (wajib) |
| .agents/ARCHITECTURE.md | keputusan arsitektur, pola, struktur folder | ORCHESTRATOR/CORE DEV |
| .agents/DATABASE.md | skema aktual, relasi, catatan migrasi | CORE DEV |
| .agents/API.md | contract API: method, path, request/response, auth | CORE DEV |
| AGENTS.md | aturan kerja (bukan state): ownership, larangan, workflow | ORCHESTRATOR |

ROADMAP digabung ke PROJECT_STATUS.md (bagian Roadmap). Aturan: agent yang mengubah kode WAJIB mengubah dokumen terkait dalam commit yang sama.

## Audit Center Integration

Audit Center sudah membaca .agents/audit-center.json (phases, tasks, activity_log, blockers, next_action). Alur laporan:
1. Subagent selesai -> ringkasan 1-3 baris ke orchestrator
2. Orchestrator meng-update audit-center.json: activity_log (agent, action, timestamp), task status per phase, blockers, next_action
3. Halaman /documentation (admin) + /status (publik) otomatis menampilkan - tanpa perubahan kode
Opsional (fase 2): tambah field ownership per task di JSON agar terlihat "siapa mengerjakan apa".

## Conflict Prevention

1. File ownership map di PROJECT_STATUS.md: setiap path -> satu owner
2. Satu task = satu commit = satu owner; paralel hanya untuk file disjoint
3. Migration: hanya CORE DEV yang menjalankan drizzle-kit push; tidak pernah dua migrasi bersamaan (lock: orchestrator menandai MIGRATING di status)
4. Contract-first: API.md ditulis SEBELUM FRONTEND mulai; FRONTEND dilarang mengubah contract; perubahan contract = task CORE DEV baru + notifikasi FRONTEND
5. Duplicate prevention: orchestrator selalu cek PROJECT_STATUS (claimed list) + grep task serupa sebelum deploy subagent
6. Domain violation: setiap subagent diberi DO NOT TOUCH eksplisit; orchestrator menolak hasil yang menyentuh area asing

## Recommended File Structure

.agents/
+-- PROJECT_STATUS.md      # status, roadmap, task, ownership, next action
+-- ARCHITECTURE.md        # keputusan arsitektur
+-- DATABASE.md            # skema aktual
+-- API.md                 # contract API
+-- briefs/
|   +-- core-dev.md        # prompt standar utk subagent CORE DEV
|   +-- frontend.md        # prompt standar utk subagent FRONTEND
|   +-- feature.md         # template utk agent per fase (CRM, campaign, dsb)
+-- audit-center.json      # sudah ada - dipakai sbg laporan
+-- audits/                # sudah ada

Konfigurasi OpenCode 1.18.18 yang benar: TIDAK perlu custom agent config dulu. opencode.json tetap hanya instructions + MCP. Custom agent (agent key) ditunda sampai 2 kondisi terpenuhi: brief file terbukti kurang (banyak prompt berulang) DAN verifikasi dukungan agent config di versi 1.18.18 sudah dilakukan di lingkungan uji.

## Recommended Implementation Order

1. Buat .agents/PROJECT_STATUS.md + briefs/ (3 file kecil) - 1 komit
2. Update AGENTS.md: ownership map + workflow orchestrator
3. Uji 1 siklus paralel: 2 subagent general (masing-masing 1 task kecil di file disjoint) - validasi komunikasi & QA loop
4. Phase 1: CORE DEV (schema CRM-ready) -> API.md -> FRONTEND
5. Per fase berikutnya: buat brief baru, bukan agent baru
6. Evaluasi custom agent hanya setelah 2+ fase berjalan

## Risks

1. File state basi - agent lupa update PROJECT_STATUS -> mitigasi: aturan "commit + update status wajib", orchestrator cek saat resume
2. Paralel menyentuh file sama - mitigasi: ownership map + lock per task
3. Contract drift - FRONTEND menunggu API.md; perubahan contract = task baru, bukan edit diam-diam
4. QA subjektif - mitigasi: QA pakai Playwright test nyata, bukan opini
5. Over-engineering - risiko terbesar: membuat 12 agent kustom. Dihindari dengan desain ini.

## FINAL RECOMMENDATION

1. Agent yang perlu dibuat SEKARANG: TIDAK ADA agent kustom. Mulai dengan orkestrasi via built-in explore/general + brief files. Jika setelah 1-2 fase prompt berulang menjadi gangguan, buat satu agent kustom: CORE DEV (data + API).
2. Belum perlu: ARCHITECT, DATABASE terpisah, QA, SECURITY, DOCUMENTATION sebagai agent; CRM/CAMPAIGN/ANALYTICS/AI dibuat per fase sebagai brief, bukan agent permanen.
3. explore/general: TETAP dipakai sebagai primitif eksekusi semua agent - termasuk agent kustom nanti.
4. Struktur konfigurasi: cukup 4 file state (PROJECT_STATUS, ARCHITECTURE, DATABASE, API) + 3 brief + AGENTS.md. Tanpa perubahan opencode.json.
5. Langkah berikutnya (setelah desain disetujui): buat .agents/PROJECT_STATUS.md (roadmap 6 fase + ownership map) dan briefs/core-dev.md + briefs/frontend.md, lalu uji satu siklus orkestrasi paralel kecil.
`;

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
  let orchReport = "";
  try {
    orchReport = fs.readFileSync(path.join(process.cwd(), ".agents", "ORCHESTRATOR.md"), "utf8");
  } catch {
    orchReport = "# MARKETINGOS AUTONOMOUS ORCHESTRATOR\n\n(Dokumen .agents/ORCHESTRATOR.md tidak ditemukan)";
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="mx-auto max-w-4xl">
        <ReportTabs
          version={version}
          statusReport={report}
          archReport={ARCH_REPORT}
          orchReport={orchReport}
        />
      </div>
    </div>
  );
}