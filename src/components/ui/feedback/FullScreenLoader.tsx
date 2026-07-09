"use client";

import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { Loader } from "./Loader";

/**
 * Full-viewport loading state for pre-shell screens (auth redirects, session
 * checks) that render outside DashboardLayout and so wouldn't otherwise pick
 * up the active theme's custom content background.
 */
export function FullScreenLoader() {
  const { getSectionStyle } = useThemeCustomization();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" style={getSectionStyle("contentBg")}>
      <Loader size="md" />
    </div>
  );
}
