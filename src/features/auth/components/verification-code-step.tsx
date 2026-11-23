"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useIntlayer, useLocale } from "next-intlayer";
import { useEffect, useRef, useState } from "react";
import { OtpInput } from "@/components/ui/otp-input";
import { authClient } from "@/lib/auth-client";
import { AuthRequestError, callAuth } from "../errors";
import { type MfaSession, mfaSession } from "../mfa-session";
import { useAuthErrorMessage } from "../use-auth-error-message";
import { useCooldown } from "../use-cooldown";
import { AuthCard } from "./auth-card";
import { FormError } from "./form-error";
import { ResendButton } from "./resend-button";
import { TextButton } from "./text-button";

export const OTP_COOLDOWN_KEY = "two-factor-otp";

type Variant = "totp" | "otp" | "both";

const variantOf = (methods: MfaSession["methods"]): Variant => {
  const hasTotp = methods.includes("totp");
  const hasOtp = methods.includes("otp");
  if (hasTotp && hasOtp) return "both";
  return hasOtp ? "otp" : "totp";
};

const verifyCode = async (variant: Variant, emailCodeRequested: boolean, code: string) => {
  const totp = () => callAuth((fetchOptions) => authClient.twoFactor.verifyTotp({ code, fetchOptions }));
  const otp = () => callAuth((fetchOptions) => authClient.twoFactor.verifyOtp({ code, fetchOptions }));

  if (variant === "totp" || (variant === "both" && !emailCodeRequested)) return totp();
  if (variant === "otp") return otp();
  try {
    return await otp();
  } catch (error) {
    if (error instanceof AuthRequestError && error.key === "invalidCode") return totp();
    throw error;
  }
};

type VerificationCodeStepProps = {
  session: MfaSession;
  onExpired: () => void;
};

export const VerificationCodeStep = ({ session, onExpired }: VerificationCodeStepProps) => {
  const content = useIntlayer("mfa");
  const { locale } = useLocale();
  const router = useRouter();
  const getErrorMessage = useAuthErrorMessage();
  const cooldown = useCooldown(OTP_COOLDOWN_KEY);
  const variant = variantOf(session.methods);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("");

  const handleError = (cause: unknown) => {
    if (cause instanceof AuthRequestError && cause.key === "sessionExpired") return onExpired();
    setError(cause);
  };

  const sendCode = useMutation({
    mutationFn: () => callAuth((fetchOptions) => authClient.twoFactor.sendOtp({ fetchOptions })),
    onMutate: () => {
      setError(null);
      setStatus(content.sending.value);
    },
    onSuccess: () => {
      cooldown.start();
      mfaSession.update({ emailCodeRequested: true });
      setStatus(content.codeSent.value);
    },
    onError: (cause) => {
      setStatus("");
      if (cause instanceof AuthRequestError && cause.key === "tooManyRequests") {
        cooldown.start(cause.retryAfter);
        mfaSession.update({ emailCodeRequested: true });
      }
      handleError(cause);
    },
  });

  const verify = useMutation({
    mutationFn: (code: string) => verifyCode(variant, session.emailCodeRequested, code),
    onMutate: () => {
      setError(null);
      setStatus(content.verifying.value);
    },
    onSuccess: () => {
      mfaSession.clear();
      router.replace(`/${locale}/dashboard`);
    },
    onError: (cause) => {
      setStatus("");
      setAttempt((count) => count + 1);
      handleError(cause);
    },
  });

  const autoSent = useRef(false);
  const { mutate: send } = sendCode;
  useEffect(() => {
    if (variant !== "otp" || session.emailCodeRequested || autoSent.current) return;
    autoSent.current = true;
    send();
  }, [variant, session.emailCodeRequested, send]);

  const showResend = variant === "otp" || (variant === "both" && session.emailCodeRequested);
  const isVerifying = verify.isPending || verify.isSuccess;

  return (
    <AuthCard title={content.title}>
      <FormError message={getErrorMessage(error)} className="mt-xl" />
      <OtpInput
        key={attempt}
        autoFocus
        label={content.codeLabel.value}
        digitLabel={(position, total) => String(content.digitLabel({ position, total }))}
        disabled={isVerifying}
        invalid={Boolean(error) && !isVerifying}
        onComplete={(code) => verify.mutate(code)}
        className="mt-[2.4375rem]"
      />
      <p role="status" className="sr-only">
        {status}
      </p>
      <div className="mt-[0.5625rem] flex flex-col items-center">
        {showResend ? (
          <ResendButton
            label={content.resendCode}
            remaining={cooldown.remaining}
            countdown={String(content.cooldown({ seconds: cooldown.remaining }))}
            countdownLabel={String(content.cooldownLabel({ seconds: cooldown.remaining }))}
            onClick={() => sendCode.mutate()}
            isPending={sendCode.isPending}
          />
        ) : (
          variant === "both" && (
            <TextButton onClick={() => sendCode.mutate()} disabled={sendCode.isPending}>
              {content.sendEmailCode}
            </TextButton>
          )
        )}
        <TextButton onClick={() => mfaSession.update({ view: "recovery" })}>{content.useRecoveryCode}</TextButton>
      </div>
      <p className="mt-[2.25rem] text-center text-s leading-[1.1875rem] font-light text-white/80">
        {content.help[variant]}
      </p>
    </AuthCard>
  );
};
