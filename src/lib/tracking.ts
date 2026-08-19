import { v4 as uuidv4 } from "uuid";
import { events } from "@/db/schema";
import { db } from "@/db";

export const TRACK_EVENTS = [
  "landing_view",
  "register_started",
  "register_completed",
  "checkout_viewed",
  "payment_created",
  "payment_proof_submitted",
  "payment_approved",
] as const;

export type TrackEventName = (typeof TRACK_EVENTS)[number];

export async function trackEvent(
  event: string,
  opts: { userId?: string | null; meta?: Record<string, unknown> | null } = {}
) {
  try {
    await db.insert(events).values({
      id: uuidv4(),
      event,
      timestamp: new Date().toISOString(),
      userId: opts.userId || null,
      meta: opts.meta ? JSON.stringify(opts.meta) : null,
    });
  } catch (e: unknown) {
    console.error("Failed to write tracking event:", e);
  }
}
