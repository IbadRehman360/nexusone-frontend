"use client";

import type { ComponentType } from "react";
import { cn } from "@/src/lib/utils";


export interface DataTab<T extends string> {
  id:     T;
  label:  string;
  icon?:  ComponentType<{ size?: number; className?: string }>;
  /** Pass a number to show a count badge, null/undefined to hide it */
  count?: number | null;
  /** When true, renders a pulsing skeleton instead of the count */
  countLoading?: boolean;
}

interface DataTableTabsProps<T extends string> {
  tabs:         DataTab<T>[];
  activeTab:    T;
  onTabChange:  (id: T) => void;
  className?:   string;
}

/**
 * DataTableTabs
 *
 * Reusable underlined tab bar used inside DataTableMainHeader's
 * `filters` slot (or any other toolbar context).
 *
 * Handles: icon, label, count badge, count loading skeleton, active underline
 * that fades in via transition-colors (consistent with the CSA / detail tabs).
 */
export function DataTableTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: DataTableTabsProps<T>) {
  return (
    <div className={cn("relative flex items-center gap-1", className)}>
      {tabs.map(({ id, label, icon: Icon, count, countLoading }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-150",
              isActive
                ? "border-foreground text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon size={12} />}
            {label}
            {countLoading ? (
              <span className="w-4 h-4 rounded-full border border-border/40 bg-muted/20 animate-pulse" />
            ) : count != null ? (
              <span className={cn(
                "inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold tabular-nums transition-colors duration-150",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted/50 text-foreground/70",
              )}>
                {count}
              </span>
            ) : null}
          </button>
        );
      })}

    </div>
  );
}
