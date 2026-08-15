"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/useApi";
import { useToast } from "@/components/Feedback";
import DashboardMockup from "@/components/DashboardMockup";

export default function LoginPage() {
  const { show } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const v = searchParams.get("verify") || searchParams.get("activated");
    if (v === "activated" || v === "1") {
      setNotice("Akun Anda telah aktif. Silakan masuk.");
    } else if (v === "expired") {
      setNotice("Link aktivasi telah kedaluwarsa. Kirim ulang link di bawah.");
    } else if (v === "invalid" || v === "fail") {
      setNotice("Link aktivasi tidak valid.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await apiPost("/api/auth/login", { username: email, password });
      if (!res.ok) {
        setError(res.msg || "Login gagal");
        show(res.msg || "Login gagal", "error");
        return;
      }
      show("Login berhasil", "success");
      router.push("/dashboard");
    } catch {
      setError("Koneksi gagal");
      show("Koneksi gagal", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Masukkan email Anda terlebih dahulu.");
      return;
    }
    setResending(true);
    setError("");
    setNotice("");
    try {
      const res = await apiPost("/api/auth/resend-verification", { email });
      setNotice(res.msg || (res.ok ? "Link aktivasi telah dikirim." : "Gagal mengirim."));
      if (res.ok) {
        show(res.msg || "Link aktivasi telah dikirim", "success");
      } else {
        show(res.msg || "Gagal mengirim link aktivasi", "error");
      }
    } catch {
      setNotice("Koneksi gagal. Coba lagi.");
      show("Koneksi gagal. Coba lagi.", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex">
      <style>{`
        @keyframes gs {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#1A2332 0%,#0A4038 40%,#0D7C66 70%,#1A2332 100%)",
          backgroundSize: "400% 400%",
          animation: "gs 12s ease infinite",
        }}
      >
        <div className="absolute inset-0 bg-[#E8A317]/10 rounded-full blur-3xl w-96 h-96 -top-20 -left-20"></div>
        <div className="absolute inset-0 bg-[#0D7C66]/30 rounded-full blur-3xl w-96 h-96 -bottom-20 -right-20"></div>
        <div className="relative z-10 text-center px-12 w-full">
          <div className="max-w-md mx-auto mb-8">
            <DashboardMockup />
          </div>
          <h2 className="text-3xl font-bold text-white font-[Outfit] mb-4">
            Selamat Datang di Jurnal Guru
          </h2>
          <p className="text-white/70 text-lg">
            Kelola administrasi guru lebih mudah dan cepat
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="fas fa-graduation-cap text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 font-[Outfit]">
              Jurnal Guru
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Masuk ke dashboard Anda
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E8E4DC]">
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="label">Email atau Username</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true"></i>
                  <input
                    type="text"
                    inputMode="email"
                    name="email"
                    autoComplete="username"
                    className="input pl-10 w-full text-sm"
                    placeholder="Masukkan email atau username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="label">Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true"></i>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    className="input pl-10 w-full text-sm"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mb-6">
                <Link href="/faq" className="text-sm text-[#0D7C66] hover:underline">
                  Lupa password?
                </Link>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-600 text-sm text-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>{error}
                  </p>
                </div>
              )}
              {notice && (
                <div className={`rounded-xl p-3 mb-4 ${notice.includes("tidak valid") ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
                  <p className={`text-sm text-center ${notice.includes("tidak valid") ? "text-yellow-700" : "text-green-700"}`}>
                    <i className={`fas ${notice.includes("tidak valid") ? "fa-triangle-exclamation" : "fa-circle-check"} mr-2`}></i>{notice}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center text-base py-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Masuk
                  </>
                )}
              </button>
              {(error.includes("belum dikonfirmasi") || notice.includes("kedaluwarsa")) && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full justify-center text-sm text-[#0D7C66] font-semibold mt-4 hover:underline"
                >
                  {resending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0D7C66]/30 border-t-[#0D7C66] rounded-full animate-spin inline-block mr-2 align-middle"></div>
                      Mengirim ulang...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>Kirim ulang link aktivasi
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            <i className="fas fa-shield-halved mr-1 text-[#0D7C66]"></i>
            Login aman & terenkripsi
          </p>

          <p className="text-center text-gray-500 text-sm mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#0D7C66] font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
