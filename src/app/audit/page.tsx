import AuditFullReport from "@/components/AuditFullReport";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Audit — Jurnal Guru",
  description: "Full technical audit of Jurnal Guru + MarketingOS — 20 Agustus 2026",
};

export default function AuditPage() {
  return <AuditFullReport />;
}
