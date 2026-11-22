"use client";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LinkSentStep } from "@/features/auth/components/link-sent-step";
import { usePasswordResetEmail } from "@/features/auth/password-reset-request";

export default function ForgotPasswordPage() {
  const email = usePasswordResetEmail();
  return email ? <LinkSentStep email={email} /> : <ForgotPasswordForm />;
}
