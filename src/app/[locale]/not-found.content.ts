import { type Dictionary, t } from "intlayer";

const notFoundContent = {
  key: "not-found",
  content: {
    title: t({ fr: "Cette page n’existe pas.", en: "This page does not exist." }),
    backToLogin: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
  },
} satisfies Dictionary;

export default notFoundContent;
