"use client";

import { useLayoutEffect } from "react";

// With Cache Components, Next hides a page on navigation instead of unmounting it (React <Activity>) and
// restores its state when the user comes back. A request that finished just before leaving would come back
// still "succeeded", e.g. a sign-in button spinning forever after sign-out. The cleanup runs as the page is
// hidden, so it returns fresh. `reset` must be stable (TanStack Query's mutation `reset` is).
export const useResetWhenHidden = (reset: () => void) => {
  useLayoutEffect(() => reset, [reset]);
};
