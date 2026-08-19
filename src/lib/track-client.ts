"use client";

import { TRACK_EVENTS, type TrackEventName } from "@/lib/tracking";

const UTM_COOKIE = "jg_utm";
const SEEN_KEY = "jg_track_seen";

export function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const v = url.searchParams.get(key);
    if (v) utm[key] = v;
  }
  if (Object.keys(utm).length > 0) {
    try {
      document.cookie = `${UTM_COOKIE}=${encodeURIComponent(JSON.stringify(utm))}; path=/; max-age=2592000`;
    } catch {
      // cookie diblokir — abaikan
    }
  }
  return utm;
}

export function getUtmCookie(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const m = document.cookie.match(new RegExp(`(?:^|; )${UTM_COOKIE}=([^;]*)`));
  if (!m) return {};
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return {};
  }
}

export async function track(
  event: TrackEventName,
  meta: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta, utm: getUtmCookie() }),
    });
  } catch {
    // tracking tidak boleh mengganggu alur utama
  }
}

export function trackOnce(
  event: TrackEventName,
  key: string,
  meta: Record<string, unknown> = {}
): void {
  let seen: Record<string, number> = {};
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    // simpan ulang dari kosong
  }
  const now = Date.now();
  if (seen[key] && now - seen[key] < 6 * 3600 * 1000) return;
  seen[key] = now;
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // storage penuh — abaikan
  }
  void track(event, meta);
}

export { TRACK_EVENTS };
