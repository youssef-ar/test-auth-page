import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TwoFactorMethod } from "@/features/auth/two-factor";

export type CurrentUser = {
  name: string;
  email: string;
  twoFactorMethods: TwoFactorMethod[];
};

// The real check behind protected pages: Better Auth validates the session against the database.
// The proxy's cookie check only spares a round trip; it never grants access on its own.
export const getCurrentUser = cache(async (locale: string): Promise<CurrentUser> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  const { id, name, email, twoFactorEnabled, emailTwoFactorEnabled } = session.user;
  // Same rule as sign-in: the app is offered only once its secret is verified, email only when enabled.
  const appFactor = twoFactorEnabled
    ? await prisma.twoFactor.findFirst({ where: { userId: id, verified: true }, select: { id: true } })
    : null;
  const twoFactorMethods: TwoFactorMethod[] = [];
  if (appFactor) twoFactorMethods.push("totp");
  if (twoFactorEnabled && emailTwoFactorEnabled) twoFactorMethods.push("otp");

  return { name, email, twoFactorMethods };
});
