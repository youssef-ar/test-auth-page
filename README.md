# Stolos — authentication exercise

Starter for the front-end exercise. The back end is ready: you build the screens from the Figma file on top of it.

Stack: Next.js (App Router), Better Auth, Prisma + PostgreSQL, Tailwind. `react-hook-form` and `@tanstack/react-query` are installed.

## Implementation — the "Flottes" assignment

Everything below the next section is the starter's reference (setup, test accounts, auth API); this section describes what was built on top of it.

### Run and check

```bash
bun install
cp .env.example .env
bun run db:setup     # Postgres on 5433, migrations, test accounts
bun run dev          # must run on port 3000: Better Auth only trusts BETTER_AUTH_URL (INVALID_ORIGIN otherwise)
```

Open <http://localhost:3000/login> and keep **`/code`** open in another tab for the app codes, email codes, recovery codes and reset links. `bun run db:seed` resets the test accounts at any time.

```bash
bun run lint && bun run typecheck && bun run test && bun run build
```

### Routes

Every page exists in French and English (`/fr/…`, `/en/…`); a path without a locale (`/login`) is redirected by the proxy using the locale cookie or `Accept-Language`.

| Path | Screen |
|---|---|
| `/`, `/{locale}` | Redirects to the sign-in page |
| `/{locale}/login` | One card with the Connexion / Inscription tabs (no reload), then the verification screen, then the recovery-code screen |
| `/{locale}/forgot-password` | Email form, then "Vérifiez votre boîte courriel" with "Renvoyer le lien" |
| `/{locale}/reset-password` | New password from the emailed link (`?token=…`); clear message when the link is expired or used (`?error=INVALID_TOKEN`, or `INVALID_TOKEN` on submit) |
| `/{locale}/email` | Preview of the latest password-reset email, in the Figma template |
| `/{locale}/dashboard` | Protected page showing who is signed in and their second-step methods, with sign-out |
| `/{locale}/<anything else>` | Localized 404 |
| `/api/companies?locale=` | Content of the company cards in the background (name, description, sectors, status) |

### How each requirement is met

| Requirement (brief) | Where / how |
|---|---|
| `/login`, `/fr/login`, `/en/login` | Intlayer `prefix-all` routing; `src/proxy.ts` hands locale-less paths to `intlayerProxy`, which redirects |
| Sign-in and sign-up in one card, no reload | `login-screen.tsx`: tab state in React, both panels stay mounted so typed values survive a tab switch; accessible tabs (`components/ui/tabs.tsx`); React Hook Form + Zod; TanStack Query mutations |
| Verification adapts to the account | `verification-code-step.tsx` derives a variant from the `twoFactorMethods` returned at sign-in: app only → app code; app + email → extra "Envoyer un code par courriel" link (either code then works); email only → a code is sent on arrival, once (guarded against Strict Mode and reloads) |
| 30 s resend countdown, correct after a reload | `use-cooldown.ts` stores the **deadline** (a timestamp) in `localStorage`, so the remaining time is recomputed after a reload and shared by every tab; a 429's `X-Retry-After` replaces the default. The verification step itself is kept in `sessionStorage` (`mfa-session.ts`, 10 min like Better Auth's attempt), so a reload neither loses the screen nor sends a second code |
| Six-box code input | `components/ui/otp-input.tsx`: a pasted code fills the six boxes whichever box was clicked, typing advances, Backspace/arrows work, the sixth digit submits; the boxes are cleared after a failed attempt |
| Recovery code, then back to the code | `recovery-code-step.tsx`; the current view is part of the stored MFA step, so going back and forth sends no new email |
| Forgot password, confirmation, reset, expired or used link | `forgot-password-form.tsx`, `link-sent-step.tsx`, `reset-password-flow.tsx`. The link is checked by Better Auth when opened (`?error=INVALID_TOKEN`) and again on submit (`INVALID_TOKEN`); both show the same "invalid link" screen. The link returns to the reset page in the language it was requested in |
| Email visible at `/email` | `app/[locale]/email/page.tsx` (server component) reads the latest `DevMail` reset link with Prisma |
| Signed-in page, not reachable signed out | `proxy.ts` redirects when there is no session cookie (optimistic, a real 307); `server/session.ts` validates the session with Better Auth against the database and redirects otherwise. The check lives in the page, not a layout, because layouts are not re-run on client navigation |
| Clear server errors, loading states | `features/auth/errors.ts` turns Better Auth's `{ data, error }` into typed `AuthRequestError` keys (every README code, plus `INVALID_BACKUP_CODE`, `OTP_HAS_EXPIRED`, `TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE`) translated by one hook; buttons show a spinner and stay busy during the redirect; errors and statuses are announced to screen readers |
| Card content from the server | `server/companies.ts` + `GET /api/companies?locale=`, validated with Zod on the client; cards reuse `SectorTag`, `SECTORS` and `CompanyStatus` |
| Sector and status translations | `features/companies/sectors.content.ts` (32 sectors) and `company-status.content.ts` |
| 1920×1080 and 1400×900 | See *Layout and Figma fidelity* |

### Architecture

The auth backend is used as a third-party API: every call goes through the provided `authClient`, and **the server stays the authority**. The session and the pending two-factor attempt live in HttpOnly cookies the front end never reads; attempt counters and the 30 s limit are enforced by Better Auth. The client only keeps UI state, and the server's answers (401, 429 + `X-Retry-After`, `INVALID_TOKEN`) correct it when it is wrong.

```
client component ── useMutation ── callAuth() ── authClient ──► /api/auth/*  (Better Auth, provided)
       │                               └─ AuthRequestError(key, retryAfter) ─► useAuthErrorMessage() ─► translated text
       └─ useSyncExternalStore ◄── browser storage (UI state only)

Fleet ── useQuery(["companies", locale]) ──► GET /api/companies ──► server/companies.ts      (Zod-checked)
proxy.ts ──► locale redirect + dashboard cookie check
dashboard / email pages (server components) ──► auth.api.getSession / Prisma, under <Suspense>
```

Client-side state:

| Key | Storage | Why there |
|---|---|---|
| `stolos:mfa` (methods, step, email code requested) | `sessionStorage` | Per tab, gone when the tab closes; expires after 10 min |
| `stolos:cooldown:two-factor-otp`, `stolos:cooldown:password-reset` | `localStorage` | The server limit is shared by all tabs; the `storage` event keeps them in sync |
| `stolos:password-reset-email` | `sessionStorage` | Keeps "check your inbox" and "Renvoyer le lien" after a reload |

All three are read through `useSyncExternalStore` with a server snapshot, so prerendered HTML never touches `window` and hydration never mismatches.

### Structure

```
src/
  app/[locale]/          root layout (html lang, Intlayer, TanStack Query), home redirect, localized 404
  app/[locale]/(auth)/   shared shell (background, 3D logo, company cards) + login, forgot/reset password, dashboard
  app/[locale]/email/    /email preview
  app/code/              root layout of the provided /code helper, kept outside the localized routes
  app/api/companies/     card content endpoint
  components/ui/         generic UI: Tabs, OtpInput, TextField (+ the provided Button, Input, PasswordInput)
  features/auth/         screens, forms, schemas, error mapping, MFA step, cooldown, dictionaries
  features/companies/    card, status badge, fleet, fetch + Zod schema, dictionaries
  features/dashboard/    account summary, sign-out
  features/email/        email template
  server/                server-only modules: companies data, DevMail query, session check
  proxy.ts               locale redirect + dashboard cookie check
```

Translations live next to the code in `*.content.ts` files (Intlayer); a missing language is a type error.

### Decisions

- **i18n — Intlayer**, as recommended, with `prefix-all` routing: `/fr` and `/en` everywhere, so no language switcher is needed. Server code reads the locale from the `[locale]` root param (`next/root-params`) and every page is prerendered once per locale.
- **One `/login` page.** Sign-in, sign-up, verification and recovery are steps of the same screen, as the brief describes, so there is no verification URL that would be meaningless without a pending attempt.
- **Persist the step, not the secret.** Only UI state is stored in the browser; the attempt itself stays in Better Auth's signed cookie. If the two disagree (attempt expired after 10 minutes), the server's `INVALID_TWO_FACTOR_COOKIE` sends the user back to sign-in with an explanation.
- **Cooldown as a deadline.** A timestamp stays right after a reload, a closed tab or a sleeping laptop; a decremented counter would not. The constant mirrors `RESEND_COOLDOWN_SECONDS` in `src/lib/auth.ts`, which the client cannot import (it pulls Prisma); `X-Retry-After` corrects any mismatch.
- **One error pipeline.** `callAuth()` makes Better Auth calls reject (what TanStack Query expects) and captures `X-Retry-After`, which the error object does not carry. Components branch on a closed set of keys, never on server strings.
- **Mutations for auth, a query for content.** Auth calls are never cached or retried automatically (a retry would spend the sign-in rate limit); the company content is cached per locale for the visit.
- **Card data — a server module instead of a new table.** The provided Prisma schema stays untouched; the endpoint contract (`{ companies: Company[] }`, `400 UNSUPPORTED_LOCALE` in Better Auth's error shape) would not change if the data moved to the database.
- **Codes from the server, labels on the client.** The endpoint returns sector and status **codes** and an already-translated description. Sector and status names are interface vocabulary tied to the provided icons, colours and badge rules (`CLOSED` and `INACTIVE` share the "Fermée" badge, `ACTIVE` has none), so they are translated with the other UI strings; descriptions are content and belong with the data.
- **No auth backend code.** `src/lib/auth.ts` and the Prisma schema are unchanged (the filtering of `twoFactorMethods` to the account's real methods is the provided hook).
- **Sign-up name.** Better Auth requires a `name` that the Figma form doesn't have; the part of the email before `@` is used.
- **Cache Components** (enabled in the starter). Request-time data (the session on the dashboard, the database on `/email`, the reset token) is read inside `<Suspense>`, with `connection()` where nothing else marks it dynamic; client-only state (storage, time) is read with `useSyncExternalStore`, so prerendering never sees it.
- **Own `OtpInput` and `Tabs`.** The brief specifies the code input's behaviour precisely, so it is implemented and tested directly rather than through a dependency; the tabs follow the WAI-ARIA pattern in about 80 lines.



### Tests

`bun run test` — 123 Vitest + Testing Library tests: the code input (paste in any box, auto-advance, auto-submit), the countdown (reload, `X-Retry-After`), error mapping, schemas, every form and screen with the auth client mocked (including the three verification variants, expired attempts and invalid reset links), the proxy and server session check, the companies endpoint and cards, and the email template. `next-intlayer` is replaced by a stand-in that renders dictionary keys, so tests assert which message was chosen rather than its wording. The flows were also run in a real browser against the backend with the test accounts.



## Setup

Requires [Bun](https://bun.sh) and Docker.

```bash
bun install
cp .env.example .env
bun run db:setup   # starts Postgres on port 5433, applies migrations, creates the test accounts
bun run dev
```

`bun run db:seed` puts the test accounts back in their initial state at any time.

## What is provided

| File | Role |
|---|---|
| `src/lib/auth.ts` | Better Auth server configuration |
| `src/lib/auth-client.ts` | Better Auth client (`authClient`), with the two-factor plugin |
| `src/app/api/auth/[...all]/route.ts` | All auth endpoints, under `/api/auth` |
| `src/app/code/page.tsx` | The `/code` helper page (see below) |
| `src/app/globals.css` | Stolos design tokens (colors, text sizes, spacing, radii) and the `glassmorphism` utility |
| `src/components/ui/` | `Button`, `Input`, `PasswordInput`, copied from the Stolos web app |
| `src/components/sectors/` | Company sectors from the Stolos web app: list, colours and icons (`sectors.ts`) and the `SectorTag` component. Sector names are not translated: that is part of the exercise. The rest of the company card is yours to build. |
| `src/components/company/company-status.ts` | Company statuses from the Stolos web app (`CompanyStatus`) |
| `src/app/page.tsx` | Start page: preview of these building blocks. Replaced: `src/app/[locale]/page.tsx` now redirects to the sign-in page |

The tokens redefine part of Tailwind's scale: `text-xs` … `text-xl` follow the Stolos sizes, and the spacing names (`xs`, `s`, `sm`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`) also apply to sizing utilities, so `max-w-xl` is 1.5rem. Use explicit values such as `max-w-[36rem]` for widths.

No real email is sent and no authenticator app is needed. Open **`/code`** in another tab: for every account it shows the current authenticator code, the last code "sent by email", the recovery codes and the last password-reset link.

## Routes

| Path | What it is |
|---|---|
| `/` | Start page. Replaced: now redirects to the sign-in page (see *Routes* above). |
| `/code` | Helper page: codes, recovery codes and reset links of every account (see above). |
| `/api/auth/*` | Auth endpoints served by Better Auth, listed below. |

No other page exists yet: sign-in, sign-up, verification and password-reset pages are yours to create, at the paths you choose.

| Method | Path | Action |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Sign up |
| POST | `/api/auth/sign-in/email` | Sign in |
| POST | `/api/auth/two-factor/verify-totp` | Verify app code |
| POST | `/api/auth/two-factor/send-otp` | Send email code |
| POST | `/api/auth/two-factor/verify-otp` | Verify email code |
| POST | `/api/auth/two-factor/verify-backup-code` | Verify recovery code |
| POST | `/api/auth/request-password-reset` | Ask for a reset link |
| GET | `/api/auth/reset-password/:token` | The reset link itself: redirects to `redirectTo?token=…` |
| POST | `/api/auth/reset-password` | Set the new password |
| GET | `/api/auth/get-session` | Current session |
| POST | `/api/auth/sign-out` | Sign out |

## Test accounts

Password for all of them: `Stolos-Test-2026`

| Email | Second step at sign-in |
|---|---|
| `none@example.com` | none |
| `app@example.com` | authenticator app |
| `both@example.com` | authenticator app or email code |
| `email@example.com` | email code |

Every account with a second step also has recovery codes.

## Auth API

Use `authClient`; each method maps to an endpoint under `/api/auth`.

| Action | Client call | Notes |
|---|---|---|
| Sign up | `authClient.signUp.email({ name, email, password })` | Signs the user in. Password: 8 characters minimum. |
| Sign in | `authClient.signIn.email({ email, password })` | With a second step, returns `{ twoFactorRedirect: true, twoFactorMethods }` instead of a session. `twoFactorMethods` contains `"totp"` (app) and/or `"otp"` (email). |
| Verify app code | `authClient.twoFactor.verifyTotp({ code })` | |
| Send email code | `authClient.twoFactor.sendOtp()` | A new code cancels the previous one. Codes expire after 3 minutes. |
| Verify email code | `authClient.twoFactor.verifyOtp({ code })` | |
| Verify recovery code | `authClient.twoFactor.verifyBackupCode({ code })` | Each code works once. |
| Ask for a reset link | `authClient.requestPasswordReset({ email, redirectTo: "/your-page" })` | Same answer whether the account exists or not. A new link cancels the previous one. |
| Set the new password | `authClient.resetPassword({ newPassword, token })` | The link on `/code` redirects to `redirectTo?token=…`. |
| Current session | `authClient.useSession()` / `authClient.getSession()` | |
| Sign out | `authClient.signOut()` | |

### Errors to handle

Errors come back as `{ error: { status, code, message } }`.

| Case | Status | `code` |
|---|---|---|
| Wrong email or password | 401 | `INVALID_EMAIL_OR_PASSWORD` |
| Email already used at sign-up | 422 | `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` |
| Wrong or expired code | 401 | `INVALID_CODE` |
| Sign-in attempt expired (10 minutes) | 401 | `INVALID_TWO_FACTOR_COOKIE` |
| Reset link invalid, expired or already used | 400 | `INVALID_TOKEN` |
| Too many requests | 429 | — the `X-Retry-After` response header gives the seconds to wait |

The server refuses a new email code or a new reset link for **30 seconds** after the previous request (429). Sign-in is limited to 3 attempts per 10 seconds.
