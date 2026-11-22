"use client";

import { ForgotPasswordForm } from "./forgot-password-form";
import { LinkSentStep } from "./link-sent-step";
import { usePasswordResetEmail } from "../password-reset-request";

export const ForgotPasswordScreen = () => {
  const email = usePasswordResetEmail();
  return email ? <LinkSentStep email={email} /> : <ForgotPasswordForm />;
};
