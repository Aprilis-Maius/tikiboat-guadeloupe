import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes : jamais touchées par intl
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Page de login : accessible sans token
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    // Toutes les autres pages/API admin : token requis
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Pages publiques : routing i18n next-intl
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
