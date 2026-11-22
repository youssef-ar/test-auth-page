"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "@/components/ui/password-input";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, callAuth } from "../errors";
import { createSignUpSchema, type SignUpValues } from "../schemas";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useValidationMessages } from "../use-validation-messages";
import { FormError } from "./form-error";
import { PrimaryButton } from "./primary-button";

// Better Auth requires a name; the Figma form has none, so the email's local part stands in.
const nameFromEmail = (email: string) => email.split("@")[0];

export const SignUpForm = () => {
  const content = useIntlayer("auth-form");
  const { locale } = useLocale();
  const router = useRouter();
  const validation = useValidationMessages();
  const getErrorMessage = useAuthErrorMessage();
  const schema = useMemo(() => createSignUpSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const signUp = useMutation({
    mutationFn: ({ email, password }: SignUpValues) =>
      callAuth((fetchOptions) => authClient.signUp.email({ name: nameFromEmail(email), email, password, fetchOptions })),
    onSuccess: () => router.replace(`/${locale}/dashboard`),
    onError: (error) => {
      if (error instanceof AuthRequestError && error.key === "emailTaken") {
        setError("email", { message: getErrorMessage(error) }, { shouldFocus: true });
      }
    },
  });

  const isEmailTaken = signUp.error instanceof AuthRequestError && signUp.error.key === "emailTaken";
  const visibilityLabels = { show: content.showPassword.value, hide: content.hidePassword.value };

  return (
    <form noValidate onSubmit={handleSubmit((values) => signUp.mutate(values))} className="mt-xl flex flex-col">
      <FormError message={isEmailTaken ? undefined : getErrorMessage(signUp.error)} className="mb-m" />
      <div className="flex flex-col gap-m">
        <TextField
          {...register("email")}
          type="email"
          autoComplete="email"
          label={content.email}
          errorMessage={errors.email?.message}
        />
        <PasswordInput
          {...register("password")}
          autoComplete="new-password"
          label={content.password}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.password?.message}
        />
        <PasswordInput
          {...register("confirmPassword")}
          autoComplete="new-password"
          label={content.confirmPassword}
          visibilityLabels={visibilityLabels}
          errorMessage={errors.confirmPassword?.message}
        />
      </div>
      <PrimaryButton
        type="submit"
        isLoading={signUp.isPending || signUp.isSuccess}
      >
        {content.signUp}
      </PrimaryButton>
    </form>
  );
};
