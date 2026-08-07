"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/useApi";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/api/auth/login", { username, password });
      if (!res.ok) {
        setError(res.msg || "Login gagal");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Koneksi gagal");
    } finally {
      setLoading(false);
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
        <div className="relative z-10 text-center px-12">
          <img 
            src="/login-illustration.png" 
            alt="Login Illustration" 
            className="w-full max-w-md mx-auto mb-8 drop-shadow-2xl"
          />
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
                <label className="label">Username</label>
                <div className="flex items-center border-2 border-[#E8E4DC] rounded-xl focus-within:border-[#0D7C66] focus-within:shadow-[0_0_0_3px_rgba(13,124,102,0.12)] transition-all bg-white">
                  <div className="pl-3.5 text-gray-400">
                    <i className="fas fa-user text-sm"></i>
                  </div>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="label">Password</label>
                <div className="flex items-center border-2 border-[#E8E4DC] rounded-xl focus-within:border-[#0D7C66] focus-within:shadow-[0_0_0_3px_rgba(13,124,102,0.12)] transition-all bg-white">
                  <div className="pl-3.5 text-gray-400">
                    <i className="fas fa-lock text-sm"></i>
                  </div>
                  <input
                    type="password"
                    className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-600 text-sm text-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>{error}
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
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            <i className="fas fa-shield-halved mr-1 text-[#0D7C66]"></i>
            Login aman & terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
}
