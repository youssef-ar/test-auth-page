import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mfaSession, useMfaSession } from "./mfa-session";

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("mfaSession", () => {
  it("starts on the code screen with the account's methods", () => {
    const { result } = renderHook(() => useMfaSession());
    expect(result.current).toBeNull();

    act(() => mfaSession.start(["totp", "otp"]));

    expect(result.current).toMatchObject({ methods: ["totp", "otp"], view: "code", emailCodeRequested: false });
  });

  it("is restored after a reload (a new hook reading the same tab storage)", () => {
    act(() => mfaSession.start(["otp"]));
    act(() => mfaSession.update({ view: "recovery", emailCodeRequested: true }));

    const { result } = renderHook(() => useMfaSession());
    expect(result.current).toMatchObject({ methods: ["otp"], view: "recovery", emailCodeRequested: true });
  });

  it("ignores updates when no step is in progress", () => {
    act(() => mfaSession.update({ view: "recovery" }));
    expect(window.sessionStorage.getItem("stolos:mfa")).toBeNull();
  });

  it("is cleared after sign-in or expiry", () => {
    const { result } = renderHook(() => useMfaSession());
    act(() => mfaSession.start(["totp"]));
    act(() => mfaSession.clear());
    expect(result.current).toBeNull();
  });

  it("expires with Better Auth's 10-minute sign-in attempt", () => {
    vi.useFakeTimers();
    act(() => mfaSession.start(["totp"]));
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);

    const { result } = renderHook(() => useMfaSession());
    expect(result.current).toBeNull();
  });

  it("ignores corrupted storage", () => {
    window.sessionStorage.setItem("stolos:mfa", "{not json");
    const { result } = renderHook(() => useMfaSession());
    expect(result.current).toBeNull();
  });
});
