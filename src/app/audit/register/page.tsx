import AuthSecurityAudit from "@/components/AuthSecurityAudit";

export const metadata = {
  title: "Auth Security Audit — Jurnal Guru",
  description: "Audit keamanan sistem akun & autentikasi Jurnal Guru — berdasarkan review kode aktual",
};

export default function AuthAuditRegisterPage() {
  return <AuthSecurityAudit />;
}
