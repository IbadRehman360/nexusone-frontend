"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";
import { SidebarProvider } from "./SidebarContext";

interface SidebarContainerProps {
  activeId: string;
  defaultOpen?: string | null;
  children: ReactNode;
  className?: string;
}

export function SidebarContainer({
  activeId,
  defaultOpen,
  children,
  className,
}: SidebarContainerProps) {
  return (
    <SidebarProvider activeId={activeId} defaultOpen={defaultOpen ?? null}>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "flex flex-col w-[260px] h-full shrink-0",
          "bg-[rgb(var(--sidebar,var(--card)))]",
          "border-r border-[rgb(var(--border)/0.6)]",
          "px-2.5 gap-0.5",
          "overflow-y-auto overflow-x-hidden",
          "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-thumb]:bg-[rgb(var(--foreground)/0.12)]",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          className,
        )}
      >
        {children}
      </nav>
    </SidebarProvider>
  );
}

export function SidebarDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn(
        "mb-1.5 mt-3 mx-1 border-none h-px bg-(--custom-header-input-border) opacity-50",
        className,
      )}
    />
  );
}

export function SidebarLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-3 py-2",
        "text-[11px] font-semibold uppercase tracking-[0.1em]",
        "text-[rgb(var(--muted-foreground)/0.75)]",
        "select-none",
        className,
      )}
    >
      {children}
    </p>
  );
}
