"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intlayer";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, callAuth } from "./errors";
import { PASSWORD_RESET_COOLDOWN_KEY, passwordResetRequest } from "./password-reset-request";
import { useCooldown } from "./use-cooldown";

export const useRequestPasswordReset = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const { locale } = useLocale();
  const cooldown = useCooldown(PASSWORD_RESET_COOLDOWN_KEY);

  const request = useMutation({
    mutationFn: (email: string) =>
      callAuth((fetchOptions) =>
        authClient.requestPasswordReset({ email, redirectTo: `/${locale}/reset-password`, fetchOptions }),
      ),
    onSuccess: (_, email) => {
      cooldown.start();
      passwordResetRequest.save(email);
      onSuccess?.();
    },
    onError: (error) => {
      if (error instanceof AuthRequestError && error.key === "tooManyRequests") cooldown.start(error.retryAfter);
    },
  });

  return { request, cooldown };
};
