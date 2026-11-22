import { redirect } from "next/navigation";
import { locale as getLocaleParam } from "next/root-params";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/i18n";

// The app has no home page of its own: / and /{locale} open the sign-in screen.
export default async function LocaleHomePage() {
  const locale = await getLocaleParam();
  redirect(`/${isSupportedLocale(locale) ? locale : DEFAULT_LOCALE}/login`);
}
