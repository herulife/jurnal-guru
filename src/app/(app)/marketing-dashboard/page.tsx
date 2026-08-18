"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/useApi";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

type Summary = {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTasks: number;
  todayTasks: number;
  overdueTasks: number;
  doneTasks: number;
  totalJournal: number;
};

type Goal = {
  id: string;
  name: string;
  metric: string | null;
  targetValue: number | null;
  currentValue: number | null;
  status: string;
  progress: number;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  goalId: string | null;
};

type ChartPoint = { date: string; journal: number; taskDone: number };

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  TODO: { label: "TODO", cls: "bg-gray-100 text-gray-600" },
  IN_PROGRESS: { label: "Berjalan", cls: "bg-blue-100 text-blue-700" },
  DONE: { label: "Selesai", cls: "bg-green-100 text-green-700" },
  BLOCKED: { label: "Terhambat", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Batal", cls: "bg-gray-100 text-gray-400" },
};

export default function MarketingDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [error, setError] = useState("");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    apiGet<{
      summary: Summary;
      todayTasks: Task[];
      overdueTasks: Task[];
      goals: Goal[];
      chart: ChartPoint[];
    }>("/api/marketing/dashboard")
      .then((r) => {
        if (!r.ok || !r.data) {
          setError(r.msg || "Gagal memuat dashboard");
          return;
        }
        setSummary(r.data.summary);
        setGoals(r.data.goals);
        setTodayTasks(r.data.todayTasks);
        setOverdueTasks(r.data.overdueTasks);
        setChart(r.data.chart);
      })
      .catch(() => setError("Gagal memuat dashboard"));
  }, []);

  useEffect(() => {
    if (!chart.length || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chart.map((c) => c.date.slice(5)),
        datasets: [
          {
            label: "Journal",
            data: chart.map((c) => c.journal),
            borderColor: "#0D7C66",
            backgroundColor: "rgba(13,124,102,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
          {
            label: "Task selesai",
            data: chart.map((c) => c.taskDone),
            borderColor: "#E8A317",
            backgroundColor: "rgba(232,163,23,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" as const } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }, [chart]);

  const cards = [
    { label: "Goal Aktif", value: summary?.activeGoals ?? 0, icon: "fa-bullseye", cls: "text-[#0D7C66]" },
    { label: "Goal Selesai", value: summary?.completedGoals ?? 0, icon: "fa-check-circle", cls: "text-green-500" },
    { label: "Task Hari Ini", value: summary?.todayTasks ?? 0, icon: "fa-list-check", cls: "text-blue-500" },
    { label: "Task Terlambat", value: summary?.overdueTasks ?? 0, icon: "fa-triangle-exclamation", cls: "text-red-500" },
    { label: "Task Selesai", value: summary?.doneTasks ?? 0, icon: "fa-check-double", cls: "text-green-500" },
    { label: "Journal", value: summary?.totalJournal ?? 0, icon: "fa-book", cls: "text-[#1A2332]" },
  ];

  function TaskRow({ t, late }: { t: Task; late?: boolean }) {
    const badge = STATUS_BADGE[t.status] || STATUS_BADGE.TODO;
    return (
      <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#1A2332] truncate">{t.title}</div>
          <div className="text-xs text-gray-400">
            {t.dueDate || "-"}
            {late ? " · terlambat" : ""}
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332]">Marketing Dashboard</h1>
            <p className="text-sm text-gray-500">KPI, progres goal, dan aktivitas 30 hari terakhir</p>
          </div>
        </div>

        {error && <div className="card p-4 text-red-500 text-sm mb-4">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {cards.map((c) => (
            <div key={c.label} className="card p-4">
              <i className={`fa-solid ${c.icon} ${c.cls} text-lg mb-2`} />
              <div className="text-2xl font-bold text-[#1A2332]">{c.value}</div>
              <div className="text-xs text-gray-500">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card p-5 mb-6">
          <div className="text-sm font-semibold text-[#1A2332] mb-3">
            Aktivitas 30 hari (journal & task selesai)
          </div>
          <div className="h-64">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <div className="text-sm font-semibold text-[#1A2332] mb-3">Progres Goal</div>
            {goals.length === 0 && <div className="text-sm text-gray-400">Belum ada goal.</div>}
            {goals.slice(0, 6).map((g) => (
              <div key={g.id} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-[#1A2332] truncate">{g.name}</span>
                  <span className="text-xs text-gray-500">
                    {g.currentValue ?? 0}/{g.targetValue ?? 0} {g.metric || ""} · {g.progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(g.progress, 100)}%`,
                      background: g.status === "COMPLETED" ? "#22c55e" : "#0D7C66",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <div className="text-sm font-semibold text-[#1A2332] mb-2">
                Task Hari Ini ({todayTasks.length})
              </div>
              {todayTasks.length === 0 && <div className="text-sm text-gray-400">Tidak ada task hari ini.</div>}
              {todayTasks.map((t) => (
                <TaskRow key={t.id} t={t} />
              ))}
            </div>
            <div className="card p-5">
              <div className="text-sm font-semibold text-red-500 mb-2">
                Task Terlambat ({overdueTasks.length})
              </div>
              {overdueTasks.length === 0 && <div className="text-sm text-gray-400">Tidak ada task terlambat.</div>}
              {overdueTasks.map((t) => (
                <TaskRow key={t.id} t={t} late />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}