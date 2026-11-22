import { describe, expect, it } from "vitest";
import { AuthRequestError, callAuth, toAuthRequestError } from "./errors";

describe("toAuthRequestError", () => {
  it.each([
    ["INVALID_EMAIL_OR_PASSWORD", 401, "invalidCredentials"],
    ["USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", 422, "emailTaken"],
    ["INVALID_CODE", 401, "invalidCode"],
    ["INVALID_TWO_FACTOR_COOKIE", 401, "sessionExpired"],
    ["INVALID_TOKEN", 400, "invalidToken"],
    ["SOMETHING_NEW", 500, "unknown"],
  ])("maps %s to %s", (code, status, key) => {
    expect(toAuthRequestError({ code, status }).key).toBe(key);
  });

  it("reads the wait time of a 429 from X-Retry-After", () => {
    const error = toAuthRequestError({ status: 429 }, "7");
    expect(error.key).toBe("tooManyRequests");
    expect(error.retryAfter).toBe(7);
  });

  it("ignores a missing or invalid X-Retry-After", () => {
    expect(toAuthRequestError({ status: 429 }, null).retryAfter).toBeUndefined();
    expect(toAuthRequestError({ status: 429 }, "soon").retryAfter).toBeUndefined();
  });
});

describe("callAuth", () => {
  it("returns the data of a successful call", async () => {
    await expect(callAuth(async () => ({ data: { ok: true }, error: null }))).resolves.toEqual({ ok: true });
  });

  it("throws an AuthRequestError carrying the header seen by onError", async () => {
    const promise = callAuth(async ({ onError }) => {
      onError({ response: new Response(null, { status: 429, headers: { "X-Retry-After": "12" } }) });
      return { data: null, error: { status: 429 } };
    });
    await expect(promise).rejects.toBeInstanceOf(AuthRequestError);
    await expect(promise).rejects.toMatchObject({ key: "tooManyRequests", retryAfter: 12 });
  });
});
