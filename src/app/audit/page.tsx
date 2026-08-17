import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0D7C66] to-[#0A6352] flex items-center justify-center">
          <i className="fas fa-file-shield text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A2332] mb-2">Application Audit</h1>
        <p className="text-sm text-gray-500 mb-6">
          Dokumen audit lengkap aplikasi. Klik tombol di bawah untuk membuka.
        </p>
        <Link
          href="/audit-90aee5e"
          className="btn btn-primary w-full justify-center"
        >
          <i className="fa-solid fa-arrow-right mr-2" />
          Buka Audit
        </Link>
      </div>
    </div>
  );
}