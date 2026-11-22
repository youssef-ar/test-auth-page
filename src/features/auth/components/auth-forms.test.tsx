import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const auth = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: auth.signIn }, signUp: { email: auth.signUp } },
}));

const renderWithQuery = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

type FetchOptions = { onError: (context: { response: Response }) => void };

const failWith = (status: number, code?: string, headers?: Record<string, string>) =>
  async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
    fetchOptions.onError({ response: new Response(null, { status, headers }) });
    return { data: null, error: { status, code } };
  };

const fillSignIn = async (email = "none@example.com", password = "Stolos-Test-2026") => {
  await userEvent.type(screen.getByLabelText("auth-form.email"), email);
  await userEvent.type(screen.getByLabelText("auth-form.password"), password);
  await userEvent.click(screen.getByRole("button", { name: "auth-form.signIn" }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignInForm", () => {
  it("validates the fields before calling the server", async () => {
    renderWithQuery(<SignInForm onTwoFactorRequired={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "auth-form.signIn" }));

    expect(await screen.findByText("auth-form.validation.emailRequired")).toBeInTheDocument();
    expect(screen.getByText("auth-form.validation.passwordRequired")).toBeInTheDocument();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it("goes to the dashboard when no second step is needed", async () => {
    auth.signIn.mockResolvedValue({ data: { token: "t", user: {} }, error: null });
    renderWithQuery(<SignInForm onTwoFactorRequired={vi.fn()} />);
    await fillSignIn();

    expect(auth.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ email: "none@example.com", password: "Stolos-Test-2026" }),
    );
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
  });

  it("hands the account's methods over when a second step is needed", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp", "otp"] }, error: null });
    const onTwoFactorRequired = vi.fn();
    renderWithQuery(<SignInForm onTwoFactorRequired={onTwoFactorRequired} />);
    await fillSignIn("both@example.com");

    await vi.waitFor(() => expect(onTwoFactorRequired).toHaveBeenCalledWith(["totp", "otp"]));
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows wrong credentials", async () => {
    auth.signIn.mockImplementation(failWith(401, "INVALID_EMAIL_OR_PASSWORD"));
    renderWithQuery(<SignInForm onTwoFactorRequired={vi.fn()} />);
    await fillSignIn();

    expect(await screen.findByText("auth-errors.invalidCredentials")).toBeInTheDocument();
  });

  it("shows how long to wait after too many attempts", async () => {
    auth.signIn.mockImplementation(failWith(429, undefined, { "X-Retry-After": "8" }));
    renderWithQuery(<SignInForm onTwoFactorRequired={vi.fn()} />);
    await fillSignIn();

    expect(await screen.findByText('auth-errors.tooManyRequestsRetry({"seconds":8})')).toBeInTheDocument();
  });
});

describe("SignUpForm", () => {
  const fillSignUp = async (confirm = "long-enough-1") => {
    await userEvent.type(screen.getByLabelText("auth-form.email"), "new.user@example.com");
    await userEvent.type(screen.getByLabelText("auth-form.password"), "long-enough-1");
    await userEvent.type(screen.getByLabelText("auth-form.confirmPassword"), confirm);
    await userEvent.click(screen.getByRole("button", { name: "auth-form.signUp" }));
  };

  it("blocks mismatching passwords", async () => {
    renderWithQuery(<SignUpForm />);
    await fillSignUp("something-else");

    expect(await screen.findByText("auth-form.validation.passwordsMismatch")).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("creates the account with a name derived from the email", async () => {
    auth.signUp.mockResolvedValue({ data: { token: "t", user: {} }, error: null });
    renderWithQuery(<SignUpForm />);
    await fillSignUp();

    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ name: "new.user", email: "new.user@example.com", password: "long-enough-1" }),
    );
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
  });

  it("puts an already used email on the email field", async () => {
    auth.signUp.mockImplementation(failWith(422, "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"));
    renderWithQuery(<SignUpForm />);
    await fillSignUp();

    expect(await screen.findByText("auth-errors.emailTaken")).toBeInTheDocument();
    expect(screen.getByLabelText("auth-form.email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("auth-form.email")).toHaveFocus();
  });
});
