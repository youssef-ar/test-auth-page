"use client";

import { useIntlayer } from "next-intlayer";
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { LegalLinks } from "./legal-links";
import { AuthCard } from "./auth-card";
import { RecoveryCodeStep } from "./recovery-code-step";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { VerificationCodeStep } from "./verification-code-step";
import type { RestartReason } from "../errors";
import { mfaSession, useMfaSession } from "../mfa-session";

type AuthTab = "signin" | "signup";

export const LoginScreen = () => {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [restartReason, setRestartReason] = useState<RestartReason | null>(null);
  const content = useIntlayer("login-page");
  const errors = useIntlayer("auth-errors");
  const session = useMfaSession();

  const onRestart = (reason: RestartReason) => {
    mfaSession.clear();
    setRestartReason(reason);
  };

  if (session?.view === "recovery") return <RecoveryCodeStep onRestart={onRestart} />;
  if (session) return <VerificationCodeStep session={session} onRestart={onRestart} />;

  return (
    <AuthCard
      title={content[tab].title}
      subtitle={content[tab].subtitle}
      footer={<LegalLinks className="mt-[2.1875rem]" />}
      className="px-[3.625rem]"
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
                notice={restartReason ? errors[restartReason].value : undefined}
                onTwoFactorRequired={(methods) => {
                  setRestartReason(null);
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
};
