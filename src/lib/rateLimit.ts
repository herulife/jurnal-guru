type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function ipOf(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimited(req: Request): { limited: boolean; remaining: number } {
  const now = Date.now();
  const key = `${ipOf(req)}:${new URL(req.url).pathname}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, remaining: MAX_ATTEMPTS - 1 };
  }

  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    return { limited: true, remaining: 0 };
  }
  return { limited: false, remaining: MAX_ATTEMPTS - bucket.count };
}
