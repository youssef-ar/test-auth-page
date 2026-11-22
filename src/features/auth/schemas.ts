import { z } from "zod";

// Better Auth's default minimum.
export const PASSWORD_MIN_LENGTH = 8;

export type ValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordTooShort: string;
  passwordsMismatch: string;
};

const emailSchema = (m: ValidationMessages) =>
  z
    .string()
    .trim()
    .min(1, { error: m.emailRequired })
    .pipe(z.email({ error: m.emailInvalid }));

export const createSignInSchema = (m: ValidationMessages) =>
  z.object({
    email: emailSchema(m),
    password: z.string().min(1, { error: m.passwordRequired }),
  });

const newPasswordFields = (m: ValidationMessages) => ({
  password: z
    .string()
    .min(1, { error: m.passwordRequired })
    .min(PASSWORD_MIN_LENGTH, { error: m.passwordTooShort }),
  confirmPassword: z.string().min(1, { error: m.passwordRequired }),
});

const passwordsMatch = (values: { password: string; confirmPassword: string }) =>
  values.password === values.confirmPassword;

const mismatchIssue = (m: ValidationMessages) => ({ error: m.passwordsMismatch, path: ["confirmPassword"] });

export const createSignUpSchema = (m: ValidationMessages) =>
  z.object({ email: emailSchema(m), ...newPasswordFields(m) }).refine(passwordsMatch, mismatchIssue(m));

export const createForgotPasswordSchema = (m: ValidationMessages) => z.object({ email: emailSchema(m) });

export const createResetPasswordSchema = (m: ValidationMessages) =>
  z.object(newPasswordFields(m)).refine(passwordsMatch, mismatchIssue(m));

export type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof createSignUpSchema>>;
export type ForgotPasswordValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
export type ResetPasswordValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
