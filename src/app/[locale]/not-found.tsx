"use client";

import { useIntlayer, useLocale } from "next-intlayer";
import Link from "next/link";

export default function LocaleNotFound() {
  const { title, backToLogin } = useIntlayer("not-found");
  const { locale } = useLocale();

  return (
    <main className="mx-auto flex w-full max-w-[36rem] flex-1 flex-col items-center justify-center gap-m p-8 text-center">
      <h1 className="text-m font-semibold">{title}</h1>
      <Link className="text-sx text-primary underline" href={`/${locale}/login`}>
        {backToLogin}
      </Link>
    </main>
  );
}
