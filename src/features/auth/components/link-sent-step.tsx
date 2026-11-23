"use client";

import { useIntlayer, useLocale } from "next-intlayer";
import { useState } from "react";
import { passwordResetRequest } from "../password-reset-request";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useRequestPasswordReset } from "../use-request-password-reset";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { ResendButton } from "./resend-button";
import { TextLink } from "./text-button";

export const LinkSentStep = ({ email }: { email: string }) => {
  const content = useIntlayer("password-reset");
  const { locale } = useLocale();
  const getErrorMessage = useAuthErrorMessage();
  const [status, setStatus] = useState("");
  const { request, cooldown } = useRequestPasswordReset({ onSuccess: () => setStatus(content.sent.resent.value) });

  return (
    <AuthCard title={content.sent.title} subtitle={content.sent.body}>
      <FormError message={getErrorMessage(request.error)} className="mt-xl" />
      <p role="status" className="sr-only">
        {request.isPending ? content.sent.sending.value : status}
      </p>
      <div className="mt-[2.25rem] flex flex-col items-center gap-sm">
        <ResendButton
          label={content.sent.resend}
          remaining={cooldown.remaining}
          countdown={String(content.cooldown({ seconds: cooldown.remaining }))}
          countdownLabel={String(content.cooldownLabel({ seconds: cooldown.remaining }))}
          onClick={() => {
            setStatus("");
            request.mutate(email);
          }}
          isPending={request.isPending}
        />
        <TextLink href={`/${locale}/login`} onClick={passwordResetRequest.clear}>
          {content.backToSignIn}
        </TextLink>
      </div>
    </AuthCard>
  );
};
