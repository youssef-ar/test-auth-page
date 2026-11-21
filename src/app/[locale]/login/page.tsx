"use client";

import { useIntlayer } from "next-intlayer";
import { Fleet } from "@/features/companies/components/fleet";

export default function LoginPage() {
  const { title, subtitle } = useIntlayer("login-page");

  return (
    <main className="relative flex min-h-screen w-full flex-1 overflow-hidden">
      <Fleet />
      <div className="relative mx-auto flex w-full max-w-[36rem] flex-col items-center justify-center gap-s p-8 text-center">
        <h1 className="text-m font-semibold">{title}</h1>
        <p className="text-s text-white/70">{subtitle}</p>
      </div>
    </main>
  );
}
