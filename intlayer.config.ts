import { type IntlayerConfig, Locales } from "intlayer";

// French is the product language; English is the second locale. Every page lives under /fr or /en,
// and a path without a locale (e.g. /login) is redirected by the proxy to the visitor's locale.
const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.FRENCH, Locales.ENGLISH],
    defaultLocale: Locales.FRENCH,
  },
  routing: {
    mode: "prefix-all",
  },
};

export default config;
