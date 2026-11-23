"use client";

import { useCallback, useSyncExternalStore } from "react";

export const RESEND_COOLDOWN_SECONDS = 30;

const storageKey = (key: string) => `stolos:cooldown:${key}`;
const listeners = new Set<() => void>();

const readDeadline = (key: string) => {
  try {
    const value = Number(window.localStorage.getItem(storageKey(key)));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

const writeDeadline = (key: string, deadline: number) => {
  try {
    window.localStorage.setItem(storageKey(key), String(deadline));
  } catch {}
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  const tick = window.setInterval(listener, 250);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.clearInterval(tick);
  };
};

// The deadline is stored as a timestamp, so the countdown stays right after a reload or in another tab.
export const useCooldown = (key: string) => {
  const remaining = useSyncExternalStore(
    subscribe,
    () => Math.max(0, Math.ceil((readDeadline(key) - Date.now()) / 1000)),
    () => 0,
  );

  // On a 429 the server's X-Retry-After wins over the default.
  const start = useCallback(
    (seconds: number = RESEND_COOLDOWN_SECONDS) => writeDeadline(key, Date.now() + seconds * 1000),
    [key],
  );

  return { remaining, isActive: remaining > 0, start };
};
