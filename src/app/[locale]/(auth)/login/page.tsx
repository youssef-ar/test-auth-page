"use client";

import { useIntlayer } from "next-intlayer";
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LegalLinks } from "@/features/auth/components/legal-links";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import type { TwoFactorMethod } from "@/features/auth/two-factor";

type AuthTab = "signin" | "signup";

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [twoFactorMethods, setTwoFactorMethods] = useState<TwoFactorMethod[] | null>(null);
  const content = useIntlayer("login-page");

  if (twoFactorMethods) return <AuthCard title={content.verify.title} />;

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
          { value: "signin", label: content.signin.tab, panel: <SignInForm onTwoFactorRequired={setTwoFactorMethods} /> },
          { value: "signup", label: content.signup.tab, panel: <SignUpForm /> },
        ]}
      />
    </AuthCard>
  );
}
