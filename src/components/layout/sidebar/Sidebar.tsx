"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { navSections } from "@/src/config/nav.config";
import { SidebarProvider } from "@/src/components/ui/navigation/Sidebar/SidebarContext";
import { SidebarSection } from "./SidebarSection";
import { getActiveWorld } from "@/src/lib/utils/navWorld";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { cn } from "@/src/lib/utils/cn";

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { getSectionStyle } = useThemeCustomization();

  const activeWorld = getActiveWorld(pathname);

  const activeId = useMemo(() => {
    let best = { id: "", len: -1 };
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.href) {
          const exact = item.href === "/dashboard";
          const hit   = exact ? pathname === item.href : pathname.startsWith(item.href);
          if (hit && item.href.length > best.len) best = { id: item.href, len: item.href.length };
        }
        for (const child of item.children ?? []) {
          const exact = child.href === "/dashboard";
          const hit   = exact ? pathname === child.href : pathname.startsWith(child.href);
          if (hit && child.href.length > best.len) best = { id: child.href, len: child.href.length };
        }
      }
    }
    return best.id;
  }, [pathname]);

  const worldSections = navSections.filter((s) => s.world === activeWorld);
  const { borderColor, ...sidebarStyle } = getSectionStyle("sidebar") as React.CSSProperties & { borderColor?: string };

  return (
    <SidebarProvider activeId={activeId}>
      <aside
        className={cn(
          "shrink-0 h-full flex flex-col bg-shell-surface overflow-hidden transition-[width] duration-150 ease-out",
          isCollapsed ? "w-0" : "w-70",
        )}
        style={{
          ...sidebarStyle,
          borderRightWidth: isCollapsed ? 0 : "1px",
          borderRightStyle: "solid",
          borderRightColor: borderColor ?? "var(--custom-header-input-border, rgb(var(--border) / 0.6))",
        }}
      >
        <div className="relative flex-1 min-h-0">
          <nav className="h-full overflow-y-auto overflow-x-hidden no-scrollbar px-2.5 pt-5 pb-3">
            {worldSections.map((section, index) => (
              <SidebarSection key={index} section={section} sectionIndex={index} />
            ))}
          </nav>
        </div>
      </aside>
    </SidebarProvider>
  );
}
