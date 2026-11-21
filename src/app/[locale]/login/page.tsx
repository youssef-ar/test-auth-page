"use client";

import { useIntlayer } from "next-intlayer";


export default function LoginPage() {
  const { title, subtitle } = useIntlayer("login-page");

  return (
    <main className="mx-auto flex w-full max-w-[36rem] flex-1 flex-col items-center justify-center gap-s p-8 text-center">
      <h1 className="text-m font-semibold">{title}</h1>
      <p className="text-s text-white/70">{subtitle}</p>
    </main>
  );
}
