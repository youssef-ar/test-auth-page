"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, callAuth } from "../errors";
import { passwordResetRequest } from "../password-reset-request";
import { createResetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useValidationMessages } from "../use-validation-messages";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { TextLink } from "./text-button";

const primaryButtonClass =
  "mt-2xl h-[3.1875rem] w-full rounded-s font-semibold text-white/90 hover:bg-primary-500";

type ResetState = "form" | "invalid" | "done";

const ResetPasswordForm = ({ token, onStateChange }: { token: string; onStateChange: (state: ResetState) => void }) => {
  const content = useIntlayer("password-reset");
  const form = useIntlayer("auth-form");
  const { locale } = useLocale();
  const validation = useValidationMessages();
  const getErrorMessage = useAuthErrorMessage();
  const schema = useMemo(() => createResetPasswordSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const reset = useMutation({
    mutationFn: ({ password }: ResetPasswordValues) =>
      callAuth((fetchOptions) => authClient.resetPassword({ newPassword: password, token, fetchOptions })),
    onSuccess: () => {
      passwordResetRequest.clear();
      onStateChange("done");
    },
    onError: (error) => {
      if (error instanceof AuthRequestError && error.key === "invalidToken") onStateChange("invalid");
    },
  });

  const visibilityLabels = { show: form.showPassword.value, hide: form.hidePassword.value };

  return (
    <AuthCard title={content.reset.title} subtitle={content.reset.subtitle}>
      <form noValidate onSubmit={handleSubmit((values) => reset.mutate(values))} className="mt-[2.5rem] flex flex-col">
        <FormError message={getErrorMessage(reset.error)} className="mb-m" />
        <div className="flex flex-col gap-m">
          <PasswordInput
            {...register("password")}
            autoComplete="new-password"
            label={content.reset.password}
            visibilityLabels={visibilityLabels}
            errorMessage={errors.password?.message}
          />
          <PasswordInput
            {...register("confirmPassword")}
            autoComplete="new-password"
            label={form.confirmPassword}
            visibilityLabels={visibilityLabels}
            errorMessage={errors.confirmPassword?.message}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          alignment="center"
          textSize="base"
          isLoading={reset.isPending}
          className={primaryButtonClass}
        >
          {content.reset.submit}
        </Button>
      </form>
      <TextLink href={`/${locale}/login`} className="mx-auto mt-[2.25rem]">
        {content.backToSignIn}
      </TextLink>
    </AuthCard>
  );
};

const InvalidLink = () => {
  const content = useIntlayer("password-reset");
  const { locale } = useLocale();

  return (
    <AuthCard title={content.invalid.title}>
      <p role="alert" className="mt-[0.625rem] text-center text-s leading-[1.1875rem] font-light text-white/80">
        {content.invalid.body}
      </p>
      <Button asChild variant="primary" alignment="center" textSize="base" className={primaryButtonClass}>
        <Link href={`/${locale}/forgot-password`} onClick={passwordResetRequest.clear}>
          {content.invalid.requestNew}
        </Link>
      </Button>
      <TextLink href={`/${locale}/login`} className="mx-auto mt-[2.25rem]">
        {content.backToSignIn}
      </TextLink>
    </AuthCard>
  );
};

const PasswordChanged = () => {
  const content = useIntlayer("password-reset");
  const { locale } = useLocale();

  return (
    <AuthCard title={content.done.title}>
      <p role="status" className="mt-[0.625rem] text-center text-s leading-[1.1875rem] font-light text-white/80">
        {content.done.body}
      </p>
      <Button asChild variant="primary" alignment="center" textSize="base" className={primaryButtonClass}>
        <Link href={`/${locale}/login`}>{content.done.signIn}</Link>
      </Button>
    </AuthCard>
  );
};

// Better Auth sends the link to `?token=…`, or to `?error=INVALID_TOKEN` when the token is unknown or expired.
export const ResetPasswordFlow = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasError = searchParams.has("error");
  const [state, setState] = useState<ResetState>(token && !hasError ? "form" : "invalid");

  if (state === "done") return <PasswordChanged />;
  if (state === "invalid" || !token) return <InvalidLink />;
  return <ResetPasswordForm token={token} onStateChange={setState} />;
};

export const ResetPasswordFallback = () => {
  const content = useIntlayer("password-reset");
  return <AuthCard title={content.reset.title} subtitle={content.reset.subtitle} />;
};
