// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

const intlayer = vi.hoisted(() => ({ intlayerProxy: vi.fn() }));
vi.mock("next-intlayer/proxy", () => intlayer);

const getSession = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));

const SESSION_COOKIE = "better-auth.session_token=abc.def";

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} });

beforeEach(() => {
  intlayer.intlayerProxy.mockReset().mockReturnValue(NextResponse.next());
  getSession.mockReset().mockResolvedValue(null);
});

describe("proxy", () => {
  it.each(["/fr/dashboard", "/en/dashboard", "/fr/dashboard/settings"])(
    "sends %s to the sign-in page of the same language without a session cookie",
    async (path) => {
      const response = await proxy(request(path));
      const locale = path.split("/")[1];
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(`http://localhost:3000/${locale}/login`);
      expect(intlayer.intlayerProxy).not.toHaveBeenCalled();
    },
  );

  it("lets a request with a session cookie through to the page, which validates it", async () => {
    await proxy(request("/fr/dashboard", SESSION_COOKIE));
    expect(intlayer.intlayerProxy).toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });

  it.each(["/fr/login", "/en/forgot-password", "/dashboard", "/fr/dashboards"])(
    "leaves %s to the locale proxy",
    async (path) => {
      await proxy(request(path));
      expect(intlayer.intlayerProxy).toHaveBeenCalled();
    },
  );

  it.each(["/fr/login", "/en/login", "/en/login/"])("sends a signed-in user from %s to the dashboard", async (path) => {
    getSession.mockResolvedValue({ session: { id: "s1" }, user: { id: "u1" } });
    const response = await proxy(request(path, SESSION_COOKIE));
    const locale = path.split("/")[1];
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`http://localhost:3000/${locale}/dashboard`);
    expect(intlayer.intlayerProxy).not.toHaveBeenCalled();
  });

  it("asks Better Auth to validate the cookie before leaving the sign-in page", async () => {
    getSession.mockResolvedValue({ session: { id: "s1" }, user: { id: "u1" } });
    await proxy(request("/fr/login", SESSION_COOKIE));
    const { headers } = getSession.mock.calls[0][0];
    expect(headers.get("cookie")).toContain("better-auth.session_token");
  });

  it("shows the sign-in page for a stale cookie, so it cannot loop with the dashboard", async () => {
    await proxy(request("/fr/login", SESSION_COOKIE));
    expect(getSession).toHaveBeenCalled();
    expect(intlayer.intlayerProxy).toHaveBeenCalled();
  });

  it("does not query the database for the sign-in page without a session cookie", async () => {
    await proxy(request("/fr/login"));
    expect(getSession).not.toHaveBeenCalled();
    expect(intlayer.intlayerProxy).toHaveBeenCalled();
  });

  it("keeps the in-progress verification on the sign-in page (no session yet)", async () => {
    await proxy(request("/fr/login", "better-auth.two_factor=abc.def"));
    expect(getSession).not.toHaveBeenCalled();
    expect(intlayer.intlayerProxy).toHaveBeenCalled();
  });
});
