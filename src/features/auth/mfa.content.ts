import { type Dictionary, insert, t } from "intlayer";

const mfaContent = {
  key: "mfa",
  content: {
    title: t({ fr: "Confirmez votre identité", en: "Confirm your identity" }),
    codeLabel: t({ fr: "Code de vérification à six chiffres", en: "Six-digit verification code" }),
    digitLabel: insert(t({ fr: "Chiffre {{position}} sur {{total}}", en: "Digit {{position}} of {{total}}" })),
    verifying: t({ fr: "Vérification du code…", en: "Checking the code…" }),
    sending: t({ fr: "Envoi du code…", en: "Sending the code…" }),
    codeSent: t({ fr: "Un nouveau code vient de vous être envoyé.", en: "A new code has just been sent to you." }),
    sendEmailCode: t({ fr: "Envoyer un code par courriel", en: "Send a code by email" }),
    resendCode: t({ fr: "Renvoyer un code", en: "Resend a code" }),
    cooldown: insert(t({ fr: "({{seconds}}s)", en: "({{seconds}}s)" })),
    cooldownLabel: insert(
      t({
        fr: "Vous pourrez demander un nouveau code dans {{seconds}} secondes.",
        en: "You can ask for a new code in {{seconds}} seconds.",
      }),
    ),
    useRecoveryCode: t({ fr: "Utiliser un code de récupération", en: "Use a recovery code" }),
    help: {
      totp: t({
        fr: "Saisissez le code à six chiffres affiché dans votre application d’authentification.",
        en: "Enter the six-digit code shown in your authenticator app.",
      }),
      both: t({
        fr: "Saisissez le code à six chiffres envoyé à l’adresse courriel de votre compte, ou le code affiché dans votre application d’authentification.",
        en: "Enter the six-digit code sent to your account’s email address, or the code shown in your authenticator app.",
      }),
      otp: t({
        fr: "Saisissez le code à six chiffres envoyé à l’adresse courriel de votre compte. S’il expire, demandez un nouveau code.",
        en: "Enter the six-digit code sent to your account’s email address. If it expires, ask for a new one.",
      }),
    },
    recovery: {
      title: t({ fr: "Saisissez un code de récupération", en: "Enter a recovery code" }),
      label: t({ fr: "Code de récupération", en: "Recovery code" }),
      required: t({ fr: "Saisissez un code de récupération.", en: "Enter a recovery code." }),
      submit: t({ fr: "Valider et se connecter", en: "Confirm and sign in" }),
      useVerificationCode: t({ fr: "Utiliser un code de vérification", en: "Use a verification code" }),
      help: t({
        fr: "Utilisez l’un des codes de récupération sauvegardés lors de l’activation de la vérification en deux étapes. Chaque code est à usage unique.",
        en: "Use one of the recovery codes you saved when you turned on two-step verification. Each code works only once.",
      }),
    },
  },
} satisfies Dictionary;

export default mfaContent;
