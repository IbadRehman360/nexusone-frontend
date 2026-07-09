"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { SearchInput } from "@/src/components/ui/inputs/SearchInput";
import { ArrowUpRight } from "lucide-react";

interface DataTableMainHeaderProps {
  /** Section title rendered on the left of the toolbar */
  title?: string;
  /** Optional "View all" href — renders a link on the right when title is set */
  titleHref?: string;
  /** Sliding tab bar — rendered bottom-flush so the indicator sits on the toolbar border */
  tabs?: ReactNode;
  /** Filter dropdowns — rendered in a dedicated row below the title/search bar, wraps on small screens */
  filters?: ReactNode;
  /** Controlled search value */
  searchValue?: string;
  /** Called when search changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Render search bar as invisible (preserves height, hides it visually) */
  searchHidden?: boolean;
  /** Optional node rendered on the right of the top bar, left of the search input (e.g. a "last checked" caption) */
  headerRight?: ReactNode;
  /** Table / list content */
  children: ReactNode;
  /** Extra className on the outer wrapper */
  className?: string;
}

export function DataTableMainHeader({
  title,
  titleHref,
  tabs,
  filters,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchHidden = false,
  headerRight,
  children,
  className,
}: DataTableMainHeaderProps) {
  const hasTabs    = tabs != null;
  const hasFilters = filters != null;
  const hasTopBar  = title != null || hasTabs || onSearchChange != null || headerRight != null;

  return (
    <div className={cn("bg-card border border-(--custom-table-border) rounded-2xl overflow-hidden flex flex-col", className)}>

      {/* ── Top bar: title / tabs on the left, search on the right ── */}
      {hasTopBar && (
        <div className="flex items-center justify-between gap-3 px-5 py-2 border-b border-(--custom-table-border) bg-(--custom-table-header-bg)">
          <div className="flex items-center gap-2 min-w-0">
            {title && (
              <p className="text-[13px] font-semibold text-foreground whitespace-nowrap">{title}</p>
            )}
            {tabs}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {headerRight}
            {onSearchChange && (
              <SearchInput
                value={searchValue ?? ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                size="md"
                className={cn(
                  "w-44 sm:w-64 bg-muted/15 border-(--custom-header-input-border) hover:bg-muted/25",
                  searchHidden && "invisible pointer-events-none",
                )}
              />
            )}
            {title && titleHref && !onSearchChange && (
              <Link
                href={titleHref}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                View all <ArrowUpRight size={10} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Filter bar: wraps onto multiple lines on small screens ── */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-(--custom-table-border) bg-(--custom-table-header-bg)">
          {filters}
        </div>
      )}

      {children}
    </div>
  );
}
