"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b border-[#E8E4DC] shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <div>
              <p className={`font-bold text-sm leading-tight transition-colors ${scrolled ? "text-[#1A2332]" : "text-white"}`}>Jurnal Guru</p>
              <p className={`text-[10px] leading-tight transition-colors ${scrolled ? "text-gray-400" : "text-white/60"}`}>Administrasi Guru &amp; Kelas</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#fitur" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#0D7C66]" : "text-white/90 hover:text-white"}`}>
              Fitur
            </Link>
            <Link href="#harga" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#0D7C66]" : "text-white/90 hover:text-white"}`}>
              Harga
            </Link>
            <Link href="/login" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#0D7C66]" : "text-white/90 hover:text-white"}`}>
              Masuk
            </Link>
            <Link href="/register" className="bg-[#0D7C66] hover:bg-[#0A6352] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg">
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600" : "text-white/90"}`}>
              Masuk
            </Link>
            <Link href="/register" className="bg-[#0D7C66] hover:bg-[#0A6352] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
