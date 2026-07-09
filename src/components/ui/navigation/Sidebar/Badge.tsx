import { cn } from "@/src/lib/utils/cn";

export type BadgeVariant = "warning" | "success" | "info" | "danger" | "purple";

const VARIANTS: Record<BadgeVariant, string> = {
  warning: "bg-[rgb(var(--warning)/0.18)] text-[rgb(var(--warning))]",
  success: "bg-[rgb(var(--success)/0.16)] text-[rgb(var(--success-500))]",
  info:    "bg-[rgb(var(--info)/0.14)]    text-[rgb(var(--info-500,var(--info-400)))]",
  danger:  "bg-[rgb(var(--error)/0.15)]   text-[rgb(var(--error))]",
  purple:  "bg-[rgb(var(--secondary)/0.15)] text-[rgb(var(--secondary-500,var(--secondary-400)))]",
};

interface BadgeProps {
  count: number;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ count, variant = "info", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 inline-flex items-center justify-center",
        "min-w-5 h-4.5 px-1.5 rounded-full",
        "text-[10.5px] font-semibold leading-none tabular-nums",
        VARIANTS[variant],
        className,
      )}
    >
      {count}
    </span>
  );
}
