"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPut } from "@/lib/useApi";

function todayStr(): string {
  const d = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return d.toLocaleDateString("id-ID", opts);
}

export default function HeaderActions() {
  const [dark, setDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dateStr] = useState(todayStr);
  const [rowWrap, setRowWrap] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("headerRowMode");
    if (stored === "wrap" || stored === "scroll") {
      setRowWrap(stored === "wrap");
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("rowmode-wrap", rowWrap);
  }, [rowWrap]);

  function toggleRowMode() {
    const next = !rowWrap;
    setRowWrap(next);
    localStorage.setItem("headerRowMode", next ? "wrap" : "scroll");
  }

  useEffect(() => {
    apiGet<Record<string, string>>("/api/settings").then((r) => {
      loaded.current = true;
      if (r.ok && r.data?.dark_mode === "1") {
        setDark(true);
        document.body.classList.add("dark");
      }
    }).catch(() => {
      loaded.current = true;
    });
  }, []);

  const persistDark = useCallback((value: boolean) => {
    apiPut("/api/settings", { dark_mode: value ? "1" : "0" }).catch(() => {});
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    const icon = document.getElementById("darkIcon") as HTMLElement | null;
    if (icon) {
      icon.className = `fas ${dark ? "fa-sun" : "fa-moon"} text-sm`;
    }
    if (loaded.current) {
      persistDark(dark);
    }
  }, [dark, persistDark]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 hidden sm:block">{dateStr}</span>
      <button
        onClick={toggleRowMode}
        className="w-9 h-9 rounded-lg bg-white border border-[#E8E4DC] flex items-center justify-center text-gray-600 cursor-pointer md:hidden"
        title={rowWrap ? "Mode tombol: susun rapi (wrap)" : "Mode tombol: geser (scroll)"}
        aria-label="Ganti mode tombol header"
      >
        <i className={`fas ${rowWrap ? "fa-arrows-left-right" : "fa-grip-lines"} text-sm`}></i>
      </button>
      <button
        onClick={() => setDark(!dark)}
        className="w-9 h-9 rounded-lg bg-white border border-[#E8E4DC] flex items-center justify-center text-gray-600 cursor-pointer"
        title="Mode Gelap"
        aria-label="Mode Gelap"
      >
        <i id="darkIcon" className={`fas ${dark ? "fa-sun" : "fa-moon"} text-sm`}></i>
      </button>
      <div className="relative hidden md:block">
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="w-9 h-9 rounded-lg bg-white border border-[#E8E4DC] flex items-center justify-center text-gray-600 cursor-pointer relative"
        title="Notifikasi"
        aria-label="Notifikasi"
        aria-expanded={notifOpen}
      >
        <i className="fas fa-bell text-sm" aria-hidden="true"></i>
      </button>
      {notifOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] z-50 max-h-96 overflow-y-auto" role="menu">
          <div className="p-3 border-b border-[#E8E4DC] font-bold text-sm text-gray-800">
            Notifikasi
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-400 text-center py-4">
              Tidak ada notifikasi
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
