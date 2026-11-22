"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useIntlayer, useLocale } from "next-intlayer";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createForgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useRequestPasswordReset } from "../use-request-password-reset";
import { useValidationMessages } from "../use-validation-messages";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { TextLink } from "./text-button";

export const ForgotPasswordForm = () => {
  const content = useIntlayer("password-reset");
  const form = useIntlayer("auth-form");
  const { locale } = useLocale();
  const validation = useValidationMessages();
  const getErrorMessage = useAuthErrorMessage();
  const schema = useMemo(() => createForgotPasswordSchema(validation), [validation]);
  const { request, cooldown } = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  return (
    <AuthCard title={content.request.title} subtitle={content.request.subtitle}>
      <form
        noValidate
        onSubmit={handleSubmit(({ email }) => request.mutate(email))}
        className="mt-[2.5rem] flex flex-col"
      >
        <FormError message={getErrorMessage(request.error)} className="mb-m" />
        <TextField
          {...register("email")}
          type="email"
          autoComplete="email"
          label={form.email}
          errorMessage={errors.email?.message}
        />
        <Button
          type="submit"
          variant="primary"
          alignment="center"
          textSize="base"
          isLoading={request.isPending}
          disabled={cooldown.isActive}
          className="mt-2xl h-[3.1875rem] w-full rounded-s font-semibold text-white/90 hover:bg-primary-500"
        >
          {content.request.submit}
          {cooldown.isActive && ` ${String(content.cooldown({ seconds: cooldown.remaining }))}`}
        </Button>
      </form>
      <TextLink href={`/${locale}/login`} className="mx-auto mt-[2.25rem]">
        {content.backToSignIn}
      </TextLink>
    </AuthCard>
  );
};
