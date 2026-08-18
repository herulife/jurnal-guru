"use client";

import { useState } from "react";
import StatusCopyButton from "@/components/StatusCopyButton";

type Tab = "status" | "arch" | "orch";

export default function ReportTabs({
  version,
  statusReport,
  archReport,
  orchReport,
}: {
  version: string;
  statusReport: string;
  archReport: string;
  orchReport: string;
}) {
  const [tab, setTab] = useState<Tab>("status");

  const reports: Record<Tab, string> = {
    status: statusReport,
    arch: archReport,
    orch: orchReport,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "status", label: "Multi-Agent Status" },
    { id: "arch", label: "Architecture Design" },
    { id: "orch", label: "Orchestrator Doctrine" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">
            OpenCode Multi-Agent
          </h1>
          <p className="text-sm text-gray-500">
            OpenCode v{version} · status kondisi aktual + desain arsitektur +
            doktrin orchestrator
          </p>
        </div>
        <div className="flex gap-2">
          <StatusCopyButton text={reports[tab]} />
          <a href="/status" className="btn btn-outline text-sm" style={{ color: "#0D7C66" }}>
            <i className="fa-solid fa-heart-pulse mr-2" />
            Status Center
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#0D7C66] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#0D7C66]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <pre
          className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#1A2332] bg-white rounded-lg border border-gray-100 p-4 overflow-x-auto"
          style={{ maxHeight: "70vh" }}
        >
          {reports[tab]}
        </pre>
      </div>
    </>
  );
}