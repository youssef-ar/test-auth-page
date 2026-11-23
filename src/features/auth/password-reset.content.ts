import { type Dictionary, insert, t } from "intlayer";

const passwordResetContent = {
  key: "password-reset",
  content: {
    backToSignIn: t({ fr: "Retour à la connexion", en: "Back to sign in" }),
    cooldown: insert(t({ fr: "({{seconds}}s)", en: "({{seconds}}s)" })),
    cooldownLabel: insert(
      t({
        fr: "Vous pourrez demander un nouveau lien dans {{seconds}} secondes.",
        en: "You can ask for a new link in {{seconds}} seconds.",
      }),
    ),
    request: {
      title: t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" }),
      subtitle: t({
        fr: "Saisissez l’adresse courriel de votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.",
        en: "Enter your account’s email address. We’ll send you a link to reset your password.",
      }),
      submit: t({ fr: "Envoyer le lien", en: "Send the link" }),
    },
    sent: {
      title: t({ fr: "Vérifiez votre boîte courriel", en: "Check your inbox" }),
      body: t({
        fr: "Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos courriers indésirables.",
        en: "If an account uses this address, you’ll receive a link to reset your password. Remember to check your spam folder.",
      }),
      resend: t({ fr: "Renvoyer le lien", en: "Resend the link" }),
      resent: t({ fr: "Un nouveau lien vient de vous être envoyé.", en: "A new link has just been sent." }),
      sending: t({ fr: "Envoi du lien…", en: "Sending the link…" }),
    },
    reset: {
      title: t({ fr: "Créez un nouveau mot de passe", en: "Create a new password" }),
      subtitle: t({
        fr: "Choisissez un nouveau mot de passe pour votre compte.",
        en: "Choose a new password for your account.",
      }),
      password: t({ fr: "Nouveau mot de passe", en: "New password" }),
      submit: t({ fr: "Enregistrer le mot de passe", en: "Save the password" }),
    },
    invalid: {
      title: t({ fr: "Ce lien n’est plus valide", en: "This link is no longer valid" }),
      body: t({
        fr: "Ce lien de réinitialisation a expiré ou a déjà été utilisé. Demandez-en un nouveau pour choisir votre mot de passe.",
        en: "This reset link has expired or has already been used. Ask for a new one to choose your password.",
      }),
      requestNew: t({ fr: "Demander un nouveau lien", en: "Ask for a new link" }),
    },
    done: {
      title: t({ fr: "Mot de passe modifié", en: "Password changed" }),
      body: t({
        fr: "Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter.",
        en: "Your password has been updated. You can now sign in.",
      }),
      signIn: t({ fr: "Se connecter", en: "Sign in" }),
    },
  },
} satisfies Dictionary;

export default passwordResetContent;
