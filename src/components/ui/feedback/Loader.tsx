"use client";

import { cn } from "@/src/lib/utils/cn";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: { ring: "size-6 border-2", text: "text-xs" },
  md: { ring: "size-9 border-2", text: "text-sm" },
  lg: { ring: "size-12 border-4", text: "text-sm" },
  xl: { ring: "size-16 border-4", text: "text-base" },
} as const;

export const Loader = ({ size = "md", className = "", text }: LoaderProps) => {
  const { ring, text: textSize } = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-foreground/15 border-t-foreground/60",
          ring,
        )}
      />
      {text && (
        <p className={cn("font-medium tracking-wide text-muted-foreground/60", textSize)}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
