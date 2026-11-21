import type { Locale } from "intlayer";
import intlayerConfig from "../../intlayer.config";

// Single source for the supported locales: read from intlayer.config.ts directly, so it also works
// outside Next.js (route handlers, tests) without Intlayer's build-time aliases.
export const LOCALES = (intlayerConfig.internationalization?.locales ?? []) as Locale[];
export const DEFAULT_LOCALE = (intlayerConfig.internationalization?.defaultLocale ?? LOCALES[0]) as Locale;

export const isSupportedLocale = (value: string | null | undefined): value is Locale =>
  typeof value === "string" && (LOCALES as string[]).includes(value);
