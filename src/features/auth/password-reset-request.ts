"use client";

import { useSyncExternalStore } from "react";

// The address the reset link was sent to, kept for this tab so a reload stays on the
// "check your inbox" screen and "Renvoyer le lien" can reuse it.
const STORAGE_KEY = "stolos:password-reset-email";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const write = (email: string | null) => {
  try {
    if (email) window.sessionStorage.setItem(STORAGE_KEY, email);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the confirmation won't survive a reload.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const passwordResetRequest = {
  save: (email: string) => write(email),
  clear: () => write(null),
};

export const usePasswordResetEmail = () => useSyncExternalStore(subscribe, read, () => null);

export const PASSWORD_RESET_COOLDOWN_KEY = "password-reset";
