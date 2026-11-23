import { type Dictionary, t } from "intlayer";

const authFormContent = {
  key: "auth-form",
  content: {
    email: t({ fr: "Adresse courriel", en: "Email address" }),
    password: t({ fr: "Mot de passe", en: "Password" }),
    confirmPassword: t({ fr: "Confirmez le mot de passe", en: "Confirm password" }),
    showPassword: t({ fr: "Afficher le mot de passe", en: "Show password" }),
    hidePassword: t({ fr: "Masquer le mot de passe", en: "Hide password" }),
    forgotPassword: t({ fr: "Mot de passe oublié ?", en: "Forgot password?" }),
    signIn: t({ fr: "Se connecter", en: "Sign in" }),
    signUp: t({ fr: "Créer mon compte", en: "Create my account" }),
    validation: {
      emailRequired: t({ fr: "Saisissez votre adresse courriel.", en: "Enter your email address." }),
      emailInvalid: t({ fr: "Cette adresse courriel n’est pas valide.", en: "This email address is not valid." }),
      passwordRequired: t({ fr: "Saisissez votre mot de passe.", en: "Enter your password." }),
      passwordTooShort: t({
        fr: "Le mot de passe doit contenir au moins 8 caractères.",
        en: "Password must be at least 8 characters long.",
      }),
      passwordsMismatch: t({
        fr: "Les mots de passe ne correspondent pas.",
        en: "Passwords do not match.",
      }),
    },
  },
} satisfies Dictionary;

export default authFormContent;
