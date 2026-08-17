"use client";

import AdminGuard from "@/components/AdminGuard";
import DocumentationView from "@/components/DocumentationView";
import AuditCenterView from "@/components/AuditCenterView";

export default function DocumentationPageView({
  audits,
  auditsMd,
}: {
  audits: { name: string; date: string; sha: string; content: string }[];
  auditsMd: string;
}) {
  return (
    <AdminGuard>
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <DocumentationView audits={audits} />
          <AuditCenterView auditsMd={auditsMd} />
        </div>
      </div>
    </AdminGuard>
  );
}