"use client";

import { useEffect, useRef, useState } from "react";

type Event = { id: string; icon: string; title: string; sub: string };

export default function SocialProofToast() {
  const [current, setCurrent] = useState<Event | null>(null);
  const [queue, setQueue] = useState<Event[]>([]);
  const [visible, setVisible] = useState(false);
  const lastId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/social-proof", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!json.ok || !alive) return;
        const events: Event[] = (json.data?.events || []).filter((e: Event) => e.id !== lastId.current);
        if (events.length) setQueue((q) => [...q, ...events]);
      } catch {
        /* jaringan terputus — abaikan */
      }
    }

    load();
    const iv = setInterval(load, 45000);
    return () => {
      alive = false;
      clearInterval(iv);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (current || !queue.length) return;
    const next = queue[0];
    setCurrent(next);
    setQueue((q) => q.slice(1));
    lastId.current = next.id;
    setVisible(true);
    timer.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setCurrent(null), 500);
    }, 7000);
  }, [queue, current]);

  if (!current) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs print-hidden">
      <div
        className={`flex items-start gap-3 bg-[#1A2332] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3.5 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#E8A317] to-[#ca8a04] flex items-center justify-center">
          <i className={`fas ${current.icon} text-[#1A2332] text-sm`}></i>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-snug text-gray-100">{current.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 fp-dot"></span> {current.sub}
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => setCurrent(null), 500);
          }}
          className="ml-1 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Tutup notifikasi"
        >
          <i className="fas fa-xmark text-xs"></i>
        </button>
      </div>
    </div>
  );
}