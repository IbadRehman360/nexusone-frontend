"use client";

import { useTheme } from "@/src/contexts";
import { Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 hover:bg-muted/20 rounded-lg transition-all"
    >
      {isDark ? (
        <Moon size={20} className="text-foreground" />
      ) : (
        <Moon size={20} className="text-foreground/60" />
      )}
    </button>
  );
}
