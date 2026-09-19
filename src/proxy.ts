import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protects dashboard routes by checking for the HttpOnly access-token
 * cookie set by the backend on login. Full validation still happens
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

  // For protected routes, check for the auth cookie. The JWT itself is
  // HttpOnly — JS never sees it — but the cookie is visible to this
  // server-side function, so no separate marker cookie is needed.
  // Namespaced cookie name — must match backend AUTH_COOKIE_ACCESS_NAME.
  // The host is shared with other apps; a generic "access_token" name
  // would collide with their session cookies.
  const hasToken = !!request.cookies.get("cp_access")?.value;

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
