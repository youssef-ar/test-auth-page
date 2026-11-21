"use client";

import { useIntlayer } from "next-intlayer";
import type { CSSProperties } from "react";
import { SectorTag } from "@/components/sectors/sector-tag";
import { cn } from "@/lib/utils";
import type { Company } from "../schema";
import { StatusBadge } from "./status-badge";


const WATERMARK_MASK = "radial-gradient(circle 183.5px at -3.5px -5px, rgb(0 0 0 / 0.3), transparent)";

type CompanyCardProps = { company: Company; className?: string; style?: CSSProperties };

export const CompanyCard = ({ company, className, style }: CompanyCardProps) => {
  const sectorLabels = useIntlayer("sectors");
  const initial = company.name.charAt(0).toUpperCase();

  return (
    <article
      className={cn(
        "relative h-[10rem] w-[34.5rem] overflow-hidden rounded-[0.625rem] bg-black/30 p-[1.125rem]",
        "shadow-[0_0_30px_2px_rgb(255_255_255/0.15)]",
        className,
      )}
      style={style}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: WATERMARK_MASK, WebkitMaskImage: WATERMARK_MASK }}
      >
        <div
          className="absolute -top-[5.75rem] -left-[5.875rem] flex size-[18.75rem] items-center justify-center rounded-[6.25rem] text-[11rem] font-semibold text-white/60"
          style={{ backgroundColor: company.brandColor }}
        >
          {initial}
        </div>
      </div>

      <header className="relative flex items-start justify-between gap-m">
        <div className="flex min-w-0 items-center gap-sm">
          <span
            aria-hidden
            className="flex size-[2.375rem] shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: company.brandColor }}
          >
            {initial}
          </span>
          <h3 className="truncate text-ms leading-none font-bold">{company.name}</h3>
        </div>
        <StatusBadge status={company.status} />
      </header>

      <p className="relative mt-[0.875rem] line-clamp-2 max-w-[22.5rem] text-[0.8125rem] leading-[1.125rem]">
        {company.description}
      </p>

      <ul className="relative mt-[0.9375rem] flex flex-wrap items-center gap-x-[1.625rem]">
        {company.sectors.map((sector) => (
          <li key={sector}>
            <SectorTag sector={sector} label={sectorLabels[sector].value} isMonochrome />
          </li>
        ))}
      </ul>
    </article>
  );
};
