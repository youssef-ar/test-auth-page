import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCooldown } from "./use-cooldown";

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCooldown", () => {
  it("counts down from 30 seconds by default", () => {
    const { result } = renderHook(() => useCooldown("test"));
    expect(result.current.isActive).toBe(false);

    act(() => result.current.start());
    expect(result.current.remaining).toBe(30);

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.remaining).toBe(20);

    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("uses the server's wait time when given", () => {
    const { result } = renderHook(() => useCooldown("test"));
    act(() => result.current.start(12));
    expect(result.current.remaining).toBe(12);
  });

  it("survives a remount, as after a page reload", () => {
    const first = renderHook(() => useCooldown("test"));
    act(() => first.result.current.start());
    act(() => vi.advanceTimersByTime(18_000));
    first.unmount();

    const second = renderHook(() => useCooldown("test"));
    expect(second.result.current.remaining).toBe(12);
  });

  it("keeps separate countdowns per key", () => {
    const { result } = renderHook(() => ({ a: useCooldown("a"), b: useCooldown("b") }));
    act(() => result.current.a.start());
    expect(result.current.a.isActive).toBe(true);
    expect(result.current.b.isActive).toBe(false);
  });
});
