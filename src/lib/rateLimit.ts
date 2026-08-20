import { readFileSync, writeFileSync, existsSync } from "fs";

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const PERSIST_FILE = process.env.RATE_LIMIT_FILE || "/tmp/jg_rate_limits.json";

let buckets: Map<string, Bucket> = new Map();

function loadFromDisk() {
  try {
    if (existsSync(PERSIST_FILE)) {
      const raw = readFileSync(PERSIST_FILE, "utf-8");
      const entries: [string, Bucket][] = JSON.parse(raw);
      buckets = new Map(entries);
    }
  } catch {
    buckets = new Map();
  }
}

function saveToDisk() {
  try {
    const entries = Array.from(buckets.entries());
    writeFileSync(PERSIST_FILE, JSON.stringify(entries));
  } catch {
    // ignore write errors
  }
}

// load on startup
loadFromDisk();

// periodic cleanup every 60s
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
      changed = true;
    }
  }
  if (changed) saveToDisk();
}, 60_000);

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
    saveToDisk();
    return { limited: false, remaining: MAX_ATTEMPTS - 1 };
  }

  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    saveToDisk();
    return { limited: true, remaining: 0 };
  }
  saveToDisk();
  return { limited: false, remaining: MAX_ATTEMPTS - bucket.count };
}
