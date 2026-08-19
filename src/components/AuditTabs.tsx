"use client";

import { useMemo, useState } from "react";
import StatusCopyButton from "@/components/StatusCopyButton";

export default function AuditTabs({ report }: { report: string }) {
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => {
    const parts = report.split(/^## /m).filter((p) => p.trim());
    return parts.map((p) => {
      const [titleLine, ...body] = p.split("\n");
      return { title: titleLine.trim(), body: body.join("\n").trim() };
    });
  }, [report]);

  const bannerIdx = sections.findIndex((s) => s.title.includes("BANNER"));
  const bannerPart =
    bannerIdx >= 0 ? sections[bannerIdx].body : "";

  function sectionBody(name: string): string {
    return sections.find((p) => p.title.startsWith(name))?.body ?? "";
  }

  const blockers = sectionBody("CRITICAL BLOCKERS");
  const quickWins = sectionBody("QUICK WINS");
  const nextAction = sectionBody("NEXT ACTION");
  const ready = !/NOT READY/i.test(blockers + nextAction + sectionBody("FINAL STATUS"));
  const quickWinCount = quickWins.split("\n").filter((l) => /^\d+\./.test(l.trim())).length;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">
            Marketing &amp; Sales — Jurnal Guru
          </h1>
          <p className="text-sm text-gray-500">
            Banner promosi organic + hasil audit siap iklan — satu halaman, tinggal salin
          </p>
        </div>
        <div className="flex gap-2">
          <StatusCopyButton text={report} />
          {bannerPart && (
            <button
              className="btn btn-outline text-sm"
              style={{ color: "#0D7C66" }}
              onClick={() => void copyText(bannerPart)}
            >
              <i className="fa-solid fa-copy mr-2" />
              Salin Banner
            </button>
          )}
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
            Blockers: {blockers.includes("TIDAK ADA") ? "TIDAK ADA" : blockers.split("\n")[0]}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-700">
            Quick Wins: {quickWinCount}
          </span>
        </div>
      </div>

      <div className="card p-5">
        <pre
          className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#1A2332] bg-white rounded-lg border border-gray-100 p-4 overflow-x-auto"
          style={{ maxHeight: "75vh" }}
        >
          {report}
        </pre>
      </div>
    </>
  );
}