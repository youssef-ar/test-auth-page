import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PrimaryButton = ({ className, ...props }: ComponentProps<typeof Button>) => (
  <Button
    variant="primary"
    alignment="center"
    textSize="base"
    className={cn(
      "mt-2xl h-[3.1875rem] w-full rounded-s font-semibold text-white/90 hover:bg-primary-500",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200",
      className,
    )}
    {...props}
  />
);
