import fs from "fs";
import path from "path";
import AuditTabs from "@/components/AuditTabs";

export const dynamic = "force-dynamic";

export default function AuditPage() {
  let report = "";
  try {
    report = fs.readFileSync(
      path.join(process.cwd(), ".agents", "sales-readiness-audit.md"),
      "utf8"
    );
  } catch {
    report = "# SALES READINESS FINAL AUDIT\n\n(Belum ada laporan — jalankan audit dulu.)";
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="mx-auto max-w-4xl">
        <AuditTabs report={report} />
      </div>
    </div>
  );
}