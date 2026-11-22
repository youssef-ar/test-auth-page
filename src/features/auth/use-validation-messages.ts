"use client";

import { useIntlayer } from "next-intlayer";
import { useMemo } from "react";
import type { ValidationMessages } from "./schemas";

export const useValidationMessages = (): ValidationMessages => {
  const { validation } = useIntlayer("auth-form");
  const { emailRequired, emailInvalid, passwordRequired, passwordTooShort, passwordsMismatch } = validation;

  return useMemo(
    () => ({
      emailRequired: emailRequired.value,
      emailInvalid: emailInvalid.value,
      passwordRequired: passwordRequired.value,
      passwordTooShort: passwordTooShort.value,
      passwordsMismatch: passwordsMismatch.value,
    }),
    [emailRequired, emailInvalid, passwordRequired, passwordTooShort, passwordsMismatch],
  );
};
