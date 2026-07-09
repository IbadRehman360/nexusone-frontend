"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { Sidebar } from "./sidebar/Sidebar";
import { ProductRail } from "./product-rail/ProductRail";
import { HeaderBar } from "./header/HeaderBar";
import { getActiveWorld } from "@/src/lib/utils/navWorld";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { useAuth } from "@/src/hooks/useAuth";
import { usePresence } from "@/src/hooks/usePresence";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { getSectionStyle } = useThemeCustomization();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const world = getActiveWorld(pathname);
  const isHome = world === "home";
  const [isCollapsed, setIsCollapsed] = useState(false);

  usePresence(isAuthenticated);

  // Auto-expand sidebar whenever the user navigates away from the home page.
  const prevIsHomeRef = useRef(isHome);
  useEffect(() => {
    if (prevIsHomeRef.current && !isHome) setIsCollapsed(false);
    prevIsHomeRef.current = isHome;
  }, [isHome]);

  return (
    <div className="min-h-screen bg-shell-surface">
      <ProductRail />

      <div
        className="fixed bottom-0 right-0 dashboard-shell flex content-panel overflow-hidden left-16 top-0 z-200 bg-shell-surface transform-gpu"
        style={getSectionStyle("panel")}
      >
        <Sidebar isCollapsed={isHome || isCollapsed} />
        <main
          className="relative z-30 flex-1 overflow-y-auto bg-background flex flex-col"
          style={{
            ...getSectionStyle("contentBg"),
            ...getSectionStyle("widget"),
            ...getSectionStyle("card"),
            ...getSectionStyle("table"),
          }}
        >
          <HeaderBar />
          <div className="w-full px-8 mx-auto pt-4 pb-14">{children}</div>
        </main>
      </div>

      {/* Sidebar collapse toggle — rendered outside dashboard-shell so it escapes overflow-hidden. */}
      {!isHome && (
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            backgroundColor: "var(--custom-sidebar-bg, rgb(var(--shell-surface)))",
            borderColor: "var(--panel-border-color, var(--custom-header-input-border, rgb(var(--border) / 0.6)))",
          }}
          className={cn(
            "fixed top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border",
            "flex items-center justify-center text-foreground/65 hover:text-foreground",
            "transition-[left] duration-150 ease-out z-210",
            isCollapsed ? "left-14" : "left-83",
          )}
        >
          <ChevronLeft
            size={15}
            className={cn("transition-transform duration-150 ease-out", isCollapsed && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
}

export default DashboardLayout;
