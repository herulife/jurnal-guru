"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((r) => {
        if (r.ok && r.data?.user?.role === "Admin") setOk(true);
        else router.replace("/dashboard");
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  if (!ok) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-[#0D7C66]/20 border-t-[#0D7C66] rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}