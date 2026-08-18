"use client";

import { useState } from "react";
import StatusCopyButton from "@/components/StatusCopyButton";

export default function ReportTabs({
  version,
  statusReport,
  archReport,
}: {
  version: string;
  statusReport: string;
  archReport: string;
}) {
  const [tab, setTab] = useState<"status" | "arch">("status");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">
            OpenCode Multi-Agent
          </h1>
          <p className="text-sm text-gray-500">
            OpenCode v{version} · status kondisi aktual + desain arsitektur
          </p>
        </div>
        <div className="flex gap-2">
          <StatusCopyButton text={tab === "status" ? statusReport : archReport} />
          <a href="/status" className="btn btn-outline text-sm" style={{ color: "#0D7C66" }}>
            <i className="fa-solid fa-heart-pulse mr-2" />
            Status Center
          </a>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("status")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "status"
              ? "bg-[#0D7C66] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-[#0D7C66]"
          }`}
        >
          Multi-Agent Status
        </button>
        <button
          onClick={() => setTab("arch")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "arch"
              ? "bg-[#0D7C66] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-[#0D7C66]"
          }`}
        >
          Architecture Design
        </button>
      </div>

      <div className="card p-5">
        <pre
          className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#1A2332] bg-white rounded-lg border border-gray-100 p-4 overflow-x-auto"
          style={{ maxHeight: "70vh" }}
        >
          {tab === "status" ? statusReport : archReport}
        </pre>
      </div>
    </>
  );
}