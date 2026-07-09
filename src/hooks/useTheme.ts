import { useState, useEffect } from "react";

/**
 * Reads the current theme from the <html> data-theme attribute
 * and keeps isDark in sync via MutationObserver so every component
 * that calls useTheme() reacts to external theme changes (e.g. from
 * AppearanceSettings toggling the attribute directly).
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    const current = document.documentElement.getAttribute("data-theme");
    if (!current) {
      document.documentElement.setAttribute("data-theme", "light");
      return false;
    }
    return current === "dark";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme");
      setIsDark(current === "dark");
    });
    observer.observe(document.documentElement, {
      attributes:      true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    // MutationObserver handles setIsDark — no double-update needed
  };

  return { isDark, toggle };
}
