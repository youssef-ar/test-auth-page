import { type Dictionary, insert, t } from "intlayer";
import type { AuthErrorKey } from "./errors";

const authErrorsContent = {
  key: "auth-errors",
  content: {
    invalidCredentials: t({
      fr: "Adresse courriel ou mot de passe incorrect.",
      en: "Incorrect email address or password.",
    }),
    emailTaken: t({
      fr: "Un compte existe déjà avec cette adresse courriel.",
      en: "An account already exists with this email address.",
    }),
    invalidCode: t({
      fr: "Ce code est invalide ou a expiré.",
      en: "This code is invalid or has expired.",
    }),
    sessionExpired: t({
      fr: "Votre tentative de connexion a expiré. Veuillez vous reconnecter.",
      en: "Your sign-in attempt has expired. Please sign in again.",
    }),
    signInAttemptsExceeded: t({
      fr: "Trop d’essais incorrects. Reconnectez-vous pour recommencer la vérification.",
      en: "Too many incorrect tries. Sign in again to restart the verification.",
    }),
    invalidRecoveryCode: t({
      fr: "Ce code de récupération est invalide ou a déjà été utilisé.",
      en: "This recovery code is invalid or has already been used.",
    }),
    codeAttemptsExceeded: t({
      fr: "Trop d’essais avec ce code. Demandez-en un nouveau.",
      en: "Too many tries with this code. Ask for a new one.",
    }),
    accountLocked: t({
      fr: "Trop d’essais incorrects : votre compte est temporairement bloqué. Réessayez plus tard.",
      en: "Too many incorrect tries: your account is temporarily locked. Please try again later.",
    }),
    invalidToken: t({
      fr: "Ce lien est invalide, a expiré ou a déjà été utilisé.",
      en: "This link is invalid, has expired or has already been used.",
    }),
    tooManyRequests: t({
      fr: "Trop de tentatives. Veuillez réessayer dans quelques instants.",
      en: "Too many attempts. Please try again in a moment.",
    }),
    tooManyRequestsRetry: insert(
      t({
        fr: "Trop de tentatives. Veuillez réessayer dans {{seconds}} s.",
        en: "Too many attempts. Please try again in {{seconds}} s.",
      }),
    ),
    unknown: t({
      fr: "Une erreur est survenue. Veuillez réessayer.",
      en: "Something went wrong. Please try again.",
    }),
  } satisfies Record<AuthErrorKey | "tooManyRequestsRetry", unknown>,
} satisfies Dictionary;

export default authErrorsContent;
