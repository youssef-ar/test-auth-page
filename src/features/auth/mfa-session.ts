"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { TwoFactorMethod } from "./two-factor";

const MAX_AGE_MS = 10 * 60 * 1000;
const STORAGE_KEY = "stolos:mfa";

export type MfaView = "code" | "recovery";

export type MfaSession = {
  methods: TwoFactorMethod[];
  startedAt: number;
  view: MfaView;
  emailCodeRequested: boolean;
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const readRaw = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const write = (session: MfaSession | null) => {
  try {
    if (session) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    
  }
  notify();
};

const parse = (raw: string | null): MfaSession | null => {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as MfaSession;
    if (!Array.isArray(session.methods) || Date.now() - session.startedAt > MAX_AGE_MS) return null;
    return session;
  } catch {
    return null;
  }
};

export const mfaSession = {
  start: (methods: TwoFactorMethod[]) =>
    write({ methods, startedAt: Date.now(), view: "code", emailCodeRequested: false }),
  update: (patch: Partial<Omit<MfaSession, "methods" | "startedAt">>) => {
    const current = parse(readRaw());
    if (current) write({ ...current, ...patch });
  },
  clear: () => write(null),
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useMfaSession = () => {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
};
