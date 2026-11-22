import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const FormError = ({ message, className }: { message?: string; className?: string }) => (
  <div role="alert" className={cn(message && className)}>
    {message && (
      <p className="flex items-start gap-s rounded-s bg-danger/10 px-m py-sm text-sx text-danger">
        <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
        {message}
      </p>
    )}
  </div>
);
