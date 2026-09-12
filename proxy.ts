import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protects dashboard routes by checking for an access token.
 * Since JWT is stored in localStorage (client-side), the proxy
 * can only check for the token's presence — full validation happens
 * client-side in the dashboard layout.
 *
 * Public routes: /, /login, /register, /forgot-password, /reset-password
 */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "?"))) {
    return NextResponse.next();
  }

  // Allow static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For protected routes, check for token cookie.
  // The frontend stores JWT in localStorage, which proxy cannot read.
  // We set a non-sensitive marker cookie on login to allow proxy-level gating.
  const hasToken = request.cookies.get("has_access_token")?.value === "true";

  if (!hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
