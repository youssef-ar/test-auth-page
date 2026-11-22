import { describe, expect, it } from "vitest";
import { createSignInSchema, createSignUpSchema, type ValidationMessages } from "./schemas";

const messages: ValidationMessages = {
  emailRequired: "emailRequired",
  emailInvalid: "emailInvalid",
  passwordRequired: "passwordRequired",
  passwordTooShort: "passwordTooShort",
  passwordsMismatch: "passwordsMismatch",
};

const issues = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]));

describe("sign-in schema", () => {
  const schema = createSignInSchema(messages);

  it("requires both fields", () => {
    expect(issues(schema.safeParse({ email: "", password: "" }))).toEqual({
      email: "emailRequired",
      password: "passwordRequired",
    });
  });

  it("rejects a malformed email and trims spaces", () => {
    expect(issues(schema.safeParse({ email: "nope", password: "x" }))).toEqual({ email: "emailInvalid" });
    expect(schema.parse({ email: "  none@example.com ", password: "x" }).email).toBe("none@example.com");
  });
});

describe("sign-up schema", () => {
  const schema = createSignUpSchema(messages);

  it("enforces the 8-character minimum", () => {
    expect(issues(schema.safeParse({ email: "a@b.co", password: "short", confirmPassword: "short" }))).toEqual({
      password: "passwordTooShort",
    });
  });

  it("reports a mismatch on the confirmation field", () => {
    expect(
      issues(schema.safeParse({ email: "a@b.co", password: "long-enough", confirmPassword: "different" })),
    ).toEqual({ confirmPassword: "passwordsMismatch" });
  });

  it("accepts valid values", () => {
    expect(schema.safeParse({ email: "a@b.co", password: "long-enough", confirmPassword: "long-enough" }).success).toBe(
      true,
    );
  });
});
