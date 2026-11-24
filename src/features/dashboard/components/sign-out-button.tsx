"use client";

import { useMutation } from "@tanstack/react-query";
import { useIntlayer, useLocale } from "next-intlayer";
import { FormError } from "@/features/auth/components/form-error";
import { callAuth } from "@/features/auth/errors";
import { authClient } from "@/lib/auth-client";
import { hardNavigate } from "@/lib/hard-navigate";
import { PrimaryButton } from "@/features/auth/components/primary-button";

export const SignOutButton = () => {
  const { signOut: label, signOutError } = useIntlayer("dashboard");
  const { locale } = useLocale();

  const signOut = useMutation({
    mutationFn: () => callAuth((fetchOptions) => authClient.signOut({ fetchOptions })),
    onSuccess: () => hardNavigate(`/${locale}/login`),
  });

  return (
    <>
      <FormError message={signOut.isError ? signOutError.value : undefined} className="mt-xl" />
      <PrimaryButton
        type="button"
        isLoading={signOut.isPending || signOut.isSuccess}
        onClick={() => signOut.mutate()}
      >
        {label}
      </PrimaryButton>
    </>
  );
};
