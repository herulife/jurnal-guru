export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return null;
}

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return !!p && p.length >= 10 && p.length <= 15;
}

export async function sendWaNotification(phone: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.error("[WA SEND SKIP] FONNTE_TOKEN belum di-set di environment");
    return false;
  }
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: phone, message }),
    });
    const json = (await res.json().catch(() => null)) as { status?: unknown; reason?: string } | null;
    if (!res.ok || !json || json.status !== true) {
      console.error("[WA SEND FAIL]", json?.reason || `HTTP ${res.status}`, { phone });
      return false;
    }
    return true;
  } catch (e) {
    console.error("[WA SEND ERROR]", e);
    return false;
  }
}