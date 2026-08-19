import { getSession } from "@/lib/auth";
import { trackEvent, TRACK_EVENTS } from "@/lib/tracking";
import { events } from "@/db/schema";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { apiOk, apiError } from "@/lib/utils";

export async function POST(req: Request) {
  let body: { event?: string; meta?: Record<string, unknown>; utm?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return apiError("Body tidak valid");
  }

  const event = body.event;
  if (!event || !TRACK_EVENTS.includes(event as (typeof TRACK_EVENTS)[number])) {
    return apiError("Event tidak valid");
  }

  const session = await getSession();

  const meta: Record<string, unknown> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const v = body.utm?.[key];
    if (typeof v === "string" && v.length <= 100) meta[key] = v;
  }
  if (body.meta && typeof body.meta === "object") {
    for (const [k, v] of Object.entries(body.meta)) {
      if (typeof v === "string" && v.length <= 200 && k.length <= 40) {
        meta[k] = v;
      }
    }
  }

  await trackEvent(event, { userId: session?.id, meta });
  return apiOk({ ok: true });
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return apiError("Unauthorized", 401);
  if (session.role !== "admin") return apiError("Forbidden", 403);

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);

  const rows = await db
    .select()
    .from(events)
    .orderBy(desc(events.timestamp))
    .limit(limit)
    .all();

  return apiOk({
    events: rows.map((r) => ({
      event: r.event,
      timestamp: r.timestamp,
      userId: r.userId,
      meta: r.meta ? JSON.parse(r.meta) : null,
    })),
  });
}
