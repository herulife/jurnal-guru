import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/", "/login", "/register", "/checkout", "/api/auth/login", "/api/auth/register", "/api/auth/check"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // Security headers untuk semua response
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return res;
  }

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
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js)$).*)"],
};
