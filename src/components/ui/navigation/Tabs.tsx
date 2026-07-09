"use client";

import { cn } from "@/src/lib/utils/cn";
import { useSlidingTabIndicator } from "@/src/hooks/useSlidingTabIndicator";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  count?: number | null;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  variant?: "underline" | "pill";
  rightSlot?: React.ReactNode;
  className?: string;
}

function UnderlineTabs<T extends string>({
  tabs, activeTab, onChange, rightSlot,
}: Omit<TabsProps<T>, "variant">) {
  const { getTabRef, indicator } = useSlidingTabIndicator(activeTab);

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={getTabRef(tab.id)}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center uppercase gap-2 px-3 pb-3 pt-0.5 text-xs font-semibold transition-colors duration-150",
                isActive ? "text-info-400" : "text-foreground hover:text-foreground/70",
              )}
            >
              {Icon && <Icon size={12} />}
              {tab.label}
              {tab.count != null && (
                <span className={cn(
                  "inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-xs font-bold tabular-nums transition-colors duration-150",
                  isActive ? "bg-info-400/15 text-info-400" : "bg-muted/50 text-foreground/70",
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {rightSlot}
    </div>
  );
}

function PillTabs<T extends string>({ tabs, activeTab, onChange, className }: Omit<TabsProps<T>, "variant">) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 bg-(--custom-table-header-bg) rounded-lg p-0.5", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
              isActive
                ? "bg-(--custom-table-bg) text-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/20",
            )}
          >
            {Icon && <Icon size={12} />}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span className={cn(
                "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold tabular-nums transition-colors duration-150",
                isActive ? "bg-info-400/15 text-info-400" : "bg-muted/50 text-foreground/70",
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs<T extends string = string>({
  variant = "underline",
  ...props
}: TabsProps<T>) {
  if (variant === "pill") return <PillTabs {...props} />;
  return <UnderlineTabs {...props} />;
}
