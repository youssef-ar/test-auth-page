import { getIntlayer } from "intlayer";
import { locale as getLocaleParam } from "next/root-params";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AccountSummary } from "@/features/dashboard/components/account-summary";
import { SignOutButton } from "@/features/dashboard/components/sign-out-button";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/i18n";
import { type CurrentUser, getCurrentUser } from "@/server/session";
import { pageMetadata } from "@/lib/page-metadata";

export const generateMetadata = () => pageMetadata("dashboard");

const getLocale = async () => {
  const locale = await getLocaleParam();
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
};

const methodKey = ({ twoFactorMethods }: CurrentUser) => {
  const app = twoFactorMethods.includes("totp");
  const email = twoFactorMethods.includes("otp");
  if (app && email) return "appAndEmail";
  if (app) return "app";
  return email ? "email" : "none";
};

const SignedInCard = async () => {
  const locale = await getLocale();
  const content = getIntlayer("dashboard", locale);
  const user = await getCurrentUser(locale);

  return (
    <AuthCard title={content.title} subtitle={content.welcome({ name: user.name })}>
      <AccountSummary
        user={user}
        labels={{
          account: content.account,
          email: content.email,
          twoFactor: content.twoFactor,
          method: content.methods[methodKey(user)],
        }}
      />
      <SignOutButton />
    </AuthCard>
  );
};

const LoadingCard = async () => {
  const content = getIntlayer("dashboard", await getLocale());
  return (
    <AuthCard title={<span role="status">{content.loading}</span>} />
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <SignedInCard />
    </Suspense>
  );
}
