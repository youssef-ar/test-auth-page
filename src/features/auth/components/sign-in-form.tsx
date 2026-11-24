"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "@/components/ui/password-input";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { callAuth } from "../errors";
import { createSignInSchema, type SignInValues } from "../schemas";
import { readTwoFactorMethods, type TwoFactorMethod } from "../two-factor";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useValidationMessages } from "../use-validation-messages";
import { FormError } from "./form-error";
import { PrimaryButton } from "./primary-button";
import { useResetWhenHidden } from "@/lib/use-reset-when-hidden";

type SignInFormProps = {
  notice?: string;
  onTwoFactorRequired: (methods: TwoFactorMethod[]) => void;
};

export const SignInForm = ({ notice, onTwoFactorRequired }: SignInFormProps) => {
  const content = useIntlayer("auth-form");
  const { locale } = useLocale();
  const router = useRouter();
  const validation = useValidationMessages();
  const getErrorMessage = useAuthErrorMessage();
  const schema = useMemo(() => createSignInSchema(validation), [validation]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const signIn = useMutation({
    mutationFn: (values: SignInValues) =>
      callAuth((fetchOptions) => authClient.signIn.email({ ...values, fetchOptions })),
    onSuccess: (data) => {
      const methods = readTwoFactorMethods(data);
      if (methods) onTwoFactorRequired(methods);
      else router.replace(`/${locale}/dashboard`);
    },
  });

  useResetWhenHidden(signIn.reset);

  const isBusy = signIn.isPending || (signIn.isSuccess && !readTwoFactorMethods(signIn.data));

  return (
    <form noValidate onSubmit={handleSubmit((values) => signIn.mutate(values))} className="mt-xl flex flex-col">
      <FormError message={signIn.isIdle ? notice : getErrorMessage(signIn.error)} className="mb-m" />
      <div className="flex flex-col gap-m">
        <TextField
          {...register("email")}
          type="email"
          autoComplete="username"
          label={content.email}
          errorMessage={errors.email?.message}
        />
        <PasswordInput
          {...register("password")}
          autoComplete="current-password"
          label={content.password}
          visibilityLabels={{ show: content.showPassword.value, hide: content.hidePassword.value }}
          errorMessage={errors.password?.message}
        />
      </div>
      <Link
        href={`/${locale}/forgot-password`}
        className="mt-[1.5rem] w-fit rounded-xs text-sx font-medium text-primary-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary-200"
      >
        {content.forgotPassword}
      </Link>
      <PrimaryButton
        type="submit"
        isLoading={isBusy}
        className="mt-[2.25rem]"
      >
        {content.signIn}
      </PrimaryButton>
    </form>
  );
};
