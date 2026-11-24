"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { callAuth, endOfSignInAttempt, type RestartReason, restartReasonOf } from "../errors";
import { mfaSession } from "../mfa-session";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { TextButton } from "./text-button";
import { PrimaryButton } from "./primary-button";

export const RecoveryCodeStep = ({ onRestart }: { onRestart: (reason: RestartReason) => void }) => {
  const { recovery } = useIntlayer("mfa");
  const { locale } = useLocale();
  const router = useRouter();
  const getErrorMessage = useAuthErrorMessage();
  const requiredMessage = recovery.required.value;
  const schema = useMemo(
    () => z.object({ code: z.string().trim().min(1, { error: requiredMessage }) }),
    [requiredMessage],
  );

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<{ code: string }>({ resolver: zodResolver(schema), defaultValues: { code: "" } });

  const verify = useMutation({
    mutationFn: ({ code }: { code: string }) =>
      callAuth((fetchOptions) => authClient.twoFactor.verifyBackupCode({ code, fetchOptions })).catch(
        endOfSignInAttempt,
      ),
    onSuccess: () => {
      mfaSession.clear();
      router.replace(`/${locale}/dashboard`);
    },
    onError: (error) => {
      const restartReason = restartReasonOf(error);
      if (restartReason) onRestart(restartReason);
      else setFocus("code", { shouldSelect: true });
    },
  });

  return (
    <AuthCard title={recovery.title}>
      <form noValidate onSubmit={handleSubmit((values) => verify.mutate(values))} className="flex flex-col">
        <FormError message={getErrorMessage(verify.error)} className="mt-xl" />
        <TextField
          {...register("code")}
          autoFocus
          autoComplete="one-time-code"
          autoCapitalize="none"
          spellCheck={false}
          label={recovery.label}
          errorMessage={errors.code?.message}
          className="mt-[2.4375rem]"
        />
        <PrimaryButton
          type="submit"
          isLoading={verify.isPending || verify.isSuccess}
        >
          {recovery.submit}
        </PrimaryButton>
      </form>
      <TextButton onClick={() => mfaSession.update({ view: "code" })} className="mx-auto mt-[2.25rem]">
        {recovery.useVerificationCode}
      </TextButton>
      <p className="mt-[2.25rem] text-center text-s leading-[1.1875rem] font-light text-white/80">{recovery.help}</p>
    </AuthCard>
  );
};
