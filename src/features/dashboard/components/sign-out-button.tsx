"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { FormError } from "@/features/auth/components/form-error";
import { callAuth } from "@/features/auth/errors";
import { authClient } from "@/lib/auth-client";
import { PrimaryButton } from "@/features/auth/components/primary-button";

export const SignOutButton = () => {
  const { signOut: label, signOutError } = useIntlayer("dashboard");
  const { locale } = useLocale();
  const router = useRouter();

  const signOut = useMutation({
    mutationFn: () => callAuth((fetchOptions) => authClient.signOut({ fetchOptions })),
    onSuccess: () => {
      router.replace(`/${locale}/login`);
      // Drops the cached dashboard so "back" can't show it again.
      router.refresh();
    },
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
