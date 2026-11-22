"use client";

import { useIntlayer } from "next-intlayer";
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { LegalLinks } from "@/features/auth/components/legal-links";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RecoveryCodeStep } from "@/features/auth/components/recovery-code-step";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { VerificationCodeStep } from "@/features/auth/components/verification-code-step";
import { mfaSession, useMfaSession } from "@/features/auth/mfa-session";

type AuthTab = "signin" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [isExpired, setIsExpired] = useState(false);
  const content = useIntlayer("login-page");
  const errors = useIntlayer("auth-errors");
  const session = useMfaSession();

  const onExpired = () => {
    mfaSession.clear();
    setIsExpired(true);
  };

  if (session?.view === "recovery") return <RecoveryCodeStep onExpired={onExpired} />;
  if (session) return <VerificationCodeStep session={session} onExpired={onExpired} />;

  return (
    <AuthCard
      title={content[tab].title}
      subtitle={content[tab].subtitle}
      footer={<LegalLinks className="mt-[2.1875rem]" />}
    >
      <Tabs
        label={content.tabsLabel.value}
        value={tab}
        onValueChange={setTab}
        className="mt-[3.1875rem]"
        items={[
          {
            value: "signin",
            label: content.signin.tab,
            panel: (
              <SignInForm
                notice={isExpired ? errors.sessionExpired.value : undefined}
                onTwoFactorRequired={(methods) => {
                  setIsExpired(false);
                  mfaSession.start(methods);
                }}
              />
            ),
          },
          { value: "signup", label: content.signup.tab, panel: <SignUpForm /> },
        ]}
      />
    </AuthCard>
  );
}
