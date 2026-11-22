import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// The small centred text actions of the verification screens ("Utiliser un code de récupération"…).
export const TextButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      "cursor-pointer rounded-xs text-sx leading-6 font-medium text-primary-200 transition-colors hover:text-white",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200",
      "disabled:cursor-not-allowed disabled:hover:text-primary-200",
      className,
    )}
    {...props}
  />
);
