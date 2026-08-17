"use client";

import { useEffect, useState } from "react";

type Payload = {
  ok: boolean;
  data?: Record<string, unknown>;
  msg?: string;
};

const BADGE: Record<string, string> = {
  COMPLETED: "bg-[#0D7C66]/10 text-[#0D7C66] border-[#0D7C66]/30",
  IN_PROGRESS: "bg-[#E8A317]/10 text-[#B8860B] border-[#E8A317]/40",
  NOT_STARTED: "bg-gray-100 text-gray-500 border-gray-200",
  SAFE: "bg-[#0D7C66]/10 text-[#0D7C66] border-[#0D7C66]/30",
  WARNING: "bg-red-50 text-red-600 border-red-200",
  PASS: "bg-[#0D7C66]/10 text-[#0D7C66] border-[#0D7C66]/30",
  FAIL: "bg-red-50 text-red-600 border-red-200",
  RUNNING: "bg-blue-50 text-blue-600 border-blue-200",
  ACTIVE: "bg-[#0D7C66]/10 text-[#0D7C66] border-[#0D7C66]/30",
  IDLE: "bg-gray-100 text-gray-500 border-gray-200",
};

function Badge({ status }: { status: string }) {
  const cls = BADGE[status] || BADGE.NOT_STARTED;
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text);
}

export default function AuditCenterView({ auditsMd }: { auditsMd: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  async function fetchAuditState(): Promise<{ ok: true; data: unknown } | { ok: false; msg: string }> {
    try {
      const res = await fetch("/api/audit", { cache: "no-store" });
      const json = (await res.json()) as Payload;
      if (!res.ok || !json.ok) return { ok: false, msg: json.msg || "Gagal memuat status proyek" };
      return { ok: true, data: json.data || {} };
    } catch {
      return { ok: false, msg: "Gagal terhubung ke server" };
    }
  }

  function applyResult(r: { ok: true; data: unknown } | { ok: false; msg: string }) {
    if (r.ok) setData(r.data as Record<string, unknown>);
    else setError(r.msg);
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      applyResult(await fetchAuditState());
    }
    void load();
  }, []);

  function refresh() {
    setLoading(true);
    void fetchAuditState().then(applyResult);
  }

  function doCopy(text: string, key: string) {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function buildChatGPT() {
    const meta = (data?.meta as Record<string, unknown>) || {};
  const phases = (meta.phases as { id: string; name: string; status: string; progress: number; notes?: string }[]) || [];
    const features = (meta.features as { id: string; name: string; phase: string; status: string; progress?: number; owner_agent?: string; notes?: string }[]) || [];
    const agents = (meta.agents as { name: string; role: string; current_task: string; status: string }[]) || [];
    const tasks = (meta.tasks as { id: string; title: string; feature: string; agent: string; status: string }[]) || [];
    const blockers = (meta.blockers as string[]) || [];
    const next = (meta.next_action as Record<string, string>) || {};
    const git = (data?.git as Record<string, unknown>) || {};
    const dbi = (data?.db as Record<string, unknown>) || {};
    const testStatus = (meta.test_status as Record<string, { status: string; last_run?: string | null; detail?: string }>) || {};
    const security = (meta.security as Record<string, { status: string; detail?: string }>) || {};

    const lines: string[] = [];
    lines.push("# JURNAL GURU — PROJECT STATUS (sumber: GET /api/audit)");
    lines.push(`Tanggal: ${new Date().toLocaleString("id-ID")}`);
    lines.push(`Repo: herulife/jurnal-guru | Live: https://guru.cintabuku.site`);
    lines.push("");
    lines.push("## STATUS GLOBAL");
    const active = phases.find((p) => p.status === "IN_PROGRESS");
    lines.push(
      active
        ? `- Phase aktif: ${active.id} ${active.name} (${active.progress}%) — IN_PROGRESS`
        : "- Phase aktif: tidak ada"
    );
    const doneCount = features.filter((f) => f.status === "COMPLETED").length;
    lines.push(`- Fitur selesai: ${doneCount}/${features.length}`);
    lines.push(`- Blockers: ${blockers.length === 0 ? "tidak ada" : blockers.join("; ")}`);
    lines.push(`- NEXT ACTION: ${next.title || "-"} (${next.agent || "-"}, prioritas ${next.priority || "-"})`);
    lines.push("");
    lines.push("## PHASES");
    for (const p of phases) lines.push(`- [${p.status}] ${p.id} ${p.name} — ${p.progress}%`);
    lines.push("");
    lines.push("## FITUR");
    for (const f of features)
      lines.push(
        `- [${f.status}] ${f.name} (${f.id}, fase ${f.phase}, ${f.owner_agent || "?"})${f.notes ? " — " + f.notes : ""}`
      );
    lines.push("");
    lines.push("## AGENTS");
    for (const a of agents)
      lines.push(`- ${a.name}: ${a.status} — ${a.current_task || "-"}`);
    lines.push("");
    lines.push("## TASKS");
    for (const t of tasks) lines.push(`- [${t.status}] ${t.id} ${t.title} (${t.agent})`);
    lines.push("");
    lines.push("## GIT (live)");
    lines.push(`- Branch: ${git.branch || "-"} | SHA saat build: ${git.current_sha || "-"}`);
    const commits = (git.commits as { sha: string; message: string; date: string; author: string }[]) || [];
    for (const c of commits.slice(0, 5))
      lines.push(`- ${c.sha} ${c.message} (${c.author || "?"}, ${(c.date || "").slice(0, 10)})`);
    lines.push("");
    lines.push("## DATABASE (live Turso)");
    const tables = (dbi.tables as string[]) || [];
    lines.push(`- ${tables.length} tabel aktif`);
    const counts = (dbi.counts as Record<string, number>) || {};
    for (const [t, c] of Object.entries(counts)) lines.push(`- ${t}: ${c} baris`);
    lines.push("");
    lines.push("## TEST");
    for (const [k, v] of Object.entries(testStatus))
      lines.push(`- ${k}: ${v.status}${v.last_run ? " (" + v.last_run + ")" : ""}${v.detail ? " — " + v.detail : ""}`);
    lines.push("");
    lines.push("## SECURITY");
    for (const [k, v] of Object.entries(security)) lines.push(`- ${k}: ${v.status}${v.detail ? " — " + v.detail : ""}`);
    return lines.join("\n");
  }

  const meta = (data?.meta as Record<string, unknown>) || {};
  const phases = (meta.phases as { id: string; name: string; status: string; progress: number; notes?: string }[]) || [];
  const features = (meta.features as { id: string; name: string; phase: string; status: string; progress?: number; owner_agent?: string }[]) || [];
  const agents = (meta.agents as { name: string; role: string; current_task: string; status: string }[]) || [];
  const tasks = (meta.tasks as { id: string; title: string; status: string; agent: string }[]) || [];
  const activity = (meta.activity_log as { at: string; agent: string; type: string; detail: string }[]) || [];
  const git = (data?.git as Record<string, unknown>) || {};
  const commits = (git.commits as { sha: string; message: string; date: string; author: string }[]) || [];
  const dbi = (data?.db as Record<string, unknown>) || {};
  const counts = (dbi.counts as Record<string, number>) || {};
  const testStatus = (meta.test_status as Record<string, { status: string; last_run?: string | null; detail?: string }>) || {};
  const security = (meta.security as Record<string, { status: string; detail?: string }>) || {};
  const blockers = (meta.blockers as Record<string, unknown>[]) || [];
  const next = (meta.next_action as Record<string, string>) || {};
  const docsMd = auditsMd || "";

  const copyBtn = "btn btn-sm btn-outline";
  const copiedOk = "btn btn-sm btn-primary";

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <div>
          <h2 className="text-lg font-bold text-[#1A2332] flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-[#0D7C66]" />
            Project Status Center
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sumber kebenaran status proyek — sinkronisasi otomatis dari metadata, GitHub & database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => doCopy(buildChatGPT(), "chatgpt")}
            className={copied === "chatgpt" ? copiedOk : copyBtn}
            title="Ringkasan status siap tempel ke ChatGPT / AI lain"
          >
            <i className="fa-solid fa-robot mr-1" />
            {copied === "chatgpt" ? "Tersalin!" : "COPY FOR CHATGPT"}
          </button>
          <button
            onClick={() => doCopy(`# DOKUMEN AUDIT\n\n${docsMd}\n\n---\n\n${buildChatGPT()}`, "full")}
            className={copied === "full" ? copiedOk : copyBtn}
          >
            <i className="fa-solid fa-copy mr-1" />
            {copied === "full" ? "Tersalin!" : "COPY FULL AUDIT"}
          </button>
          <button
            onClick={() => doCopy(JSON.stringify(data, null, 2), "json")}
            className={copied === "json" ? copiedOk : copyBtn}
          >
            <i className="fa-solid fa-brackets-curly mr-1" />
            {copied === "json" ? "Tersalin!" : "COPY JSON"}
          </button>
          <button onClick={refresh} className="btn btn-sm bg-[#1A2332] text-white hover:bg-[#2c3a4f]">
            <i className={`fa-solid fa-rotate mr-1 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
          <i className="fa-solid fa-lock" />
          {error}
        </div>
      )}

      {!error && loading && !data && (
        <div className="card p-8 text-center text-gray-400">
          <i className="fa-solid fa-spinner fa-spin text-2xl mb-2" />
          <p className="text-sm">Menghitung status proyek…</p>
        </div>
      )}

      {!error && data && (
        <>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
              <i className="fa-solid fa-flag text-[#E8A317]" /> Phases
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {phases.map((p) => (
                <div key={p.id} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#1A2332]">
                      {p.id} · {p.name}
                    </span>
                    <Badge status={p.status} />
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D7C66] rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  {p.notes && <p className="text-[11px] text-gray-400 mt-1.5">{p.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-[#0D7C66]" /> Features
              </h3>
              <div className="space-y-1.5">
                {features.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[#1A2332] truncate">
                      {f.name} <span className="text-gray-400 text-[11px]">({f.phase})</span>
                    </span>
                    <Badge status={f.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-user-tie text-[#0D7C66]" /> Agents
                </h3>
                <div className="space-y-1.5">
                  {agents.map((a) => (
                    <div key={a.name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-[#1A2332]">
                        {a.name}
                        <span className="text-gray-400 text-[11px] ml-1">{a.current_task ? "· " + a.current_task : ""}</span>
                      </span>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-gears text-[#E8A317]" /> Git (live)
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Branch <b>{String(git.branch || "-")}</b> · SHA build <code className="bg-gray-100 px-1 rounded">{String(git.current_sha || "-")}</code>
                </p>
                <ul className="space-y-1 text-xs">
                  {commits.slice(0, 6).map((c) => (
                    <li key={c.sha} className="flex items-center gap-2">
                      <code className="bg-gray-100 px-1 rounded text-[10px] text-gray-500">{c.sha}</code>
                      <span className="text-[#1A2332] truncate">{c.message}</span>
                      <span className="text-gray-400 ml-auto shrink-0">{(c.date || "").slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-database text-[#0D7C66]" /> Database (live Turso)
              </h3>
              <p className="text-xs text-gray-500 mb-2">{(dbi.tables as string[])?.length || 0} tabel · marketing:</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(counts).map(([t, c]) => (
                  <span key={t} className="text-[11px] bg-gray-50 border rounded-full px-2.5 py-1 text-gray-600">
                    {t}: <b>{c}</b>
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-flask text-[#E8A317]" /> Test & Security
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(testStatus).map(([k, v]) => (
                  <span key={k} className="text-[11px] bg-gray-50 border rounded-full px-2.5 py-1 text-gray-600">
                    {k}: <Badge status={v.status} />
                    {v.last_run ? <span className="text-gray-400"> ({v.last_run})</span> : null}
                  </span>
                ))}
              </div>
              <ul className="space-y-1 text-xs">
                {Object.entries(security).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <span className="text-[#1A2332]">{k}</span>
                    <Badge status={v.status} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                <i className="fa-solid fa-list text-[#0D7C66]" /> Tasks
              </h3>
              <ul className="space-y-1.5 text-xs">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2">
                    <span className="text-[#1A2332]">
                      <b>{t.id}</b> {t.title}
                      <span className="text-gray-400"> · {t.agent}</span>
                    </span>
                    <Badge status={t.status} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="text-sm font-bold text-[#1A2332] mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-[#E8A317]" /> Activity Log
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-gray-400 shrink-0">{(a.at || "").slice(11, 16)}</span>
                      <Badge status={a.type === "COMPLETED TASK" ? "COMPLETED" : "ACTIVE"} />
                      <span className="text-[#1A2332] truncate">{a.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-5 border-[#E8A317]/40">
                <h3 className="text-sm font-bold text-[#1A2332] mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-[#E8A317]" /> Blockers & Next Action
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Blockers: {blockers.length === 0 ? <b className="text-[#0D7C66]">tidak ada</b> : blockers.length}
                </p>
                <div className="text-xs bg-[#E8A317]/10 border border-[#E8A317]/30 rounded-lg p-3">
                  <p className="text-gray-400">NEXT ACTION ({next.priority || "-"} · {next.agent || "-"})</p>
                  <p className="font-semibold text-[#1A2332] mt-1">{next.title || "-"}</p>
                  {next.reason && <p className="text-gray-500 mt-1">{next.reason}</p>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
