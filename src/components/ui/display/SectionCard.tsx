"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  viewHref?: string;
  viewLabel?: string;
  children: React.ReactNode;
}

/**
 * Shared "titled card with optional view-all link" container — the standard
 * dashboard-overview building block (scan history, activity feeds, coverage
 * bars, etc.). Uses the app's theme tokens (`--custom-table-bg`/`-border`),
 * not static Tailwind neutrals, so it re-themes correctly under a tenant's
 * custom palette. Reuse this instead of hand-rolling another one-off card.
 */
export function SectionCard({ title, subtitle, viewHref, viewLabel = "View all", children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-(--custom-table-border) bg-(--custom-table-bg) p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {viewHref && (
          <Link href={viewHref} className="flex items-center gap-1 text-[11px] text-info-400 hover:underline shrink-0">
            {viewLabel}
            <ArrowUpRight size={11} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default SectionCard;
