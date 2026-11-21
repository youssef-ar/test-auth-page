"use client";

import { useIntlayer } from "next-intlayer";
import { cn } from "@/lib/utils";

export const LegalLinks = ({ className }: { className?: string }) => {
  const { label, terms, privacy } = useIntlayer("legal-links");

  return (
    <nav
      aria-label={label.value}
      className={cn("flex items-center justify-center gap-[0.625rem] text-sx tracking-[-0.02em]", className)}
    >
      <a href="#" className="text-white hover:underline">
        {terms}
      </a>
      <span aria-hidden className="h-[0.6875rem] w-px bg-white/50" />
      <a href="#" className="text-primary-50 hover:underline">
        {privacy}
      </a>
    </nav>
  );
};
