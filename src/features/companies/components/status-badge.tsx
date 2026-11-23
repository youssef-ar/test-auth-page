"use client";

import { useIntlayer } from "next-intlayer";
import { CompanyStatus } from "@/components/company/company-status";
import { cn } from "@/lib/utils";

const BADGES = {
  [CompanyStatus.CLOSED]: "closed",
  [CompanyStatus.INACTIVE]: "closed",
  [CompanyStatus.ACQUIRED]: "sold",
  [CompanyStatus.ACTIVE]: null,
} as const satisfies Record<CompanyStatus, "closed" | "sold" | null>;

const BADGE_STYLES = {
  closed: "bg-[#D46B75]/10 text-[#E75261]",
  sold: "bg-warning/10 text-warning",
} as const;

export const StatusBadge = ({ status, className }: { status: CompanyStatus; className?: string }) => {
  const labels = useIntlayer("company-status");
  const badge = BADGES[status];
  if (!badge) return null;

  return (
    <span className={cn("flex h-6 shrink-0 items-center rounded-xs px-s text-xs font-medium", BADGE_STYLES[badge], className)}>
      {labels[badge].value}
    </span>
  );
};
