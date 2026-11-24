import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MfaSession, mfaSession } from "../mfa-session";
import { RecoveryCodeStep } from "./recovery-code-step";
import { VerificationCodeStep } from "./verification-code-step";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const twoFactor = vi.hoisted(() => ({
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
  verifyTotp: vi.fn(),
  verifyBackupCode: vi.fn(),
}));
vi.mock("@/lib/auth-client", () => ({ authClient: { twoFactor } }));

type FetchOptions = { onError: (context: { response: Response }) => void };
const ok = async () => ({ data: { token: "t" }, error: null });
const failWith =
  (status: number, code?: string, headers?: Record<string, string>) =>
  async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
    fetchOptions.onError({ response: new Response(null, { status, headers }) });
    return { data: null, error: { status, code } };
  };

const session = (methods: MfaSession["methods"], patch: Partial<MfaSession> = {}): MfaSession => ({
  methods,
  startedAt: Date.now(),
  view: "code",
  emailCodeRequested: false,
  ...patch,
});

const renderWithQuery = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const enterCode = async (code = "123456") => {
  const [first] = screen.getAllByRole("textbox");
  await userEvent.click(first);
  await userEvent.paste(code);
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("VerificationCodeStep", () => {
  it("app only: verifies with the app code and offers no email option", async () => {
    twoFactor.verifyTotp.mockImplementation(ok);
    renderWithQuery(<VerificationCodeStep session={session(["totp"])} onRestart={vi.fn()} />);

    expect(screen.queryByText("mfa.sendEmailCode")).not.toBeInTheDocument();
    expect(screen.queryByText("mfa.resendCode")).not.toBeInTheDocument();
    expect(screen.getByText("mfa.help.totp")).toBeInTheDocument();
    expect(twoFactor.sendOtp).not.toHaveBeenCalled();

    await enterCode();
    expect(twoFactor.verifyTotp).toHaveBeenCalledWith(expect.objectContaining({ code: "123456" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
  });

  it("email only: sends a code on arrival, once, and starts the countdown", async () => {
    twoFactor.sendOtp.mockImplementation(ok);
    renderWithQuery(<VerificationCodeStep session={session(["otp"])} onRestart={vi.fn()} />);

    await vi.waitFor(() => expect(twoFactor.sendOtp).toHaveBeenCalledTimes(1));
    const resend = await screen.findByRole("button", { name: /mfa.resendCode/ });
    expect(resend).toBeDisabled();
    expect(resend).toHaveTextContent('mfa.cooldown({"seconds":30})');
  });

  it("email only: does not send again when a code was already requested (after a reload)", async () => {
    renderWithQuery(<VerificationCodeStep session={session(["otp"], { emailCodeRequested: true })} onRestart={vi.fn()} />);
    expect(screen.getByRole("button", { name: /mfa.resendCode/ })).toBeEnabled();
    expect(twoFactor.sendOtp).not.toHaveBeenCalled();
  });

  it("app + email: the email link sends a code", async () => {
    twoFactor.sendOtp.mockImplementation(ok);
    mfaSession.start(["totp", "otp"]);
    renderWithQuery(<VerificationCodeStep session={session(["totp", "otp"])} onRestart={vi.fn()} />);
    expect(twoFactor.sendOtp).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "mfa.sendEmailCode" }));
    expect(twoFactor.sendOtp).toHaveBeenCalledTimes(1);
    await vi.waitFor(() =>
      expect(JSON.parse(window.sessionStorage.getItem("stolos:mfa") ?? "{}")).toMatchObject({ emailCodeRequested: true }),
    );
    expect(window.localStorage.getItem("stolos:cooldown:two-factor-otp")).not.toBeNull();
  });

  it("app + email: after an email code, an app code still works", async () => {
    twoFactor.verifyOtp.mockImplementation(failWith(401, "INVALID_CODE"));
    twoFactor.verifyTotp.mockImplementation(ok);
    renderWithQuery(
      <VerificationCodeStep session={session(["totp", "otp"], { emailCodeRequested: true })} onRestart={vi.fn()} />,
    );

    await enterCode();
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
    expect(twoFactor.verifyOtp).toHaveBeenCalled();
    expect(twoFactor.verifyTotp).toHaveBeenCalled();
  });

  it("shows a wrong code and clears the boxes", async () => {
    twoFactor.verifyTotp.mockImplementation(failWith(401, "INVALID_CODE"));
    renderWithQuery(<VerificationCodeStep session={session(["totp"])} onRestart={vi.fn()} />);

    await enterCode();
    expect(await screen.findByText("auth-errors.invalidCode")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").map((box) => (box as HTMLInputElement).value).join("")).toBe("");
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends the user back to sign-in when the attempt expired", async () => {
    twoFactor.verifyTotp.mockImplementation(failWith(401, "INVALID_TWO_FACTOR_COOKIE"));
    const onRestart = vi.fn();
    renderWithQuery(<VerificationCodeStep session={session(["totp"])} onRestart={onRestart} />);

    await enterCode();
    await vi.waitFor(() => expect(onRestart).toHaveBeenCalledWith("sessionExpired"));
  });

  it("app code: too many tries ends the sign-in attempt", async () => {
    twoFactor.verifyTotp.mockImplementation(failWith(400, "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"));
    const onRestart = vi.fn();
    renderWithQuery(<VerificationCodeStep session={session(["totp"])} onRestart={onRestart} />);

    await enterCode();
    await vi.waitFor(() => expect(onRestart).toHaveBeenCalledWith("signInAttemptsExceeded"));
  });

  it("email code: too many tries asks for a new code and stays on the screen", async () => {
    twoFactor.verifyOtp.mockImplementation(failWith(400, "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"));
    const onRestart = vi.fn();
    renderWithQuery(
      <VerificationCodeStep session={session(["otp"], { emailCodeRequested: true })} onRestart={onRestart} />,
    );

    await enterCode();
    expect(await screen.findByText("auth-errors.codeAttemptsExceeded")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mfa.resendCode/ })).toBeInTheDocument();
    expect(onRestart).not.toHaveBeenCalled();
  });

  it("follows the server's wait time when a send is refused", async () => {
    twoFactor.sendOtp.mockImplementation(failWith(429, undefined, { "X-Retry-After": "17" }));
    renderWithQuery(<VerificationCodeStep session={session(["otp"])} onRestart={vi.fn()} />);

    expect(await screen.findByRole("button", { name: /mfa.resendCode/ })).toHaveTextContent(
      'mfa.cooldown({"seconds":17})',
    );
  });
});

describe("RecoveryCodeStep", () => {
  it("signs in with a recovery code", async () => {
    twoFactor.verifyBackupCode.mockImplementation(ok);
    renderWithQuery(<RecoveryCodeStep onRestart={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("mfa.recovery.label"), "  abcde-fghij ");
    await userEvent.click(screen.getByRole("button", { name: "mfa.recovery.submit" }));

    expect(twoFactor.verifyBackupCode).toHaveBeenCalledWith(expect.objectContaining({ code: "abcde-fghij" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/en/dashboard"));
  });

  it("shows a used or wrong recovery code", async () => {
    twoFactor.verifyBackupCode.mockImplementation(failWith(401, "INVALID_BACKUP_CODE"));
    renderWithQuery(<RecoveryCodeStep onRestart={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("mfa.recovery.label"), "used-code");
    await userEvent.click(screen.getByRole("button", { name: "mfa.recovery.submit" }));

    expect(await screen.findByText("auth-errors.invalidRecoveryCode")).toBeInTheDocument();
  });

  it("too many tries ends the sign-in attempt (shared with app codes)", async () => {
    twoFactor.verifyBackupCode.mockImplementation(failWith(400, "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"));
    const onRestart = vi.fn();
    renderWithQuery(<RecoveryCodeStep onRestart={onRestart} />);

    await userEvent.type(screen.getByLabelText("mfa.recovery.label"), "wrong-code");
    await userEvent.click(screen.getByRole("button", { name: "mfa.recovery.submit" }));

    await vi.waitFor(() => expect(onRestart).toHaveBeenCalledWith("signInAttemptsExceeded"));
  });
});
