import { getIntlayer } from "intlayer";
import { locale as getLocaleParam } from "next/root-params";
import { connection } from "next/server";
import { Suspense } from "react";
import { NoResetEmail, ResetPasswordEmail } from "@/features/email/components/reset-password-email";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/i18n";
import { getLatestPasswordResetMail } from "@/server/dev-mail";
import { pageMetadata } from "@/lib/page-metadata";

export const generateMetadata = () => pageMetadata("email");

const getLocale = async () => {
  const locale = await getLocaleParam();
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
};

// Reads the database on every request, so it streams in behind the static page shell (like /code).
const LatestResetEmail = async () => {
  await connection();
  const locale = await getLocale();
  const content = getIntlayer("reset-email", locale);
  const mail = await getLatestPasswordResetMail();

  if (!mail) {
    return (
      <NoResetEmail
        title={content.empty.title}
        body={content.empty.body}
        cta={content.empty.cta}
        href={`/${locale}/forgot-password`}
      />
    );
  }

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "medium" }).format(mail.createdAt);

  return (
    <>
      <p className="w-full bg-black/30 px-m py-s text-center text-xs text-white/60">
        {content.preview({ to: mail.to, date })}
      </p>
      <ResetPasswordEmail
        link={mail.content}
        text={{
          title: content.title,
          cta: content.cta,
          body: content.body,
          ignore: content.ignore,
          copyLink: content.copyLink,
          footerBefore: content.footerBefore,
          footerAfter: content.footerAfter,
        }}
      />
    </>
  );
};

export default function EmailPage() {
  return (
    <main className="flex min-h-svh w-full flex-1 flex-col items-center bg-[linear-gradient(165deg,#4B3F94_0%,#2A2352_45%,#1C1835_100%)]">
      <Suspense>
        <LatestResetEmail />
      </Suspense>
    </main>
  );
}
