"use client";

import Link from "next/link";
import { cn } from "@/src/lib/utils/cn";
import { useSidebarCtx } from "./SidebarContext";
import { Badge, type BadgeVariant } from "./Badge";

export interface SubItemDef {
  id: string;
  label: string;
  href: string;
  badge?: { count: number; variant?: BadgeVariant };
}

interface SidebarSubItemProps extends SubItemDef {
  isLast?: boolean;
}

const BRANCH = "rgb(var(--foreground) / 0.14)";

export function SidebarSubItem({
  id,
  label,
  href,
  badge,
  isLast,
}: SidebarSubItemProps) {
  const { activeId } = useSidebarCtx();
  const isActive = activeId === id;

  return (
    <div className="relative">
      {isLast ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "calc(50% + 1px)",
            width: "12px",
            borderLeft: `1px solid ${BRANCH}`,
            borderBottom: `1px solid ${BRANCH}`,
            borderBottomLeftRadius: "6px",
          }}
        />
      ) : (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "1px",
              background: BRANCH,
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: "1px",
              width: "10px",
              background: BRANCH,
            }}
          />
        </>
      )}

      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative flex items-center justify-between gap-2 ml-4",
          "w-[calc(100%-16px)] rounded-md px-2.5 h-7.5",
          "text-[12.75px] leading-none tracking-[0.01em]",
          "transition-[background,color,box-shadow] duration-150 ease-out outline-none",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--foreground)/0.15)]",
          isActive
            ? [
                "bg-[var(--nav-active-bg)]",
                "text-[var(--nav-active-fg)] font-semibold",
              ]
            : [
                "font-medium text-[rgb(var(--foreground)/0.78)]",
                "hover:bg-[var(--nav-active-hover)] hover:text-foreground",
              ],
        )}
      >
        <span className="truncate">{label}</span>
        {badge && <Badge count={badge.count} variant={badge.variant} />}
      </Link>
    </div>
  );
}
