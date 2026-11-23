import { type Dictionary, t } from "intlayer";

const pageTitlesContent = {
  key: "page-titles",
  content: {
    login: t({ fr: "Connexion", en: "Sign in" }),
    forgotPassword: t({ fr: "Mot de passe oublié", en: "Forgot password" }),
    resetPassword: t({ fr: "Nouveau mot de passe", en: "New password" }),
    dashboard: t({ fr: "Tableau de bord", en: "Dashboard" }),
    email: t({ fr: "Courriel de réinitialisation", en: "Password reset email" }),
    notFound: t({ fr: "Page introuvable", en: "Page not found" }),
  },
} satisfies Dictionary;

export default pageTitlesContent;
