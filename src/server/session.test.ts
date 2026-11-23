// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "./session";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findFirst: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
}));

vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: "better-auth.session_token=x" }) }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("@/lib/prisma", () => ({ prisma: { twoFactor: { findFirst: mocks.findFirst } } }));

const session = (user: Record<string, unknown>) => ({
  session: { id: "s1" },
  user: { id: "u1", name: "Ada", email: "ada@example.com", ...user },
});

beforeEach(() => vi.clearAllMocks());

describe("getCurrentUser", () => {
  it("sends a visitor without a valid session to the sign-in page of their language", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(getCurrentUser("en")).rejects.toThrow("NEXT_REDIRECT /en/login");
    expect(mocks.redirect).toHaveBeenCalledWith("/en/login");
  });

  it("asks Better Auth to validate the request's cookies", async () => {
    mocks.getSession.mockResolvedValue(session({ twoFactorEnabled: false }));
    await getCurrentUser("fr");
    const { headers } = mocks.getSession.mock.calls[0][0];
    expect(headers.get("cookie")).toContain("better-auth.session_token");
  });

  it.each([
    ["no second step", { twoFactorEnabled: false, emailTwoFactorEnabled: false }, null, []],
    ["a verified app", { twoFactorEnabled: true, emailTwoFactorEnabled: false }, { id: "tf" }, ["totp"]],
    ["app and email", { twoFactorEnabled: true, emailTwoFactorEnabled: true }, { id: "tf" }, ["totp", "otp"]],
    ["email only (unverified app secret)", { twoFactorEnabled: true, emailTwoFactorEnabled: true }, null, ["otp"]],
  ])("reports the methods of an account with %s", async (_, user, appFactor, methods) => {
    mocks.getSession.mockResolvedValue(session(user));
    mocks.findFirst.mockResolvedValue(appFactor);

    const current = await getCurrentUser("fr");

    expect(current).toEqual({ name: "Ada", email: "ada@example.com", twoFactorMethods: methods });
  });

  it("only counts a verified app secret", async () => {
    mocks.getSession.mockResolvedValue(session({ twoFactorEnabled: true }));
    mocks.findFirst.mockResolvedValue(null);
    await getCurrentUser("fr");
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1", verified: true } }),
    );
  });
});
