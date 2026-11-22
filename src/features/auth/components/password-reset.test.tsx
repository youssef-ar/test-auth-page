import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "./forgot-password-form";
import { LinkSentStep } from "./link-sent-step";
import { ResetPasswordFlow } from "./reset-password-flow";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => navigation.searchParams }));

const auth = vi.hoisted(() => ({ requestPasswordReset: vi.fn(), resetPassword: vi.fn() }));
vi.mock("@/lib/auth-client", () => ({ authClient: auth }));

type FetchOptions = { onError: (context: { response: Response }) => void };
const ok = async () => ({ data: { status: true }, error: null });
const failWith =
  (status: number, code?: string, headers?: Record<string, string>) =>
  async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
    fetchOptions.onError({ response: new Response(null, { status, headers }) });
    return { data: null, error: { status, code } };
  };

const renderWithQuery = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const storedEmail = () => window.sessionStorage.getItem("stolos:password-reset-email");

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
  navigation.searchParams = new URLSearchParams();
});

describe("ForgotPasswordForm", () => {
  it("asks for a link that comes back to the reset page in the current language", async () => {
    auth.requestPasswordReset.mockImplementation(ok);
    renderWithQuery(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth-form.email"), "none@example.com");
    await userEvent.click(screen.getByRole("button", { name: /password-reset.request.submit/ }));

    expect(auth.requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({ email: "none@example.com", redirectTo: "/en/reset-password" }),
    );
    await vi.waitFor(() => expect(storedEmail()).toBe("none@example.com"));
  });

  it("validates the email first", async () => {
    renderWithQuery(<ForgotPasswordForm />);
    await userEvent.click(screen.getByRole("button", { name: /password-reset.request.submit/ }));

    expect(await screen.findByText("auth-form.validation.emailRequired")).toBeInTheDocument();
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("shows the server's wait time and locks the button on a 429", async () => {
    auth.requestPasswordReset.mockImplementation(failWith(429, undefined, { "X-Retry-After": "14" }));
    renderWithQuery(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth-form.email"), "none@example.com");
    await userEvent.click(screen.getByRole("button", { name: /password-reset.request.submit/ }));

    expect(await screen.findByText('auth-errors.tooManyRequestsRetry({"seconds":14})')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /password-reset.request.submit/ })).toBeDisabled();
    expect(storedEmail()).toBeNull();
  });
});

describe("LinkSentStep", () => {
  it("resends to the same address once the countdown is over", async () => {
    auth.requestPasswordReset.mockImplementation(ok);
    renderWithQuery(<LinkSentStep email="none@example.com" />);

    await userEvent.click(screen.getByRole("button", { name: /password-reset.sent.resend/ }));

    expect(auth.requestPasswordReset).toHaveBeenCalledWith(expect.objectContaining({ email: "none@example.com" }));
    expect(await screen.findByRole("status")).toHaveTextContent("password-reset.sent.resent");
    expect(screen.getByRole("button", { name: /password-reset.sent.resend/ })).toBeDisabled();
  });

  it("is locked while a previous send is still counting down (e.g. after a reload)", () => {
    window.localStorage.setItem("stolos:cooldown:password-reset", String(Date.now() + 20_000));
    renderWithQuery(<LinkSentStep email="none@example.com" />);

    const resend = screen.getByRole("button", { name: /password-reset.sent.resend/ });
    expect(resend).toBeDisabled();
    expect(resend).toHaveTextContent('password-reset.cooldown({"seconds":20})');
  });
});

describe("ResetPasswordFlow", () => {
  it.each([
    ["no token", ""],
    ["Better Auth's INVALID_TOKEN redirect", "error=INVALID_TOKEN"],
  ])("shows the expired-link screen with %s", (_, query) => {
    navigation.searchParams = new URLSearchParams(query);
    renderWithQuery(<ResetPasswordFlow />);

    expect(screen.getByRole("heading", { name: "password-reset.invalid.title" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "password-reset.invalid.requestNew" })).toHaveAttribute(
      "href",
      "/en/forgot-password",
    );
  });

  const submitNewPassword = async (confirm = "Nouveau-Pass-2026") => {
    await userEvent.type(screen.getByLabelText("password-reset.reset.password"), "Nouveau-Pass-2026");
    await userEvent.type(screen.getByLabelText("auth-form.confirmPassword"), confirm);
    await userEvent.click(screen.getByRole("button", { name: "password-reset.reset.submit" }));
  };

  it("sets the new password with the token from the link", async () => {
    auth.resetPassword.mockImplementation(ok);
    window.sessionStorage.setItem("stolos:password-reset-email", "none@example.com");
    navigation.searchParams = new URLSearchParams("token=abc123");
    renderWithQuery(<ResetPasswordFlow />);

    await submitNewPassword();

    expect(auth.resetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ newPassword: "Nouveau-Pass-2026", token: "abc123" }),
    );
    expect(await screen.findByRole("heading", { name: "password-reset.done.title" })).toBeInTheDocument();
    expect(storedEmail()).toBeNull();
  });

  it("blocks mismatching passwords", async () => {
    navigation.searchParams = new URLSearchParams("token=abc123");
    renderWithQuery(<ResetPasswordFlow />);

    await submitNewPassword("Something-else");

    expect(await screen.findByText("auth-form.validation.passwordsMismatch")).toBeInTheDocument();
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it("switches to the expired-link screen when the server refuses the token", async () => {
    auth.resetPassword.mockImplementation(failWith(400, "INVALID_TOKEN"));
    navigation.searchParams = new URLSearchParams("token=used");
    renderWithQuery(<ResetPasswordFlow />);

    await submitNewPassword();

    expect(await screen.findByRole("heading", { name: "password-reset.invalid.title" })).toBeInTheDocument();
  });
});
