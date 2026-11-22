"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";


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
  } catch {
    
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

// The deadline is stored as a timestamp, so the countdown stays right after a reload or in another tab.
export const useCooldown = (key: string) => {
  const deadline = useSyncExternalStore(
    subscribe,
    () => readDeadline(key),
    () => 0,
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline <= Date.now()) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) window.clearInterval(interval);
    }, 250);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const start = useCallback(
    (seconds: number = RESEND_COOLDOWN_SECONDS) => {
      const current = Date.now();
      setNow(current);
      writeDeadline(key, current + seconds * 1000);
    },
    [key],
  );

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  return { remaining, isActive: remaining > 0, start };
};
