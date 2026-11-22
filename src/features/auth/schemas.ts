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

export const createSignUpSchema = (m: ValidationMessages) =>
  z
    .object({
      email: emailSchema(m),
      password: z
        .string()
        .min(1, { error: m.passwordRequired })
        .min(PASSWORD_MIN_LENGTH, { error: m.passwordTooShort }),
      confirmPassword: z.string().min(1, { error: m.passwordRequired }),
    })
    .refine((values) => values.password === values.confirmPassword, {
      error: m.passwordsMismatch,
      path: ["confirmPassword"],
    });

export type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof createSignUpSchema>>;
