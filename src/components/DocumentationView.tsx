"use client";

import React, { useMemo, useState } from "react";
import MarkdownView from "./MarkdownView";

type Audit = { name: string; date: string; sha: string; content: string };

function splitSections(content: string): { title: string; body: string; meta: string }[] {
  const lines = content.split("\n");
  const idx = lines.findIndex((l) => l.startsWith("# "));
  const title = idx >= 0 ? lines[idx].slice(2).trim() : "Application Audit";
  const rest = idx >= 0 ? lines.slice(idx + 1) : lines;
  const metaLines: string[] = [];
  while (rest.length && rest[0].trim() !== "" && !rest[0].startsWith("# ")) {
    metaLines.push(rest.shift()!);
  }
  const sections: { title: string; body: string; meta: string }[] = [];
  let cur: { title: string; body: string[] } | null = null;
  for (const l of rest) {
    if (l.startsWith("# ")) {
      if (cur) sections.push({ title: cur.title, body: cur.body.join("\n").trim(), meta: "" });
      cur = { title: l.slice(2).trim(), body: [] };
    } else if (cur) {
      cur.body.push(l);
    }
  }
  if (cur) sections.push({ title: cur.title, body: cur.body.join("\n").trim(), meta: "" });
  return sections.map((s) => ({ ...s, meta: metaLines.join("\n").trim() }));
}

export default function DocumentationView({ audits }: { audits: Audit[] }) {
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const audit = audits[active];
  const sections = useMemo(() => (audit ? splitSections(audit.content) : []), [audit]);
  const filtered = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
    );
  }, [sections, search]);

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="card p-8 text-center text-gray-500">
            Belum ada audit. Jalankan <code>npm run audit</code> terlebih dahulu.
          </div>
        </div>
      </div>
    );
  }

  async function copyText(text: string, key: string) {
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
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function exportMarkdown() {
    const blob = new Blob([audit.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = audit.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A2332]">Application Audit</h1>
              <p className="text-sm text-gray-500">
                Audit terakhir: {audit.date}
                {audit.sha ? ` · commit ${audit.sha.slice(0, 7)}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={exportMarkdown}>
                <i className="fa-solid fa-download mr-2" />Export Markdown
              </button>
              <button
                className="btn btn-primary"
                onClick={() => copyText(audit.content, "all")}
              >
                {copied === "all" ? (
                  <>
                    <i className="fa-solid fa-check mr-2" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-copy mr-2" />
                    Copy All
                  </>
                )}
              </button>
            </div>
          </div>

          {audits.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {audits.map((a, i) => (
                <button
                  key={a.name}
                  onClick={() => setActive(i)}
                  className={`badge cursor-pointer transition ${
                    i === active ? "bg-[#0D7C66] text-white" : "bg-white text-gray-600 border"
                  }`}
                >
                  {a.date}
                </button>
              ))}
            </div>
          )}

          <div className="card p-4 mb-4">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9 w-full"
                placeholder={`Cari di ${sections.length} seksi... (mis. "api", "auth", "pembayaran")`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search.trim() && (
              <p className="text-xs text-gray-500 mt-2">
                {filtered.length} seksi ditemukan
              </p>
            )}
          </div>

          {sections[0].meta && (
            <div className="card p-4 mb-4 text-sm text-gray-600 whitespace-pre-wrap bg-[#0D7C66]/5 border-[#0D7C66]/20">
              {sections[0].meta}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-500">
              Tidak ada seksi yang cocok dengan pencarian.
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((s) => {
              const key = `${active}-${s.title}`;
              return (
                <div key={key} className="card overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-5 py-3 bg-[#1A2332] text-white">
                    <h2 className="font-semibold text-[15px] leading-snug">{s.title}</h2>
                    <button
                      className="shrink-0 text-xs text-[#7dd3c0] hover:text-white transition"
                      onClick={() => copyText(`# ${s.title}\n\n${s.body}`, key)}
                    >
                      {copied === key ? (
                        <>
                          <i className="fa-solid fa-check mr-1" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-copy mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="px-5 py-4">
                    <MarkdownView content={s.body} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}