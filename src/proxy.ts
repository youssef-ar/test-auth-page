import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { intlayerProxy } from "next-intlayer/proxy";
import { LOCALES } from "@/lib/i18n";

// Redirects locale-less paths (/login → /fr/login or /en/login, from the locale cookie or
// Accept-Language) and passes the locale to server components.
const PROTECTED = new RegExp(`^/(${LOCALES.join("|")})/dashboard(/|$)`);

export function proxy(request: NextRequest) {
  // Optimistic check: without a session cookie there is no point rendering the protected page.
  // The page itself still validates the session on the server.
  const match = request.nextUrl.pathname.match(PROTECTED);
  if (match && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL(`/${match[1]}/login`, request.url));
  }
  return intlayerProxy(request);
}

export const config = {
  // Skip API routes (Better Auth, companies), the /code dev helper, Next internals and static files.
  matcher: "/((?!api|code|_next|.*\\..*).*)",
};
