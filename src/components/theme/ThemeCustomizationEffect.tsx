"use client";

import { useEffect } from "react";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";

/**
 * Mirrors the active custom-palette CSS variables onto the document root.
 *
 * Section styles are normally applied locally to specific shell elements
 * (rail/header/panel), but portalled content (modals, toasts) renders outside
 * that subtree via createPortal(..., document.body) — CSS custom properties
 * don't cascade across that boundary. Mounting this once near the app root
 * keeps every --custom-* variable available everywhere, independent of
 * whether a page has the full dashboard shell.
 */
export function ThemeCustomizationEffect() {
  const { getSectionStyle } = useThemeCustomization();

  const widgetStyle = getSectionStyle("widget") as Record<string, string>;
  const buttonStyle = getSectionStyle("button") as Record<string, string>;
  const cardStyle = getSectionStyle("card") as Record<string, string>;
  const tableStyle = getSectionStyle("table") as Record<string, string>;
  const contentBgStyle = getSectionStyle("contentBg") as Record<string, string>;
  const headerStyle = getSectionStyle("header") as Record<string, string>;
  const sidebarStyle = getSectionStyle("sidebar") as Record<string, string>;

  useEffect(() => {
    const combined = { ...contentBgStyle, ...widgetStyle, ...cardStyle, ...tableStyle, ...buttonStyle, ...headerStyle, ...sidebarStyle };
    const root = document.documentElement;
    const keys = Object.keys(combined).filter((k) => k.startsWith("--"));
    for (const key of keys) root.style.setProperty(key, combined[key]);
    return () => {
      for (const key of keys) root.style.removeProperty(key);
    };
  }, [contentBgStyle, widgetStyle, cardStyle, tableStyle, buttonStyle, headerStyle, sidebarStyle]);

  return null;
}
