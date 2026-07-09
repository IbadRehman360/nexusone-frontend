"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { cn } from "@/src/lib/utils/cn";
import { useSidebarCtx } from "./SidebarContext";
import { Badge, type BadgeVariant } from "./Badge";

export interface SidebarItemDef {
  id: string;
  label: string;
  href: string;
  icon: ElementType;
  badge?: { count: number; variant?: BadgeVariant };
}

export function SidebarItem({
  id,
  label,
  href,
  icon: Icon,
  badge,
}: SidebarItemDef) {
  const { activeId } = useSidebarCtx();
  const isActive = activeId === id;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 w-full select-none overflow-hidden",
        "rounded-[9px] px-3 h-9",
        "text-[13.5px] leading-none tracking-[0.01em]",
        "transition-[background,color,box-shadow] duration-150 ease-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--foreground)/0.15)]",
        isActive
          ? [
              "bg-[var(--nav-active-bg)]",
              "text-[var(--nav-active-fg)] font-semibold",
            ]
          : [
              "font-medium text-(--nav-fg-label)",
              "hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover)",
            ],
      )}
    >
      {isActive && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4.5 rounded-full bg-[var(--nav-active-fg)]" />
      )}
      <Icon
        size={18}
        weight={isActive ? "fill" : "regular"}
        strokeWidth={isActive ? 2 : 1.75}
        className={cn(
          "shrink-0 transition-colors duration-150",
          isActive
            ? "text-[var(--nav-active-fg)]"
            : "text-(--nav-fg-label) group-hover:text-(--nav-fg-hover)",
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && <Badge count={badge.count} variant={badge.variant} />}
    </Link>
  );
}
