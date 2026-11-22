"use client";

import { type ReactNode, useId } from "react";
import { TextButton } from "./text-button";

type ResendButtonProps = {
  label: ReactNode;
  remaining: number;
  countdown: string;
  countdownLabel: string;
  onClick: () => void;
  isPending?: boolean;
};

export const ResendButton = ({ label, remaining, countdown, countdownLabel, onClick, isPending }: ResendButtonProps) => {
  const descriptionId = useId();
  const isWaiting = remaining > 0;

  return (
    <TextButton
      onClick={onClick}
      disabled={isWaiting || isPending}
      aria-describedby={isWaiting ? descriptionId : undefined}
    >
      <span className={isWaiting ? "text-white/50" : undefined}>{label}</span>
      {isWaiting && (
        <>
          <span aria-hidden className="ml-s text-white/80">
            {countdown}
          </span>
          <span id={descriptionId} className="sr-only">
            {countdownLabel}
          </span>
        </>
      )}
    </TextButton>
  );
};
