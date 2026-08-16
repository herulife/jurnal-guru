"use client";

import { useEffect, useState, useRef } from "react";
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
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    apiGet<DashboardData>("/api/dashboard").then((res: { ok: boolean; data?: DashboardData }) => {
      if (res.ok && res.data) setData(res.data);
    });
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
