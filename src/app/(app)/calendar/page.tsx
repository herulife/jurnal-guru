"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/useApi";

interface CalendarItem {
  id: string;
  type: string;
  title: string;
  date: string | null;
  status?: string | null;
  priority?: string | null;
}

interface CalendarData {
  view: string;
  items: CalendarItem[];
  summary: { tasks: number; journals: number; plans: number };
}

const TYPE_META: Record<string, { label: string; cls: string; icon: string }> = {
  task: { label: "Task", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: "fa-tasks" },
  journal: { label: "Journal", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: "fa-book-open" },
  plan: { label: "Plan", cls: "bg-purple-50 text-purple-700 border-purple-200", icon: "fa-clipboard-list" },
};

export default function CalendarPage() {
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [cursor, setCursor] = useState(new Date());
  const [data, setData] = useState<CalendarItem[]>([]);
  const [summary, setSummary] = useState({ tasks: 0, journals: 0, plans: 0 });

  const load = useCallback(async () => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).toISOString().slice(0, 10);
    const res = await apiGet<CalendarData>(`/api/marketing/calendar?view=${view}&start=${start}&end=${end}`);
    if (res.ok && res.data) {
      setData(res.data.items);
      setSummary(res.data.summary);
    }
  }, [view, cursor]);

  useEffect(() => { load(); }, [load]);

  const monthLabel = cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  function move(step: number) {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + step);
    else d.setDate(d.getDate() + step * 7);
    setCursor(d);
  }

  const byDate: Record<string, CalendarItem[]> = {};
  for (const it of data) {
    if (!it.date) continue;
    (byDate[it.date] = byDate[it.date] || []).push(it);
  }

  function renderItems(dateStr: string, max?: number) {
    const items = byDate[dateStr] || [];
    return items.slice(0, max ?? items.length).map((it) => {
      const m = TYPE_META[it.type] || TYPE_META.task;
      return (
        <div key={`${it.type}-${it.id}`} className={`text-[11px] px-1.5 py-0.5 rounded border truncate ${m.cls}`}>
          <i className={`fas ${m.icon} mr-1`}></i>{it.title}
        </div>
      );
    });
  }

  // Month grid
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7; // Monday first
  const today = new Date().toISOString().slice(0, 10);
  const cursorDateStr = cursor.toISOString().slice(0, 10);
  const weekNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Week view: 7 days starting from current week
  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => setCursor(new Date())}>Hari Ini</button>
          <div className="flex rounded-lg overflow-hidden border border-[#E8E4DC]">
            {(["day", "week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-semibold capitalize ${view === v ? "bg-[#0D7C66] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>{v}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="card mb-5">
        <div className="flex items-center justify-between p-4 border-b border-[#E8E4DC]">
          <button className="btn btn-outline btn-sm" onClick={() => move(-1)}><i className="fas fa-chevron-left"></i></button>
          <h3 className="font-bold text-gray-800 font-[Outfit]">{monthLabel}</h3>
          <button className="btn btn-outline btn-sm" onClick={() => move(1)}><i className="fas fa-chevron-right"></i></button>
        </div>

        {view === "month" && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekNames.map((w) => <div key={w} className="text-center text-xs font-semibold text-gray-400 py-1">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isToday = dateStr === today;
                const items = byDate[dateStr] || [];
                return (
                  <div key={d} className={`min-h-20 rounded-lg border p-1 ${isToday ? "border-[#0D7C66] bg-[#eefbf8]" : "border-[#E8E4DC] bg-white"}`}>
                    <div className={`text-xs font-semibold mb-1 ${isToday ? "text-[#0D7C66]" : "text-gray-500"}`}>{d}</div>
                    {renderItems(dateStr, 3)}
                    {items.length > 3 && <div className="text-[10px] text-gray-400 mt-1">+{items.length - 3} lainnya</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((dateStr) => {
                const d = new Date(dateStr + "T00:00:00");
                const isToday = dateStr === today;
                return (
                  <div key={dateStr} className={`rounded-lg border p-2 min-h-32 ${isToday ? "border-[#0D7C66] bg-[#eefbf8]" : "border-[#E8E4DC] bg-white"}`}>
                    <div className={`text-xs font-semibold mb-2 ${isToday ? "text-[#0D7C66]" : "text-gray-500"}`}>
                      {d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" })}
                    </div>
                    {renderItems(dateStr)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className="p-4">
            <div className="rounded-lg border border-[#E8E4DC] bg-white p-3">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                {cursor.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              {renderItems(cursorDateStr)}
              {(byDate[cursorDateStr] || []).length === 0 && <p className="text-xs text-gray-400">Tidak ada aktivitas hari ini</p>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-3"><i className="fas fa-tasks text-blue-500 text-xl"></i><div><p className="text-2xl font-bold">{summary.tasks}</p><p className="text-xs text-gray-500">Tasks</p></div></div>
        <div className="card flex items-center gap-3"><i className="fas fa-book-open text-amber-500 text-xl"></i><div><p className="text-2xl font-bold">{summary.journals}</p><p className="text-xs text-gray-500">Journal</p></div></div>
        <div className="card flex items-center gap-3"><i className="fas fa-clipboard-list text-purple-500 text-xl"></i><div><p className="text-2xl font-bold">{summary.plans}</p><p className="text-xs text-gray-500">Plans</p></div></div>
      </div>
    </div>
  );
}