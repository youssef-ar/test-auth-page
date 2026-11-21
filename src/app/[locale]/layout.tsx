import { configuration, getHTMLTextDir, type Locale } from "intlayer";
import type { Metadata } from "next";
import { IntlayerProvider } from "next-intlayer/server";
import { notFound } from "next/navigation";
import { locale as getLocaleParam } from "next/root-params";
import type { ReactNode } from "react";
import "../globals.css";
import { inter } from "../fonts";

// Root layout of the localized app (/fr/*, /en/*). The /code helper has its own root layout.

export { generateStaticParams } from "next-intlayer";

const { locales } = configuration.internationalization;

const isSupportedLocale = (value: string | undefined): value is Locale =>
  value !== undefined && (locales as string[]).includes(value);

export const metadata: Metadata = { title: { default: "Stolos", template: "%s — Stolos" } };

export default async function LocaleLayout({ children }: { children: ReactNode }) {
  
  const locale = await getLocaleParam();

  if (!isSupportedLocale(locale)) notFound();

  return (
    <html lang={locale} dir={getHTMLTextDir(locale)} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <IntlayerProvider locale={locale}>{children}</IntlayerProvider>
      </body>
    </html>
  );
}
