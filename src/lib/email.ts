const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Jurnal Guru <noreply@cintabuku.site>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://guru.cintabuku.site";

export function emailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

export async function sendVerificationEmail(to: string, nama: string, token: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:56px;height:56px;margin:0 auto 8px;border-radius:16px;
          background:linear-gradient(135deg,#0D7C66,#0A6352);display:flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-size:24px">&#127891;</span>
        </div>
        <h1 style="color:#1A2332;font-size:20px;margin:0">Jurnal Guru</h1>
      </div>
      <div style="background:#fff;border:1px solid #E8E4DC;border-radius:16px;padding:28px">
        <h2 style="color:#1A2332;font-size:17px;margin:0 0 8px">Konfirmasi Email Anda</h2>
        <p style="color:#4a5568;font-size:14px;line-height:1.6;margin:0 0 20px">
          Halo ${nama},<br/>
          Terima kasih telah mendaftar di Jurnal Guru. Klik tombol di bawah untuk
          mengaktifkan akun Anda. Link berlaku selama 24 jam.
        </p>
        <div style="text-align:center;margin:0 0 20px">
          <a href="${link}" style="display:inline-block;background:#0D7C66;color:#fff;
            padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">
            Aktifkan Akun
          </a>
        </div>
        <p style="color:#718096;font-size:12px;line-height:1.6;margin:0">
          Jika tombol tidak berfungsi, salin tautan ini ke browser:<br/>
          <span style="color:#0D7C66;word-break:break-all">${link}</span>
        </p>
      </div>
      <p style="color:#a0aec0;font-size:11px;text-align:center;margin-top:20px">
        &copy; ${new Date().getFullYear()} Jurnal Guru
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: "Aktifkan Akun Jurnal Guru Anda",
        html,
      }),
    });
    if (!res.ok) {
      console.error("[EMAIL ERROR]", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[EMAIL ERROR]", e);
    return false;
  }
}

export function generateVerifyToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function verifyTokenExpiry(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export async function sendInvoiceEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[EMAIL ERROR]", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[EMAIL ERROR]", e);
    return false;
  }
}