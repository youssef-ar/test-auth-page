"use client";

import { useIntlayer } from "next-intlayer";
import { AuthRequestError } from "./errors";

export const useAuthErrorMessage = () => {
  const messages = useIntlayer("auth-errors");

  return (error: unknown): string | undefined => {
    if (!error) return undefined;
    if (!(error instanceof AuthRequestError)) return messages.unknown.value;
    if (error.key === "tooManyRequests" && error.retryAfter) {
      return String(messages.tooManyRequestsRetry({ seconds: error.retryAfter }));
    }
    return messages[error.key].value;
  };
};
