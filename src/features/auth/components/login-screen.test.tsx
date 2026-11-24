import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginScreen } from "./login-screen";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const auth = vi.hoisted(() => ({
  signIn: vi.fn(),
  verifyTotp: vi.fn(),
  sendOtp: vi.fn(),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: auth.signIn },
    signUp: { email: vi.fn() },
    twoFactor: { verifyTotp: auth.verifyTotp, sendOtp: auth.sendOtp, verifyOtp: vi.fn(), verifyBackupCode: vi.fn() },
  },
}));

type FetchOptions = { onError: (context: { response: Response }) => void };

const renderScreen = (ui: ReactNode = <LoginScreen />) =>
  render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

// Both tab panels stay mounted (the hidden one keeps its input), so work in the visible one.
const signIn = async () => {
  const panel = within(screen.getByRole("tabpanel"));
  await userEvent.type(panel.getByLabelText("auth-form.email"), "app@example.com");
  await userEvent.type(panel.getByLabelText("auth-form.password"), "Stolos-Test-2026");
  await userEvent.click(panel.getByRole("button", { name: "auth-form.signIn" }));
};

const enterCode = async () => {
  const [first] = screen.getAllByRole("textbox");
  await userEvent.click(first);
  await userEvent.paste("123456");
};

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("LoginScreen", () => {
  it("switches between sign-in and sign-up in the same card, with the matching title", async () => {
    renderScreen();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("login-page.signin.title");

    await userEvent.click(screen.getByRole("tab", { name: "login-page.signup.tab" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("login-page.signup.title");
    expect(screen.getByRole("button", { name: "auth-form.signUp" })).toBeVisible();
  });

  it("replaces the form with the verification screen when the account has a second step", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }, error: null });
    renderScreen();

    await signIn();

    expect(await screen.findByRole("heading", { name: "mfa.title" })).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "mfa.codeLabel" })).toBeInTheDocument();
  });

  it("keeps the verification screen after a reload", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }, error: null });
    const { unmount } = renderScreen();
    await signIn();
    await screen.findByRole("heading", { name: "mfa.title" });
    unmount();

    renderScreen();
    expect(screen.getByRole("heading", { name: "mfa.title" })).toBeInTheDocument();
  });

  it("goes back to sign-in with an explanation when the 10-minute attempt has expired", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }, error: null });
    auth.verifyTotp.mockImplementation(async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
      fetchOptions.onError({ response: new Response(null, { status: 401 }) });
      return { data: null, error: { status: 401, code: "INVALID_TWO_FACTOR_COOKIE" } };
    });
    renderScreen();
    await signIn();
    await screen.findByRole("heading", { name: "mfa.title" });

    await enterCode();

    expect(await screen.findByRole("tab", { name: "login-page.signin.tab" })).toBeInTheDocument();
    expect(screen.getByText("auth-errors.sessionExpired")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("stolos:mfa")).toBeNull();
  });

  it("goes back to sign-in with an explanation when the app-code tries are used up", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }, error: null });
    auth.verifyTotp.mockImplementation(async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
      fetchOptions.onError({ response: new Response(null, { status: 400 }) });
      return { data: null, error: { status: 400, code: "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE" } };
    });
    renderScreen();
    await signIn();
    await screen.findByRole("heading", { name: "mfa.title" });

    await enterCode();

    expect(await screen.findByText("auth-errors.signInAttemptsExceeded")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("stolos:mfa")).toBeNull();
  });

  it("signs in through the verification screen", async () => {
    auth.signIn.mockResolvedValue({ data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] }, error: null });
    auth.verifyTotp.mockResolvedValue({ data: { token: "t" }, error: null });
    renderScreen();
    await signIn();
    await screen.findByRole("heading", { name: "mfa.title" });

    await enterCode();

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
    expect(window.sessionStorage.getItem("stolos:mfa")).toBeNull();
  });
});
