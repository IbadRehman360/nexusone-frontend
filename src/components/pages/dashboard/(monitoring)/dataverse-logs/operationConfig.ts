import { Plus, Pencil, Trash2, Eye, type LucideIcon } from "lucide-react";

export interface OperationConfigEntry {
  label: string;
  icon: LucideIcon;
  badgeVariant: "success" | "info" | "error" | "neutral";
}

export const OPERATION_CONFIG: Record<number, OperationConfigEntry> = {
  1: { label: "Create", icon: Plus, badgeVariant: "success" },
  2: { label: "Update", icon: Pencil, badgeVariant: "info" },
  3: { label: "Delete", icon: Trash2, badgeVariant: "error" },
  4: { label: "Access", icon: Eye, badgeVariant: "neutral" },
};

export function operationConfigFor(operation: number): OperationConfigEntry {
  return OPERATION_CONFIG[operation] ?? { label: "Unknown", icon: Eye, badgeVariant: "neutral" };
}

export const DATE_RANGE_OPTIONS = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "", label: "All time" },
];
