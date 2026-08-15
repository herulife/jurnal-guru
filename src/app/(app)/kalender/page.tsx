"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/useApi";
import HeaderActions from "@/components/HeaderActions";
import TutorialLink from "@/components/TutorialLink";
import { useToast } from "@/components/Feedback";

interface Event { date: string; title: string; time: string; type: string; id?: string; }

const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const hariNames = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export default function KalenderPage() {
  const { show } = useToast();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<Event[]>([]);
  const [noteText, setNoteText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await apiGet<Event[]>(`/api/kalender?month=${month}&year=${year}`);
    if (res.ok && res.data) setEvents(res.data);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selectedDate) {
      setNotes(events.filter((e) => e.date === selectedDate && e.type === "catatan"));
    } else {
      setNotes([]);
    }
    setNoteText("");
    setEditingId(null);
  }, [selectedDate, events]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const evMap: Record<string, Event[]> = {};
  for (const ev of events) {
    if (!evMap[ev.date]) evMap[ev.date] = [];
    evMap[ev.date].push(ev);
  }

  async function handleSaveNote() {
    if (!selectedDate || !noteText.trim()) return;
    setSaving(true);
    setMsg("");
    const res = editingId
      ? await apiPut("/api/kalender", { id: editingId, isi: noteText.trim() })
      : await apiPost("/api/kalender", { tanggal: selectedDate, isi: noteText.trim() });
    setSaving(false);
    if (res.ok) {
      setMsg(res.msg || "Tersimpan");
      show(editingId ? "Catatan berhasil diperbarui" : "Catatan berhasil disimpan", "success");
      setNoteText("");
      setEditingId(null);
      load();
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(res.msg || "Gagal menyimpan");
      show(res.msg || "Gagal menyimpan catatan", "error");
    }
  }

  async function handleDeleteNote(id: string) {
    if (!window.confirm("Hapus catatan ini?")) return;
    const res = await apiDelete(`/api/kalender?id=${id}`);
    if (res.ok) {
      setMsg("Catatan dihapus");
      show("Catatan berhasil dihapus", "success");
      load();
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg(res.msg || "Gagal menghapus");
      show(res.msg || "Gagal menghapus catatan", "error");
    }
  }

  return (
    <div className="p-6 fade-in">
      <header className="sticky top-14 md:top-0 z-20 md:z-10 bg-[#F5F3EF]/80 backdrop-blur-lg border-b border-[#E8E4DC] -mx-6 px-6 py-3 flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-800 font-[Outfit]">Kalender Akademik</h1>
        <div className="flex items-center gap-2"><HeaderActions /></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
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
              const selected = dStr === selectedDate;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dStr)}
                  aria-label={`Tanggal ${dStr}`}
                  aria-pressed={selected}
                  className={`min-h-[80px] p-[6px] rounded-lg border text-xs text-left cursor-pointer transition-colors ${today ? "border-[#0D7C66] bg-[#eefbf8]" : "bg-white border-[#E8E4DC]"} ${selected ? "ring-2 ring-[#E8A317]" : "hover:border-[#0D7C66]/40"}`}
                >
                  <span className="font-bold text-gray-800 block mb-1">{day}</span>
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <span key={j} className={`block px-1 py-0.5 rounded mb-[2px] text-[10px] truncate ${ev.type === "jadwal" ? "bg-green-100 text-green-800" : ev.type === "absensi" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`} title={ev.title}>{ev.type === "catatan" ? <i className="fas fa-sticky-note mr-1"></i> : null}{ev.title}</span>
                  ))}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span><span className="inline-block w-3 h-3 rounded bg-green-100 align-middle mr-1"></span> Jadwal</span>
            <span><span className="inline-block w-3 h-3 rounded bg-blue-100 align-middle mr-1"></span> Absensi</span>
            <span><span className="inline-block w-3 h-3 rounded bg-amber-100 align-middle mr-1"></span> Catatan</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 font-[Outfit]">
              {selectedDate ? `Catatan ${selectedDate}` : "Catatan Tanggal"}
            </h3>
            <TutorialLink href="/panduan#lainnya" label="Panduan" />
          </div>
          <p className="text-xs text-gray-400 mb-4 mt-1">Klik tanggal di kalender untuk melihat & menambah catatan.</p>

          {!selectedDate && (
            <p className="text-sm text-gray-500">Pilih tanggal terlebih dahulu.</p>
          )}

          {selectedDate && (
            <>
              {msg && <p className="text-xs text-[#0D7C66] mb-3"><i className="fas fa-check-circle mr-1"></i>{msg}</p>}

              <textarea
                className="input min-h-[80px] mb-2"
                placeholder="Tulis catatan untuk tanggal ini…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex gap-2 mb-4">
                <button className="btn btn-primary btn-sm" onClick={handleSaveNote} disabled={saving || !noteText.trim()}>
                  {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-1"></i> {editingId ? "Perbarui" : "Simpan"}</>}
                </button>
                {editingId && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(null); setNoteText(""); }}>
                    Batal
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {notes.length === 0 && (
                  <p className="text-sm text-gray-400">Belum ada catatan untuk tanggal ini.</p>
                )}
                {notes.map((n) => (
                  <div key={n.id} className="bg-[#F5F3EF] rounded-lg p-3 border border-[#E8E4DC]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{n.title}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="text-[#0D7C66] text-xs bg-transparent border-none cursor-pointer hover:underline"
                        onClick={() => { setEditingId(n.id ?? null); setNoteText(n.title.replace("…", "")); }}
                      >
                        <i className="fas fa-edit mr-1"></i>Edit
                      </button>
                      <button
                        className="text-red-500 text-xs bg-transparent border-none cursor-pointer hover:underline"
                        onClick={() => n.id && handleDeleteNote(n.id)}
                      >
                        <i className="fas fa-trash mr-1"></i>Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}