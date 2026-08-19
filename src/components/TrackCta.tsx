"use client";

import Link from "next/link";
import { track } from "@/lib/track-client";

export default function TrackCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => void track("register_started")}
    >
      {children}
    </Link>
  );
}