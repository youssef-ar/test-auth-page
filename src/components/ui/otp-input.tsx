"use client";

import { type ClipboardEvent, type KeyboardEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  label: string;
  digitLabel: (position: number, total: number) => string;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
};

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const OtpInput = ({
  length = 6,
  onComplete,
  label,
  digitLabel,
  disabled,
  invalid,
  autoFocus,
  className,
}: OtpInputProps) => {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (index: number) => {
    const input = inputs.current[Math.max(0, Math.min(length - 1, index))];
    input?.focus();
    input?.select();
  };

  const commit = (next: string[], focusIndex: number) => {
    setDigits(next);
    if (next.every(Boolean)) {
      inputs.current[focusIndex]?.blur();
      onComplete(next.join(""));
    } else {
      focus(focusIndex);
    }
  };

  const fill = (index: number, text: string) => {
    const incoming = digitsOf(text).slice(0, length);
    if (!incoming) return;
    const start = incoming.length >= length ? 0 : index;
    const next = [...digits];
    [...incoming].forEach((digit, offset) => {
      if (start + offset < length) next[start + offset] = digit;
    });
    commit(next, Math.min(start + incoming.length, length - 1));
  };

  const onPaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fill(index, event.clipboardData.getData("text"));
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      const target = digits[index] ? index : index - 1;
      if (target < 0) return;
      next[target] = "";
      setDigits(next);
      focus(target);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  };

  return (
    <div role="group" aria-label={label} className={cn("flex justify-center gap-[0.75rem]", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          value={digit}
          onChange={(event) => {
            const { value } = event.target;
            const typed = digit && value.length === 2 ? value.replace(digit, "") : value;
            fill(index, typed);
          }}
          onPaste={onPaste(index)}
          onKeyDown={onKeyDown(index)}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-label={digitLabel(index + 1, length)}
          aria-invalid={invalid || undefined}
          placeholder="0"
          className={cn(
            "h-[5rem] w-[3.25rem] rounded-xs border border-white bg-transparent text-center text-l text-white",
            "transition-colors placeholder:text-white/20 focus:bg-white/10 focus:outline-none",
            "disabled:opacity-50",
            invalid && "border-danger hover:border-danger focus:border-danger",
          )}
        />
      ))}
    </div>
  );
};
