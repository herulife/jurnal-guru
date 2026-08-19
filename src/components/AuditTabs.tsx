"use client";

import { useState, useMemo } from "react";
import StatusCopyButton from "@/components/StatusCopyButton";

export default function AuditTabs({ report }: { report: string }) {
  const sections = useMemo(() => {
    const parts = report.split(/^## /m).filter((p) => p.trim());
    return parts.map((p) => {
      const [titleLine, ...body] = p.split("\n");
      return { title: titleLine.trim(), body: body.join("\n").trim() };
    });
  }, [report]);

  const [tab, setTab] = useState(0);

  const header = sections[0] ?? { title: "SALES READINESS AUDIT", body: "" };
  const phases = sections.slice(1);

  const full = `## ${header.title}\n\n${header.body}\n\n${phases.map((p) => `## ${p.title}\n\n${p.body}`).join("\n\n")}`;

  function sectionBody(name: string): string {
    return phases.find((p) => p.title === name)?.body ?? "";
  }

  const blockers = sectionBody("CRITICAL BLOCKERS");
  const quickWins = sectionBody("QUICK WINS");
  const nextAction = sectionBody("NEXT ACTION");
  const ready = !/NOT READY/i.test(blockers + nextAction + sectionBody("FINAL SALES VERDICT"));
  const quickWinCount = quickWins.split("\n").filter((l) => /^\d+\./.test(l.trim())).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">
            Sales Readiness Final Audit
          </h1>
          <p className="text-sm text-gray-500">
            {header.body.split("\n")[0]} · 10 fase + verdict akhir — siap disalin untuk
            laporan
          </p>
        </div>
        <div className="flex gap-2">
          <StatusCopyButton text={phases[tab] ? `## ${phases[tab].title}\n\n${phases[tab].body}` : report} />
          <button
            className="btn btn-outline text-sm"
            style={{ color: "#0D7C66" }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(report);
              } catch {
                const ta = document.createElement("textarea");
                ta.value = report;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
              }
            }}
          >
            <i className="fa-solid fa-copy mr-2" />
            Salin Semua
          </button>
        </div>
      </div>

      <div className="card p-5 mb-4 border-l-4" style={{ borderLeftColor: ready ? "#16a34a" : "#dc2626" }}>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: ready ? "#16a34a" : "#dc2626" }}
          >
            {ready ? "READY TO ADVERTISE" : "NOT READY TO ADVERTISE"}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-700">
            Blockers: {blockers === "NONE" || blockers.startsWith("NONE") ? "TIDAK ADA" : blockers}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-700">
            Quick Wins: {quickWinCount}
          </span>
          <button
            onClick={() => setTab(phases.findIndex((p) => p.title.includes("PHASE 10")))}
            className="btn btn-sm text-sm"
            style={{ backgroundColor: "#0D7C66", color: "#fff" }}
          >
            Lihat Verdict &amp; Next Action
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {phases.map((p, i) => (
          <button
            key={p.title}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === i
                ? "bg-[#0D7C66] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#0D7C66]"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <pre
          className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#1A2332] bg-white rounded-lg border border-gray-100 p-4 overflow-x-auto"
          style={{ maxHeight: "70vh" }}
        >
          {phases[tab]?.body ?? ""}
        </pre>
      </div>
    </>
  );
}