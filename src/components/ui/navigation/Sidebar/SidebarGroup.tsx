"use client";

import { useEffect, type ElementType, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { useSidebarCtx } from "./SidebarContext";
import { Badge, type BadgeVariant } from "./Badge";
import { SidebarSubItem, type SubItemDef } from "./SidebarSubItem";

export interface GroupDef {
  id: string;
  label: string;
  icon: ElementType;
  items: SubItemDef[];
  badge?: { count: number; variant?: BadgeVariant };
}

export function SidebarGroup({
  id,
  label,
  icon: Icon,
  items,
  badge,
}: GroupDef) {
  const { activeId, openGroupId, openGroup, closeGroup } = useSidebarCtx();
  const isOpen = openGroupId === id;
  const hasActiveChild = items.some((item) => item.id === activeId);

  useEffect(() => {
    if (hasActiveChild && !isOpen) openGroup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveChild]);

  const toggle = () => (isOpen ? closeGroup(id) : openGroup(id));
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div role="none">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`sg-${id}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex items-center gap-2.5 w-full cursor-pointer select-none overflow-hidden",
          "rounded-[9px] px-3 h-9",
          "text-[13.5px] leading-none tracking-[0.01em] font-medium",
          "transition-colors duration-150 ease-out outline-none",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--foreground)/0.15)]",
          hasActiveChild
            ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)] font-semibold"
            : isOpen
              ? "bg-[rgb(var(--foreground)/0.03)] text-(--nav-fg-hover)"
              : "text-(--nav-fg-label) hover:bg-[var(--nav-active-hover)] hover:text-(--nav-fg-hover)",
        )}
      >
        {hasActiveChild && (
          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4.5 rounded-full bg-[var(--nav-active-fg)]" />
        )}
        <Icon
          size={18}
          weight={hasActiveChild ? "fill" : "regular"}
          strokeWidth={hasActiveChild ? 2 : 1.75}
          className={cn(
            "shrink-0 transition-colors duration-150",
            hasActiveChild
              ? "text-[var(--nav-active-fg)]"
              : "text-(--nav-fg-label) group-hover:text-(--nav-fg-hover)",
          )}
        />
        <span className="flex-1 truncate text-left">{label}</span>
        {badge && <Badge count={badge.count} variant={badge.variant} />}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 flex items-center"
        >
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={cn(
              "transition-colors duration-150",
              isOpen
                ? "text-foreground/55"
                : "text-foreground/30 group-hover:text-foreground/45",
            )}
          />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`sg-${id}`}
            role="group"
            aria-label={`${label} submenu`}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 mb-1 ml-4.5 space-y-0.5">
              {items.map((item, index) => (
                <SidebarSubItem
                  key={item.id}
                  {...item}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
