"use client";

import { cn } from "@/lib/utils";
import { useCompanies } from "../use-companies";
import { CompanyCard } from "./company-card";


const MIN_GAP = "21rem";

const SLOTS = [
  { side: "left", top: "5.28%", fromCenter: "28.33vw" },
  { side: "right", top: "6.11%", fromCenter: "32.76vw" },
  { side: "left", top: "29.35%", fromCenter: "35.99vw" },
  { side: "right", top: "30.19%", fromCenter: "35.1vw" },
  { side: "left", top: "54.35%", fromCenter: "27.19vw" },
  { side: "right", top: "55.46%", fromCenter: "29.38vw" },
  { side: "left", top: "82.59%", fromCenter: "32.03vw" },
  { side: "right", top: "81.76%", fromCenter: "35.36vw" },
] as const;

export const Fleet = ({ className }: { className?: string }) => {
  const { data: companies } = useCompanies();

  if (!companies?.length) return null;

  return (
    <div inert className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}>
      {SLOTS.map((slot, index) => {
        const company = companies[index % companies.length];
        return (
          <CompanyCard
            key={`${company.id}-${index}`}
            company={company}
            className="absolute opacity-30"
            style={{
              top: slot.top,
              [slot.side === "left" ? "right" : "left"]: `calc(50% + max(${MIN_GAP}, ${slot.fromCenter}))`,
            }}
          />
        );
      })}
    </div>
  );
};
