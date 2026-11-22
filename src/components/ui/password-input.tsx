"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder" | "size"
> & {
  label: ReactNode;
  errorMessage?: string;
  /** Accessible names of the show/hide button, to be translated by the caller. */
  visibilityLabels: { show: string; hide: string };
};

const EyeOffIcon = () => (
  <svg aria-hidden width="16" height="16" viewBox="1163 590.5 16 16" fill="none">
    <path
      d="M1170.05 597.558C1169.8 597.808 1169.66 598.147 1169.66 598.501C1169.66 598.854 1169.8 599.194 1170.05 599.444C1170.3 599.694 1170.64 599.834 1171 599.834C1171.35 599.834 1171.69 599.693 1171.94 599.443M1174.12 601.615C1173.18 602.2 1172.1 602.507 1171 602.5C1168.6 602.5 1166.6 601.167 1165 598.5C1165.84 597.087 1166.8 596.048 1167.88 595.384M1169.78 594.62C1170.18 594.539 1170.59 594.499 1171 594.5C1173.4 594.5 1175.4 595.833 1177 598.5C1176.55 599.24 1176.08 599.878 1175.57 600.413M1165 592.5L1177 604.5"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg aria-hidden width="16" height="16" viewBox="1 1 18 18" fill="none">
    <path
      d="M8.33333 10C8.33333 10.442 8.50893 10.866 8.82149 11.1785C9.13405 11.4911 9.55797 11.6667 10 11.6667C10.442 11.6667 10.866 11.4911 11.1785 11.1785C11.4911 10.866 11.6667 10.442 11.6667 10C11.6667 9.55797 11.4911 9.13405 11.1785 8.82149C10.866 8.50893 10.442 8.33333 10 8.33333C9.55797 8.33333 9.13405 8.50893 8.82149 8.82149C8.50893 9.13405 8.33333 9.55797 8.33333 10ZM17.5 10C15.5 13.3333 13 15 10 15C7 15 4.5 13.3333 2.5 10C4.5 6.66667 7 5 10 5C13 5 15.5 6.66667 17.5 10Z"
      stroke="white"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { label, errorMessage, visibilityLabels, id, className, disabled, readOnly, "aria-describedby": describedBy, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        <div
          className={cn(
            "group/password relative rounded-s bg-white/5 font-display",
            errorMessage && "bg-danger/5",
          )}
        >
          <fieldset
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -top-2 inset-x-0 bottom-0 min-w-0 rounded-s border border-white/40 px-4 transition-colors duration-200 group-hover/password:border-white/60 group-focus-within/password:border-white/60 motion-reduce:transition-none",
              errorMessage
                && "border-danger group-hover/password:border-danger group-focus-within/password:border-danger",
            )}
          >
            <legend className="invisible h-4 max-w-0 overflow-hidden whitespace-nowrap text-xs leading-4 transition-[max-width] duration-200 group-has-[input:not(:placeholder-shown)]/password:max-w-full motion-reduce:transition-none">
              <span className="px-1">{label}</span>
            </legend>
          </fieldset>
          <Input
            {...props}
            ref={ref}
            type={isVisible ? "text" : "password"}
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={errorMessage ? true : props["aria-invalid"]}
            id={inputId}
            aria-describedby={
              [describedBy, errorMessage ? errorId : undefined].filter(Boolean).join(" ") || undefined
            }
            placeholder=" "
            className="h-[3.0625rem] w-full gap-4 pr-[1.125rem] pl-5"
            inputClassName="h-7 w-full text-sx leading-7 text-white"
            rightElement={
              <Button
                type="button"
                variant="ghostMonochrome"
                className="size-6 items-center justify-center rounded-sm p-0 text-white hover:text-white focus-visible:outline focus-visible:outline-white/60"
                aria-label={isVisible ? visibilityLabels.hide : visibilityLabels.show}
                aria-pressed={isVisible}
                aria-controls={inputId}
                disabled={disabled || readOnly}
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? <EyeIcon /> : <EyeOffIcon />}
              </Button>
            }
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute top-1/2 left-5 origin-left -translate-y-1/2 cursor-text text-sx leading-7 text-white/80 transition-[top,scale,color] duration-200 ease-out group-has-[input:not(:placeholder-shown)]/password:top-0 group-has-[input:not(:placeholder-shown)]/password:scale-[0.857143] motion-reduce:transition-none",
              errorMessage
                && "text-danger-light group-hover/password:text-danger-light group-has-[input:not(:placeholder-shown)]/password:text-danger-light",
            )}
          >
            {label}
          </label>
        </div>
        {errorMessage && (
          <p id={errorId} role="alert" className="text-sx text-danger-light">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
