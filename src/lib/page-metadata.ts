import { getIntlayer } from "intlayer";
import type { Metadata } from "next";
import { locale as getLocaleParam } from "next/root-params";
import { DEFAULT_LOCALE, isSupportedLocale } from "./i18n";

type PageTitle = keyof ReturnType<typeof getIntlayer<"page-titles">>;

// Localized <title> for a page, read from the [locale] root param (the layout adds "— Stolos").
export const pageMetadata = async (page: PageTitle): Promise<Metadata> => {
  const locale = await getLocaleParam();
  const titles = getIntlayer("page-titles", isSupportedLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: titles[page] };
};
