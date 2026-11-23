"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type TabItem<T extends string> = { value: T; label: ReactNode; panel: ReactNode };

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  className?: string;
};

export const Tabs = <T extends string>({ items, value, onValueChange, label, className }: TabsProps<T>) => {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (item: T) => `${baseId}-tab-${item}`;
  const panelId = (item: T) => `${baseId}-panel-${item}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = items.findIndex((item) => item.value === value);
    const last = items.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onValueChange(items[next].value);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative flex justify-center gap-[1.75rem] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white/30"
      >
        {items.map((item, index) => {
          const isSelected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(item.value)}
              aria-selected={isSelected}
              aria-controls={panelId(item.value)}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "relative cursor-pointer rounded-xs px-sm pb-[1.125rem] text-s leading-[1.1875rem] font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200",
                isSelected ? "text-primary-300" : "text-white/80 hover:text-white",
              )}
            >
              {item.label}
              {isSelected && (
                <span className="absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary-300),white_30%)]" />
              )}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={panelId(item.value)}
          aria-labelledby={tabId(item.value)}
          hidden={item.value !== value}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
};
