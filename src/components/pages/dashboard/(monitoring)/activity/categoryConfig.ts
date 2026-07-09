import { LogIn, Cloud, ShieldCheck, Settings, type LucideIcon } from "lucide-react";
import type { ActivityCategory } from "@/src/services/auditLogs/auditLogApi";

export interface CategoryConfigEntry {
  key: ActivityCategory;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export const CATEGORY_CONFIG: Record<ActivityCategory, CategoryConfigEntry> = {
  auth: { key: "auth", label: "Auth", icon: LogIn, colorClass: "text-info-400", bgClass: "bg-info/10" },
  power_platform: { key: "power_platform", label: "Power Platform", icon: Cloud, colorClass: "text-[rgb(var(--secondary))]", bgClass: "bg-[rgb(var(--secondary))]/10" },
  entra: { key: "entra", label: "Entra ID", icon: ShieldCheck, colorClass: "text-success-400", bgClass: "bg-success/10" },
  platform: { key: "platform", label: "Platform", icon: Settings, colorClass: "text-warning-400", bgClass: "bg-warning/10" },
};

export const CATEGORY_OPTIONS = Object.values(CATEGORY_CONFIG).map((c) => ({ value: c.key, label: c.label }));

export const STATUS_OPTIONS = [
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

export const DATE_RANGE_OPTIONS = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "", label: "All time" },
];
