import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/", "/login", "/register", "/checkout", "/audit", "/audit/full", "/audit/register", "/api/auth/login", "/api/auth/register", "/api/auth/check", "/api/auth/verify-email", "/api/auth/resend-verification", "/api/health", "/api/track"];

const protectedPrefixes = [
  "/dashboard", "/absensi", "/admin", "/billing", "/faq", "/jadwal", "/jurnal",
  "/kalender", "/kelas", "/kelompok", "/lckh", "/lkb", "/log", "/marketing-plan",
  "/nilai", "/panduan", "/profil", "/rekap-absensi", "/rekap-nilai", "/settings",
  "/siswa", "/subscription", "/surat", "/users", "/api/",
];

const adminPrefixes = ["/admin", "/users", "/billing", "/log", "/marketing-plan", "/marketing-dashboard", "/goals", "/plans", "/tasks", "/marketing-calendar", "/marketing-journal"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  const isPublic = publicPaths.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));
  if (isPublic) return res;

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return res;

  if (session) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ ok: false, msg: "Server misconfigured" }, { status: 500 });
      }
      const url = new URL("/login", request.url);
      url.searchParams.set("returnUrl", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
    try {
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(session, key, { algorithms: ["HS256"] });

      const isAdmin = adminPrefixes.some((p) => pathname.startsWith(p));
      if (isAdmin && String(payload.role ?? "").toLowerCase() !== "admin") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ ok: false, msg: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return res;
    } catch {
      // token invalid/expired — fall through to redirect
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, msg: "Unauthorized" }, { status: 401 });
  }
  const url = new URL("/login", request.url);
  url.searchParams.set("returnUrl", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|txt|xml|json)$).*)"],
};
