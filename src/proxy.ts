// Redirects locale-less paths (/login → /fr/login or /en/login, from the locale cookie or
// Accept-Language) and passes the locale to server components.
export { intlayerProxy as proxy } from "next-intlayer/proxy";

export const config = {
  // Skip API routes (Better Auth, companies), the /code dev helper, Next internals and static files.
  matcher: "/((?!api|code|_next|.*\\..*).*)",
};
