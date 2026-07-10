import React from "react";
import Link from "next/link";
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";

export type ColorVariant = "blue" | "purple" | "green" | "orange" | "red" | "neutral";

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: ColorVariant;
  isLoading?: boolean;
  /** Percentage change — positive = up (green), negative = down (red) */
  trend?: { value: number; label?: string };
  /** 0–100 fills the donut ring around the icon */
  utilisation?: number;
  /** When set, the whole card becomes a link into the given route */
  href?: string;
}

const RAW: Record<ColorVariant, string> = {
  blue:    "--info",
  purple:  "--secondary",
  green:   "--success",
  orange:  "--warning",
  red:     "--error",
  neutral: "--foreground",
};

// SVG donut ring for the icon
function RingIcon({ Icon, solid, track, util }: {
  Icon: LucideIcon;
  solid: string;
  track: string;
  util: number | null;
}) {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = util != null ? (util / 100) * circ : 0;

  return (
    <div className="relative shrink-0 size-13">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke={track} strokeWidth="3" />
        {util != null && (
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke={solid}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        )}
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center m-1.75 rounded-full"
        style={{ background: track }}
      >
        <Icon size={17} style={{ color: solid }} strokeWidth={2} />
      </div>
    </div>
  );
}

// Decorative sparkline — purely visual
function SparkWave({ solid, track }: { solid: string; track: string }) {
  return (
    <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none" className="opacity-60">
      <path d="M0,28 C25,14 45,32 70,22 C95,12 115,30 140,18 C165,6 185,24 200,16 L200,36 L0,36 Z" fill={track} />
      <path
        d="M0,28 C25,14 45,32 70,22 C95,12 115,30 140,18 C165,6 185,24 200,16"
        fill="none" stroke={solid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  isLoading = false,
  trend,
  utilisation,
  href,
}: StatsCardProps) {
  const raw  = RAW[color];
  const solid = `rgb(var(${raw}))`;
  const a10   = `rgb(var(${raw}) / 0.10)`;
  const a18   = `rgb(var(${raw}) / 0.18)`;

  const isUp      = trend && trend.value > 0;
  const isDown    = trend && trend.value < 0;
  const TrendIcon = !trend ? null : isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendRaw   = isUp ? "--success" : isDown ? "--error" : "--muted-foreground";
  const trendSolid = `rgb(var(${trendRaw}))`;
  const trendBg    = `rgb(var(${trendRaw}) / 0.12)`;

  const util = utilisation != null ? Math.min(100, Math.max(0, utilisation)) : null;

  const shellClassName = `group relative rounded-2xl overflow-hidden h-full block transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${href ? "cursor-pointer" : "cursor-default"}`;
  const shellStyle = {
    border: `1px solid var(--custom-card-border, rgb(var(${raw}) / 0.35))`,
    background: `var(--custom-card-bg, rgb(var(${raw}) / 0.06))`,
  };

  const inner = (
    <>
      {/* Link affordance — only when the card navigates */}
      {href && !isLoading && (
        <ArrowUpRight
          size={16}
          className="absolute top-4 right-4 z-10 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      )}

      <div className="relative z-10 p-5 h-full flex flex-col min-h-52.5">

        {/* Icon */}
        <div className="mb-3">
          <RingIcon Icon={Icon} solid={isLoading ? `rgb(var(${raw}) / 0.25)` : solid} track={a18} util={isLoading ? null : util} />
        </div>

        <div className="ml-2 mt-1">
          {/* Title — fixed min-h so single vs multi-line titles don't shift the value */}
          <p
            className="text-sm min-h-6 font-bold uppercase tracking-wide leading-tight"
            style={{ color: isLoading ? `rgb(var(${raw}) / 0.35)` : solid }}
          >
            {title}
          </p>

          {/* Value */}
          {isLoading ? (
            <div className="h-9 w-16 rounded-lg animate-pulse mb-1" style={{ background: a10 }} />
          ) : (
            <p className="text-[2.2rem] font-black leading-none tracking-tighter text-foreground mb-1 tabular-nums">
              {value}
            </p>
          )}

          {/* Subtitle */}
          {subtitle && !isLoading && (
            <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
          )}

        </div>

        {/* Sparkline */}
        <div className={`mt-auto overflow-hidden ${isLoading ? "opacity-20" : "opacity-100"}`}>
          <SparkWave solid={solid} track={a10} />
        </div>

        {/* Trend badge */}
        {trend != null && !isLoading && TrendIcon && (
          <div className="mt-2 flex justify-end">
            <div
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ color: trendSolid, background: trendBg }}
            >
              <TrendIcon size={10} strokeWidth={2.5} />
              {isUp ? "+" : ""}{trend.value}%
              {trend.label && <span className="font-normal opacity-70 ml-0.5">{trend.label}</span>}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={shellClassName} style={shellStyle}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={shellClassName} style={shellStyle}>
      {inner}
    </div>
  );
}
