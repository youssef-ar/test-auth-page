import { type Dictionary, insert, t } from "intlayer";

const dashboardContent = {
  key: "dashboard",
  content: {
    title: t({ fr: "Vous êtes connecté", en: "You’re signed in" }),
    welcome: insert(t({ fr: "Bienvenue, {{name}} !", en: "Welcome, {{name}}!" })),
    loading: t({ fr: "Chargement de votre session…", en: "Loading your session…" }),
    account: t({ fr: "Votre compte", en: "Your account" }),
    email: t({ fr: "Adresse courriel", en: "Email address" }),
    twoFactor: t({ fr: "Vérification en deux étapes", en: "Two-step verification" }),
    methods: {
      none: t({ fr: "Désactivée", en: "Off" }),
      app: t({ fr: "Application", en: "Authenticator app" }),
      appAndEmail: t({ fr: "Application ou courriel", en: "Authenticator app or email" }),
      email: t({ fr: "Courriel", en: "Email" }),
    },
    signOut: t({ fr: "Se déconnecter", en: "Sign out" }),
    signOutError: t({
      fr: "La déconnexion a échoué. Veuillez réessayer.",
      en: "Signing out failed. Please try again.",
    }),
  },
} satisfies Dictionary;

export default dashboardContent;
