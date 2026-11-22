"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const AuthCard = ({ title, subtitle, footer, children, className }: AuthCardProps) => {
  const titleId = useId();
  const slotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (slotRef.current && cardRef.current) slotRef.current.style.height = `${cardRef.current.offsetHeight}px`;
  }, []);

  return (
    <div ref={slotRef} className="flex w-full max-w-[37.1875rem] shrink-0 flex-col">
      <section
        ref={cardRef}
        aria-labelledby={titleId}
        className={cn(
          "flex w-full shrink-0 flex-col rounded-m border border-white/10 bg-white/[0.03]",
          "px-12 pt-[2.9375rem] pb-[3.125rem] shadow-[0_30px_40px_rgb(0_0_0/0.3)] backdrop-blur-md",
          className,
        )}
      >
        <header className="flex flex-col items-center gap-[0.625rem] text-center">
          <h1 id={titleId} className="text-lm leading-[2.125rem] font-semibold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-[30.5rem] text-s leading-[1.1875rem] font-light text-white/80">{subtitle}</p>
          )}
        </header>
        {children}
        {footer}
      </section>
    </div>
  );
};
