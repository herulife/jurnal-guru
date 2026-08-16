"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import MarkdownView from "@/components/MarkdownView";

export default function MarketingPlanView({ content, toc }: { content: string; toc: { id: string; title: string }[] }) {
  const [showToc, setShowToc] = useState(true);

  return (
    <AdminGuard>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-4 md:-mx-8 px-4 md:px-8 py-3 flex items-center justify-between gap-3 mb-6">
            <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">
              Marketing Plan <span className="hidden sm:inline text-gray-400 font-normal">— Jurnal Guru</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="text-xs font-semibold text-[#0D7C66] border border-[#0D7C66]/30 rounded-lg px-3 py-1.5 hover:bg-[#0D7C66]/5"
              >
                <i className="fas fa-print mr-1"></i> Cetak / PDF
              </button>
              <button
                onClick={() => setShowToc(!showToc)}
                className="text-xs font-semibold text-gray-600 border border-[#E8E4DC] rounded-lg px-3 py-1.5 hover:bg-white"
              >
                <i className="fas fa-list-ul mr-1"></i> Daftar Isi
              </button>
            </div>
          </header>

          <div className="card p-6 md:p-8">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#E8A317]/15 text-[#E8A317] px-2.5 py-1 rounded-full mb-3">
                <i className="fas fa-lock text-[9px]"></i> Khusus Admin
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[Outfit] text-[#1A2332] mb-2">
                Jurnal Guru — Marketing Plan v1
              </h2>
              <p className="text-sm text-gray-500">
                Disusun 16 Agustus 2026 · 13 seksi AARRR · ~6.700 kata · sumber:{" "}
                <code className="px-1.5 py-0.5 bg-[#0D7C66]/10 text-[#0A6352] rounded font-mono text-xs">.agents/marketing-plan-jurnal-guru.md</code>
              </p>
            </div>

            {showToc && (
              <nav className="mb-8 p-4 rounded-xl border border-[#E8E4DC] bg-[#F9F7F3] print:hidden">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Daftar Isi</p>
                <div className="flex flex-wrap gap-1.5">
                  {toc.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="text-xs text-gray-700 bg-white border border-[#E8E4DC] rounded-full px-3 py-1.5 hover:border-[#0D7C66] hover:text-[#0D7C66] transition-colors"
                    >
                      {t.title}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            <MarkdownView content={content} />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}