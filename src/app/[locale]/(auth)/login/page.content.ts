import { type Dictionary, t } from "intlayer";

const loginPageContent = {
  key: "login-page",
  content: {
    tabsLabel: t({ fr: "Connexion ou inscription", en: "Sign in or sign up" }),
    signin: {
      tab: t({ fr: "Connexion", en: "Sign in" }),
      title: t({ fr: "Ravi de vous revoir sur Stolos !", en: "Great to see you again on Stolos!" }),
      subtitle: t({ fr: "Connectez-vous à votre compte", en: "Sign in to your account" }),
    },
    signup: {
      tab: t({ fr: "Inscription", en: "Sign up" }),
      title: t({ fr: "Bienvenue sur Stolos !", en: "Welcome to Stolos!" }),
      subtitle: t({ fr: "Créez votre compte", en: "Create your account" }),
    },
    verify: {
      title: t({ fr: "Confirmez votre identité", en: "Confirm your identity" }),
    },
  },
} satisfies Dictionary;

export default loginPageContent;
