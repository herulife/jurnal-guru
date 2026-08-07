"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/useApi";

interface Event { date: string; title: string; time: string; type: string; }

const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const hariNames = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export default function KalenderPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<Event[]>([]);

  const load = useCallback(async () => {
    const res = await apiGet<Event[]>(`/api/kalender?month=${month}&year=${year}`);
    if (res.ok && res.data) setEvents(res.data);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const evMap: Record<string, Event[]> = {};
  for (const ev of events) {
    if (!evMap[ev.date]) evMap[ev.date] = [];
    evMap[ev.date].push(ev);
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-0 z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Kalender Akademik</h1>
      </header>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-gray-800 font-[Outfit]">Kalender Akademik</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(m => m - 1); }}><i className="fas fa-chevron-left"></i></button>
            <span className="font-bold text-sm w-36 text-center">{months[month - 1]} {year}</span>
            <button className="btn btn-outline btn-sm" onClick={() => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(m => m + 1); }}><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-[2px]">
          {hariNames.map((h) => (
            <div key={h} className="p-2 text-center text-xs font-semibold text-gray-500">{h}</div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const day = i - firstDay + 1;
            if (i < firstDay || day > daysInMonth) return <div key={i} className="kal-day other p-2 rounded-lg bg-white/50" />;
            const dStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const today = dStr === todayStr;
            const dayEvents = evMap[dStr] || [];
            return (
              <div key={i} className={`min-h-[80px] p-[6px] rounded-lg border text-xs ${today ? "border-[#0D7C66] bg-[#eefbf8]" : "bg-white border-[#E8E4DC]"}`}>
                <span className="font-bold text-gray-800 block mb-1">{day}</span>
                {dayEvents.slice(0, 3).map((ev, j) => (
                  <span key={j} className={`block px-1 py-0.5 rounded mb-[2px] text-[10px] cursor-pointer truncate ${ev.type === "jadwal" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`} title={`${ev.title} (${ev.time})`}>{ev.title}</span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span><span className="inline-block w-3 h-3 rounded bg-green-100 align-middle mr-1"></span> Jadwal</span>
          <span><span className="inline-block w-3 h-3 rounded bg-blue-100 align-middle mr-1"></span> Absensi</span>
        </div>
      </div>
    </div>
  );
}
