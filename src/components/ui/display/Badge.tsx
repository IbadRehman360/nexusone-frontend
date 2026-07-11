/**
 * Badge Component
 * Small status indicator with color variants
 */

import React from "react";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "purple";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// Flat, opaque chips: a solid `muted` surface — no translucent colour tint that
// would "glow" over the dark background — carrying grounded semantic text (a
// dark shade in light mode, the base bright tone in dark) so colour stays
// meaningful (red=danger, amber=attention, green=good, blue=info). Neutral and
// the retired `purple` alias share the surface with muted foreground text.
const CHIP = "bg-(--custom-table-bg) border-(--custom-table-border)";

const variantStyles: Record<BadgeVariant, string> = {
  success: `${CHIP} text-success-700 dark:text-success-400`,
  warning: `${CHIP} text-warning-800 dark:text-warning-400`,
  error: `${CHIP} text-error-700 dark:text-error-400`,
  info: `${CHIP} text-info-300 dark:text-info-400`,
  neutral: `${CHIP} text-foreground/70`,
  purple: `${CHIP} text-foreground/70`,
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1
        rounded-lg text-xs font-medium border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
