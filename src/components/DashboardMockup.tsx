"use client";

import { useState } from "react";

/**
 * Mockup dashboard interaktif (Absensi / Nilai / Jurnal) untuk halaman home.
 * Meniru gaya hero marketing: panel ber-tab + kartu statistik melayang.
 */
export default function DashboardMockup() {
  const [tab, setTab] = useState<"absensi" | "nilai" | "jurnal">("absensi");

  const students = [
    { ini: "AR", nama: "Ahmad Rizki", st: "Hadir", c: "bg-[#0A6352]" },
    { ini: "SF", nama: "Siti Fatimah", st: "Hadir", c: "bg-[#0D7C66]" },
    { ini: "BW", nama: "Budi Wicaksono", st: "Izin", c: "bg-[#64748b]" },
    { ini: "DN", nama: "Dewi Nuraini", st: "Hadir", c: "bg-[#334155]" },
    { ini: "RM", nama: "Rizki Maulana", st: "Sakit", c: "bg-[#0A6352]" },
  ];

  const grades = [
    { sub: "Matematika", score: 88, ok: true },
    { sub: "B. Indo", score: 92, ok: true },
    { sub: "IPA", score: 72, ok: false },
    { sub: "IPS", score: 85, ok: true },
    { sub: "B. Inggris", score: 90, ok: true },
    { sub: "PKn", score: 87, ok: true },
  ];

  const journals = [
    { tgl: "Senin, 5 Agustus 2026", txt: "Materi: Persamaan Linear. Kendala: siswa kesulitan memahami konsep dasar." },
    { tgl: "Selasa, 6 Agustus 2026", txt: "Materi: Latihan Soal. Solusi: berikan contoh kontekstual sehari-hari." },
    { tgl: "Rabu, 7 Agustus 2026", txt: "Materi: Kuis Bab 1. Semua siswa aktif berpartisipasi dengan baik." },
  ];

  const tabs = [
    { key: "absensi" as const, label: "Absensi", icon: "fa-clipboard-check" },
    { key: "nilai" as const, label: "Nilai", icon: "fa-chart-bar" },
    { key: "jurnal" as const, label: "Jurnal", icon: "fa-book-open" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* floating stats */}
      <div className="absolute -top-6 -left-4 z-10 bg-white rounded-2xl shadow-xl border border-[#E8E4DC] px-4 py-3 flex items-center gap-3 animate-float">
        <div className="w-9 h-9 rounded-xl bg-[#0D7C66]/10 flex items-center justify-center">
          <i className="fas fa-bolt text-[#0D7C66]"></i>
        </div>
        <div>
          <div className="font-bold text-sm text-[#1A2332] leading-none">10 detik</div>
          <div className="text-[11px] text-gray-400">per kelas</div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-4 z-10 bg-white rounded-2xl shadow-xl border border-[#E8E4DC] px-4 py-3 flex items-center gap-3 animate-float-slow">
        <div className="w-9 h-9 rounded-xl bg-[#E8A317]/10 flex items-center justify-center">
          <i className="fas fa-file-export text-[#E8A317]"></i>
        </div>
        <div>
          <div className="font-bold text-sm text-[#1A2332] leading-none">Auto Export</div>
          <div className="text-[11px] text-gray-400">Excel &amp; PDF</div>
        </div>
      </div>

      {/* browser window */}
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F5F3EF] border-b border-[#E8E4DC]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#86efac]"></span>
          <span className="ml-2 text-xs text-gray-400 font-mono">Jurnal Guru Dashboard</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-white border border-[#E8E4DC] rounded text-gray-400">
            jurnal-guru
          </span>
        </div>

        <div className="p-4">
          {/* tabs */}
          <div className="flex gap-1 mb-4 bg-[#F5F3EF] p-1 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all bg-transparent border-none cursor-pointer ${
                  tab === t.key
                    ? "bg-white text-[#0D7C66] shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <i className={`fas ${t.icon} text-[10px]`}></i>
                {t.label}
              </button>
            ))}
          </div>

          {/* Absensi */}
          {tab === "absensi" && (
            <div className="space-y-2">
              {students.map((s) => (
                <div key={s.nama} className="flex items-center justify-between px-3 py-2.5 bg-[#F5F3EF] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${s.c} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {s.ini}
                    </div>
                    <span className="text-xs font-semibold text-[#1A2332]">{s.nama}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    s.st === "Hadir"
                      ? "bg-emerald-100 text-emerald-700"
                      : s.st === "Izin"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {s.st}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Nilai */}
          {tab === "nilai" && (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {grades.map((g) => (
                  <div key={g.sub} className="px-2 py-3 bg-[#F5F3EF] rounded-xl text-center border border-[#E8E4DC]">
                    <div className="text-[10px] text-gray-400 font-semibold mb-1">{g.sub}</div>
                    <div className={`font-bold text-sm ${g.ok ? "text-[#0D7C66]" : "text-red-500"}`}>{g.score}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-gray-500 text-center">
                <i className="fas fa-check-circle text-[#0D7C66] mr-1"></i>
                5 dari 6 mapel tuntas KKM
              </div>
            </div>
          )}

          {/* Jurnal */}
          {tab === "jurnal" && (
            <div className="space-y-2">
              {journals.map((j) => (
                <div key={j.tgl} className="px-3 py-2.5 bg-[#F5F3EF] rounded-xl">
                  <div className="text-[11px] font-bold text-[#0D7C66] mb-1">{j.tgl}</div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">{j.txt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}