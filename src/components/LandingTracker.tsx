"use client";

import { useEffect } from "react";
import { trackOnce, readUtm } from "@/lib/track-client";

export default function LandingTracker() {
  useEffect(() => {
    readUtm();
    trackOnce("landing_view", "landing");
  }, []);
  return null;
}