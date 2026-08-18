"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";

type CalendarItem = {
  id: string;
  type: "task" | "journal" | "plan";
  title: string;
  date: string | null;
  status?: string | null;
  priority?: string | null;
};

const TYPE_STYLE: Record<string, { cls: string; icon: string }> = {
  task: { cls: "bg-blue-50 text-blue-700 border-blue-100", icon: "fa-list-check" },
  journal: { cls: "bg-green-50 text-green-700 border-green-100", icon: "fa-book" },
  plan: { cls: "bg-amber-50 text-amber-700 border-amber-100", icon: "fa-bullhorn" },
};

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MarketingCalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");

  const ym = monthKey(cursor);
  const start = `${ym}-01`;
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    apiGet<CalendarItem[]>(`/api/marketing/calendar?start=${start}&end=${end}`)
      .then((r) => {
        if (!r.ok || !r.data) {
          setError(r.msg || "Gagal memuat kalender");
          setItems([]);
          return;
        }
        setError("");
        setItems(r.data);
      })
      .catch(() => {
        setError("Gagal memuat kalender");
        setItems([]);
      });
  }, [start, end]);

  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const byDate: Record<string, CalendarItem[]> = {};
  for (const it of items) {
    const d = it.date ? it.date.slice(0, 10) : "";
    if (d && d >= start && d <= end) (byDate[d] = byDate[d] || []).push(it);
  }

  const monthLabel = cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  function move(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332]">Marketing Calendar</h1>
            <p className="text-sm text-gray-500">Task, journal, dan marketing plan per tanggal</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => move(-1)}>
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span className="font-semibold text-[#1A2332] w-40 text-center">{monthLabel}</span>
            <button className="btn btn-outline btn-sm" onClick={() => move(1)}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {Object.entries(TYPE_STYLE).map(([k, v]) => (
            <span key={k} className={`px-2 py-1 rounded-md border ${v.cls}`}>
              <i className={`fa-solid ${v.icon} mr-1`} />
              {k === "task" ? "Task" : k === "journal" ? "Journal" : "Plan"}
            </span>
          ))}
          {error && <span className="text-red-500">{error}</span>}
        </div>

        <div className="card p-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="min-h-[92px] rounded-lg bg-gray-50/60" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const date = `${ym}-${String(d).padStart(2, "0")}`;
              const dayItems = byDate[date] || [];
              const today = new Date().toISOString().slice(0, 10) === date;
              return (
                <div
                  key={d}
                  className={`min-h-[92px] rounded-lg border p-1.5 ${
                    today ? "border-[#0D7C66] bg-[#0D7C66]/5" : "border-gray-100"
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${today ? "text-[#0D7C66]" : "text-gray-400"}`}>
                    {d}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((it) => {
                      const s = TYPE_STYLE[it.type] || TYPE_STYLE.task;
                      return (
                        <div
                          key={it.id}
                          title={it.title}
                          className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${s.cls}`}
                        >
                          {it.title}
                        </div>
                      );
                    })}
                    {dayItems.length > 3 && (
                      <div className="text-[10px] text-gray-400 pl-1">+{dayItems.length - 3} lagi</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}