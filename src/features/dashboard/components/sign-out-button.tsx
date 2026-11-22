"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { Button } from "@/components/ui/button";
import { FormError } from "@/features/auth/components/form-error";
import { callAuth } from "@/features/auth/errors";
import { authClient } from "@/lib/auth-client";

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
      <Button
        type="button"
        variant="primary"
        alignment="center"
        textSize="base"
        isLoading={signOut.isPending || signOut.isSuccess}
        onClick={() => signOut.mutate()}
        className="mt-2xl h-[3.1875rem] w-full rounded-s font-semibold text-white/90 hover:bg-primary-500"
      >
        {label}
      </Button>
    </>
  );
};
