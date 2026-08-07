import { createPrivateKey, sign } from "node:crypto";

type ServiceAccountConfig = {
  client_email: string;
  private_key: string;
};

function getServiceAccount(): ServiceAccountConfig | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        return { client_email: parsed.client_email, private_key: parsed.private_key };
      }
    } catch {
      /* fallthrough */
    }
  }
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (email && key) return { client_email: email, private_key: key };
  return null;
}

const TOKEN_URI = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type Token = { access_token: string; expires_at: number };
let cachedToken: Token | null = null;

function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token;
  }
  const cfg = getServiceAccount();
  if (!cfg) throw new Error("Service account tidak dikonfigurasi (GOOGLE_SERVICE_ACCOUNT_JSON)");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: cfg.client_email,
      scope: SCOPE,
      aud: TOKEN_URI,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claim}`;
  const key = createPrivateKey({ key: cfg.private_key, format: "pem", type: "pkcs8" });
  const sig = sign("RSA-SHA256", Buffer.from(signingInput), key);
  const jwt = `${signingInput}.${base64url(sig)}`;

  const res = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`Gagal dapat token Google: ${data.error || res.status} ${data.error_description || ""}`);
  }
  cachedToken = { access_token: data.access_token, expires_at: now * 1000 + 3600 * 1000 };
  return data.access_token;
}

function extractSpreadsheetId(input: string): string {
  const t = input.trim();
  // fully-solved URL
  const m = t.match(/\/d\/([\w-]+)/);
  if (m) return m[1];
  // raw ID
  if (/^[\w-]{20,}$/.test(t)) return t;
  throw new Error("Format ID spreadsheet tidak valid");
}

function quoteSheetTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

async function listSheets(accessToken: string, spreadsheetId: string): Promise<{ sheetId: number; title: string }[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    throw new Error(`Spreadsheet tidak dapat diakses (${res.status}). Pastikan user sudah share ke service account.`);
  }
  const data = (await res.json()) as { sheets?: { properties?: { sheetId?: number; title?: string } }[] };
  return (data.sheets || [])
    .map((s) => ({ sheetId: s.properties?.sheetId ?? 0, title: s.properties?.title || "" }))
    .filter((s) => s.title);
}

async function ensureSheet(accessToken: string, spreadsheetId: string, title: string): Promise<void> {
  const sheets = await listSheets(accessToken, spreadsheetId);
  if (sheets.some((s) => s.title === title)) return;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    }
  );
  if (!res.ok) {
    const e = await res.text();
    throw new Error(`Gagal membuat sheet "${title}" (${res.status}): ${e}`);
  }
}

/**
 * Tulis array 2D ke spreadsheet pada sheet sesuai `title` (dibuat otomatis bila belum ada).
 */
export async function writeToSpreadsheet(
  spreadsheetUrl: string,
  title: string,
  rows: (string | number)[][]
): Promise<{ ok: boolean; msg: string }> {
  try {
    const accessToken = await getAccessToken();
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    await ensureSheet(accessToken, spreadsheetId, title);

    const ref = quoteSheetTitle(title);
    const head = rows[0] || [];
    const lastCol = String.fromCharCode(65 + Math.max(head.length - 1, 0));
    const range = `${ref}!A1:${lastCol}${rows.length || 1}`;

    const values = rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c))));
    // clear lalu tulis
    const clearRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!clearRes.ok) throw new Error(`Gagal membersihkan sheet (${clearRes.status})`);
    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values, majorDimension: "ROWS" }),
      }
    );
    if (!writeRes.ok) {
      const e = await writeRes.text();
      throw new Error(`Gagal menulis (${writeRes.status}): ${e}`);
    }
    return { ok: true, msg: `"${title}" tersinkron (${values.length} baris)` };
  } catch (e: unknown) {
    return { ok: false, msg: e instanceof Error ? e.message : "Gagal sinkronisasi" };
  }
}

export function getServiceAccountEmail(): string | null {
  return getServiceAccount()?.client_email ?? null;
}