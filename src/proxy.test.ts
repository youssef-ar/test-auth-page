// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

const intlayer = vi.hoisted(() => ({ intlayerProxy: vi.fn() }));
vi.mock("next-intlayer/proxy", () => intlayer);

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} });

beforeEach(() => {
  intlayer.intlayerProxy.mockReset().mockReturnValue(NextResponse.next());
});

describe("proxy", () => {
  it.each(["/fr/dashboard", "/en/dashboard", "/fr/dashboard/settings"])(
    "sends %s to the sign-in page of the same language without a session cookie",
    (path) => {
      const response = proxy(request(path));
      const locale = path.split("/")[1];
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(`http://localhost:3000/${locale}/login`);
      expect(intlayer.intlayerProxy).not.toHaveBeenCalled();
    },
  );

  it("lets a request with a session cookie through to the page, which validates it", () => {
    proxy(request("/fr/dashboard", "better-auth.session_token=abc.def"));
    expect(intlayer.intlayerProxy).toHaveBeenCalled();
  });

  it.each(["/fr/login", "/en/forgot-password", "/dashboard", "/fr/dashboards"])(
    "leaves %s to the locale proxy",
    (path) => {
      proxy(request(path));
      expect(intlayer.intlayerProxy).toHaveBeenCalled();
    },
  );
});
