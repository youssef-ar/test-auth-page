import { type Dictionary, insert, t } from "intlayer";

const resetEmailContent = {
  key: "reset-email",
  content: {
    pageTitle: t({ fr: "Courriel de réinitialisation", en: "Password reset email" }),
    preview: insert(
      t({
        fr: "Aperçu du dernier courriel envoyé à {{to}} · {{date}}",
        en: "Preview of the latest email sent to {{to}} · {{date}}",
      }),
    ),
    title: t({ fr: "Réinitialisez votre mot de passe", en: "Reset your password" }),
    cta: t({ fr: "Choisir un nouveau mot de passe", en: "Choose a new password" }),
    body: t({
      fr: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Stolos. Ce lien expire dans une heure.",
      en: "We received a request to reset the password of your Stolos account. This link expires in one hour.",
    }),
    ignore: t({
      fr: "Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message : votre mot de passe reste inchangé.",
      en: "If you didn’t ask for this, you can ignore this message: your password stays the same.",
    }),
    copyLink: t({ fr: "Ou copiez ce lien dans votre navigateur :", en: "Or copy this link into your browser:" }),
    footerBefore: t({ fr: "Ceci est un message automatique de", en: "This is an automated message from" }),
    footerAfter: t({ fr: ". Merci de ne pas y répondre.", en: ". Please don’t reply to it." }),
    empty: {
      title: t({ fr: "Aucun courriel pour l’instant", en: "No email yet" }),
      body: t({
        fr: "Demandez un lien de réinitialisation depuis la page « Mot de passe oublié ? » : le courriel s’affichera ici.",
        en: "Ask for a reset link from the “Forgot your password?” page: the email will show up here.",
      }),
      cta: t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" }),
    },
  },
} satisfies Dictionary;

export default resetEmailContent;
