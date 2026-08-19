"use client";

import { useEffect, useState } from "react";

const notifications = [
  { action: "Catat absensi siswa dalam 10 detik per kelas" },
  { action: "Rekap nilai & KKM otomatis, tanpa hitung manual" },
  { action: "Jurnal mengajar tersusun rapi per pertemuan" },
  { action: "Data siswa terpusat, cepat dicari" },
  { action: "Template surat sekolah siap pakai" },
  { action: "Kelompok belajar dibuat otomatis" },
  { action: "Jadwal mengajar tampil dalam satu kalender" },
  { action: "LCKH & LKB bisa dibuat dari dashboard" },
];

const stats = [
  { label: "Gratis Selamanya", value: "Rp0" },
  { label: "Catat Kehadiran", value: "10 detik" },
  { label: "Siap Dipakai", value: "6+ fitur" },
];

export default function SocialProof() {
  const [current, setCurrent] = useState(0);
  const [show, setShow] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Show first tip after 5 seconds
    const timer1 = setTimeout(() => setShow(true), 5000);

    // Show stats after 3 seconds
    const timer2 = setTimeout(() => setShowStats(true), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    if (!show) return;

    // Hide after 4 seconds, then show next
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % notifications.length);
        setShow(true);
      }, 2000);
    }, 4000);

    return () => clearTimeout(hideTimer);
  }, [show, current]);

  const n = notifications[current];

  return (
    <>
      {/* Stats bar - top of page */}
      {showStats && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A2332]/95 backdrop-blur border-t border-white/10 py-3 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 md:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[#E8A317] font-bold text-lg md:text-xl">{s.value}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip popup */}
      <div
        className={`fixed bottom-20 left-4 z-50 bg-white rounded-xl shadow-lg border border-[#E8E4DC] p-3 flex items-center gap-3 max-w-xs transition-all duration-500 ${
          show
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="w-9 h-9 bg-[#0D7C66] rounded-full flex items-center justify-center text-white flex-shrink-0">
          <i className="fas fa-lightbulb text-sm"></i>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[#1A2332]">
            <span className="font-bold">Tip Cepat</span>
          </p>
          <p className="text-xs text-gray-500">{n.action}</p>
        </div>
      </div>
    </>
  );
}