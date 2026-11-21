import { type Dictionary, t } from "intlayer";

const legalLinksContent = {
  key: "legal-links",
  content: {
    label: t({ fr: "Informations légales", en: "Legal information" }),
    terms: t({ fr: "Conditions d’utilisation", en: "Terms of use" }),
    privacy: t({ fr: "Politique de confidentialité", en: "Privacy policy" }),
  },
} satisfies Dictionary;

export default legalLinksContent;
