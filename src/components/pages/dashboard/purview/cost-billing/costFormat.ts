import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function shortError(message: string | null | undefined): string {
  if (!message) return "—";
  const exceptionMatch = message.match(/([A-Za-z.]+Exception)/);
  if (exceptionMatch) return exceptionMatch[1];
  const beforeColon = message.split(":")[0].trim();
  return beforeColon || "Error";
}

export function trendLabel(summary: { currentMonthCost: number; lastMonthCost: number; trendPercent: number } | null): string {
  if (!summary) return "Loading cost data…";
  if (summary.lastMonthCost === 0 && summary.currentMonthCost > 0) return "New spend this month";
  if (summary.trendPercent === 0) return "No change vs last month";
  const sign = summary.trendPercent > 0 ? "+" : "";
  return `${sign}${summary.trendPercent}% vs last month`;
}

export function trendIcon(summary: { trendPercent: number } | null): LucideIcon {
  if (!summary) return Minus;
  return summary.trendPercent > 0 ? TrendingUp : summary.trendPercent < 0 ? TrendingDown : Minus;
}

export function trendColor(summary: { trendPercent: number } | null): string {
  if (!summary) return "text-muted-foreground";
  return summary.trendPercent > 0 ? "text-error-400" : summary.trendPercent < 0 ? "text-success-400" : "text-muted-foreground";
}
