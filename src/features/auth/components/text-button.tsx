import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

const textActionClass = cn(
  "cursor-pointer rounded-xs text-sx leading-6 font-medium text-primary-200 transition-colors hover:text-white",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200",
  "disabled:cursor-not-allowed disabled:hover:text-primary-200",
);

export const TextButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={cn(textActionClass, className)} {...props} />
);

export const TextLink = ({ className, ...props }: ComponentProps<typeof Link>) => (
  <Link className={cn(textActionClass, className)} {...props} />
);
