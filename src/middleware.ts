import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/", "/login", "/register", "/checkout", "/api/auth/login", "/api/auth/register", "/api/auth/check", "/api/health"];

const protectedPrefixes = [
  "/dashboard", "/absensi", "/admin", "/billing", "/faq", "/jadwal", "/jurnal",
  "/kalender", "/kelas", "/kelompok", "/lckh", "/lkb", "/log", "/marketing-plan",
  "/nilai", "/panduan", "/profil", "/rekap-absensi", "/rekap-nilai", "/settings",
  "/siswa", "/subscription", "/surat", "/users", "/api/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // Security headers untuk semua response
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  const isPublic = publicPaths.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));
  if (isPublic) return res;

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return res; // rute tak dikenal -> Next.js 404 (bukan redirect login)

  if (session) {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      try {
        const key = new TextEncoder().encode(secret);
        await jwtVerify(session, key, { algorithms: ["HS256"] });
        return res;
      } catch {
        // token invalid/expired — lanjut ke redirect login
      }
    } else {
      return res;
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