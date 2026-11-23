"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder" | "size"> & {
  label: ReactNode;
  errorMessage?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, errorMessage, id, className, "aria-describedby": describedBy, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        <div className={cn("group/field relative rounded-s bg-white/5 font-display", errorMessage && "bg-danger/5")}>
          <fieldset
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -top-2 inset-x-0 bottom-0 min-w-0 rounded-s border border-white/40 px-4 transition-colors duration-200 group-hover/field:border-white/60 group-focus-within/field:border-white/60 motion-reduce:transition-none",
              errorMessage &&
                "border-danger group-hover/field:border-danger group-focus-within/field:border-danger",
            )}
          >
            <legend className="invisible h-4 max-w-0 overflow-hidden whitespace-nowrap text-xs leading-4 transition-[max-width] duration-200 group-has-[input:not(:placeholder-shown)]/field:max-w-full motion-reduce:transition-none">
              <span className="px-1">{label}</span>
            </legend>
          </fieldset>
          <Input
            {...props}
            ref={ref}
            id={inputId}
            aria-invalid={errorMessage ? true : props["aria-invalid"]}
            aria-describedby={[describedBy, errorMessage ? errorId : undefined].filter(Boolean).join(" ") || undefined}
            placeholder=" "
            className="h-[3.0625rem] w-full gap-4 px-5"
            inputClassName="h-7 w-full text-sx leading-7 text-white"
          />
          <label
            htmlFor={inputId}
            className={cn(
              "absolute top-1/2 left-5 origin-left -translate-y-1/2 cursor-text text-sx leading-7 text-white/80 transition-[top,scale,color] duration-200 ease-out group-has-[input:not(:placeholder-shown)]/field:top-0 group-has-[input:not(:placeholder-shown)]/field:scale-[0.857143] motion-reduce:transition-none",
              errorMessage &&
                "text-danger-light group-hover/field:text-danger-light group-has-[input:not(:placeholder-shown)]/field:text-danger-light",
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

TextField.displayName = "TextField";
