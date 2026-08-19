"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { apiGet } from "@/lib/useApi";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface DashboardData {
  totalSiswa: number;
  totalKelas: number;
  absenHariIni: number;
  rataNilai: number;
  distPerKelas: Record<string, number>;
  totalAbsensi: number;
  totalNilai: number;
  tahunAjaran: string;
  semester: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mk, setMk] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    apiGet<DashboardData>("/api/dashboard").then((res: { ok: boolean; data?: DashboardData }) => {
      if (res.ok && res.data) setData(res.data);
    });
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((r) => {
        if (r.ok && r.data?.user?.role === "Admin") {
          setIsAdmin(true);
          apiGet<any>("/api/marketing/dashboard").then((res: { ok: boolean; data?: any }) => {
            if (res.ok && res.data) setMk(res.data);
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data || !chartRef.current || typeof window === "undefined") return;

    const labels = Object.keys(data.distPerKelas);
    const values = Object.values(data.distPerKelas);
    const colors = [
      "#0D7C66", "#E8A317", "#7c3aed", "#dc2626",
      "#059669", "#2563eb", "#d97706", "#be185d",
      "#4f46e5", "#0d9488",
    ];

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.length ? labels : ["-"],
        datasets: [
          {
            label: "Siswa",
            data: values.length ? values : [0],
            backgroundColor: labels.length
              ? labels.map((_, i) => colors[i % colors.length])
              : ["#ccc"],
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 50,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "#f0f0f0" },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);

  const stats = [
    {
      label: "Siswa Terdaftar",
      value: data?.totalSiswa ?? 0,
      sub: "Total",
      icon: "fa-user-graduate",
      bg: "bg-[#eefbf8]",
      color: "text-[#0D7C66]",
      accent: "#0D7C66",
    },
    {
      label: "Kelas",
      value: data?.totalKelas ?? 0,
      sub: "Aktif",
      icon: "fa-chalkboard",
      bg: "bg-[#fffbeb]",
      color: "text-[#E8A317]",
      accent: "#E8A317",
    },
    {
      label: "Absensi Dicatat",
      value: data?.absenHariIni ?? 0,
      sub: "Hari ini",
      icon: "fa-clipboard-check",
      bg: "bg-green-50",
      color: "text-green-700",
      accent: "#059669",
    },
    {
      label: "Nilai Keseluruhan",
      value: data?.rataNilai ?? 0,
      sub: "Rata-rata",
      icon: "fa-chart-line",
      bg: "bg-purple-50",
      color: "text-purple-700",
      accent: "#7c3aed",
    },
  ];

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <header className="sticky top-14 md:top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Onboarding */}
      {(data?.totalKelas ?? 0) === 0 && (data?.totalSiswa ?? 0) === 0 && (
        <div className="card p-5 mb-8 border-[#0D7C66]/30">
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-flag-checkered text-[#0D7C66]"></i>
            <h2 className="font-bold text-[#1A2332]">Selamat datang! Mulai dalam 5 langkah</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Lengkapi data dasar dulu — semua bisa diubah kapan saja.</p>
          <div className="flex flex-col md:flex-row gap-2">
            {[
              { n: 1, label: "Lengkapi profil", href: "/profil" },
              { n: 2, label: "Tambahkan kelas", href: "/kelas" },
              { n: 3, label: "Tambahkan siswa", href: "/siswa" },
              { n: 4, label: "Buat jadwal", href: "/jadwal" },
              { n: 5, label: "Mulai absensi", href: "/absensi" },
            ].map((s) => (
              <Link
                key={s.n}
                href={s.href}
                className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-[#E8E4DC] text-sm font-medium text-[#1A2332] hover:border-[#0D7C66] hover:text-[#0D7C66] transition-all"
              >
                <span className="w-5 h-5 rounded-full bg-[#0D7C66] text-white text-[11px] font-bold flex items-center justify-center">
                  {s.n}
                </span>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card relative overflow-hidden">
            <div
              className="absolute w-[120px] h-[120px] rounded-full opacity-15 -top-5 -right-5"
              style={{ background: s.accent }}
            />
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg} ${s.color}`}
              >
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className="text-xs text-gray-400">{s.sub}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* MarketingOS */}
      {isAdmin && mk && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 font-[Outfit]">
              MarketingOS
            </h2>
            <a href="/goals" className="text-xs font-semibold text-[#EC4899] hover:underline">
              Kelola Goals
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Goals Aktif", value: mk.summary?.activeGoals ?? 0, icon: "fa-bullseye", bg: "bg-pink-50", color: "text-pink-600" },
              { label: "Task Hari Ini", value: mk.summary?.todayTasks ?? 0, icon: "fa-list-check", bg: "bg-amber-50", color: "text-amber-600" },
              { label: "Task Terlambat", value: mk.summary?.overdueTasks ?? 0, icon: "fa-clock", bg: "bg-red-50", color: "text-red-600" },
              { label: "Journal Dicatat", value: mk.summary?.totalJournal ?? 0, icon: "fa-book", bg: "bg-emerald-50", color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="card flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${s.bg} ${s.color}`}>
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          {mk.goals?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3 text-sm font-[Outfit]">
                Progres Goal
              </h3>
              <div className="space-y-3">
                {mk.goals.slice(0, 4).map((g: any) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{g.name}</span>
                      <span className="text-xs text-gray-500">{g.progress ?? 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5F3EF] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#EC4899]"
                        style={{ width: `${Math.min(100, g.progress ?? 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts & Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">
            Distribusi Siswa per Kelas
          </h3>
          <div style={{ height: "280px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 font-[Outfit]">
            Ringkasan Data
          </h3>
          <div className="space-y-4">
            {[
              {
                icon: "fa-clipboard-check",
                bg: "bg-[#eefbf8]",
                color: "text-[#0D7C66]",
                label: "Total Absensi",
                value: data?.totalAbsensi ?? 0,
              },
              {
                icon: "fa-chart-bar",
                bg: "bg-[#fffbeb]",
                color: "text-[#E8A317]",
                label: "Total Nilai",
                value: data?.totalNilai ?? 0,
              },
              {
                icon: "fa-calendar-alt",
                bg: "bg-purple-50",
                color: "text-purple-700",
                label: "Tahun Ajaran",
                value: data?.tahunAjaran ?? "-",
              },
              {
                icon: "fa-book-open",
                bg: "bg-red-50",
                color: "text-red-700",
                label: "Semester",
                value: data?.semester ?? "-",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between p-3.5 bg-[#F5F3EF] rounded-xl row-soft"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.bg} ${r.color}`}
                  >
                    <i className={`fas ${r.icon}`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{r.label}</span>
                </div>
                <span className="font-bold text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
