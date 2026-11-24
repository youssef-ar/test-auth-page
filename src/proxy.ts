import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { intlayerProxy } from "next-intlayer/proxy";
import { auth } from "@/lib/auth";
import { LOCALES } from "@/lib/i18n";

// Redirects locale-less paths (/login → /fr/login or /en/login, from the locale cookie or
// Accept-Language) and passes the locale to server components.
const LOCALE_GROUP = `(${LOCALES.join("|")})`;
const PROTECTED = new RegExp(`^/${LOCALE_GROUP}/dashboard(/|$)`);
const SIGN_IN = new RegExp(`^/${LOCALE_GROUP}/login/?$`);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  // Optimistic check: without a session cookie there is no point rendering the protected page.
  // The page itself still validates the session on the server.
  const protectedMatch = pathname.match(PROTECTED);
  if (protectedMatch && !hasSessionCookie) {
    return NextResponse.redirect(new URL(`/${protectedMatch[1]}/login`, request.url));
  }


  const signInMatch = pathname.match(SIGN_IN);
  if (signInMatch && hasSessionCookie && (await auth.api.getSession({ headers: request.headers }))) {
    return NextResponse.redirect(new URL(`/${signInMatch[1]}/dashboard`, request.url));
  }

  return intlayerProxy(request);
}

export const config = {
  // Skip API routes (Better Auth, companies), the /code dev helper, Next internals and static files.
  matcher: "/((?!api|code|_next|.*\\..*).*)",
};
