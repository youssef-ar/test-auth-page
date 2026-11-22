import { describe, expect, it } from "vitest";
import { readTwoFactorMethods } from "./two-factor";

describe("readTwoFactorMethods", () => {
  it("returns null when sign-in created a session", () => {
    expect(readTwoFactorMethods({ token: "t", user: {} })).toBeNull();
    expect(readTwoFactorMethods(null)).toBeNull();
    expect(readTwoFactorMethods({ twoFactorRedirect: false })).toBeNull();
  });

  it("returns the account's methods when a second step is needed", () => {
    expect(readTwoFactorMethods({ twoFactorRedirect: true, twoFactorMethods: ["totp"] })).toEqual(["totp"]);
    expect(readTwoFactorMethods({ twoFactorRedirect: true, twoFactorMethods: ["totp", "otp"] })).toEqual([
      "totp",
      "otp",
    ]);
  });

  it("drops methods the UI doesn't know and copes with a missing list", () => {
    expect(readTwoFactorMethods({ twoFactorRedirect: true, twoFactorMethods: ["otp", "passkey"] })).toEqual(["otp"]);
    expect(readTwoFactorMethods({ twoFactorRedirect: true })).toEqual([]);
  });
});
