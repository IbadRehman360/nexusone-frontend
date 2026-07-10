import type { BadgeVariant } from "@/src/components/ui/display/Badge";
import type { DlpSeverity, DlpStatus } from "@/src/types/purview";

export const DLP_SEVERITY_LABELS: Record<DlpSeverity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  informational: "Informational",
  unknown: "Unknown",
};

export const DLP_SEVERITY_DOT: Record<DlpSeverity, string> = {
  high: "bg-error-400",
  medium: "bg-warning-400",
  low: "bg-info-300",
  informational: "bg-info-400",
  unknown: "bg-muted-foreground",
};

export const DLP_SEVERITY_BAR: Record<DlpSeverity, string> = {
  high: "bg-error-500",
  medium: "bg-error-400",
  low: "bg-info-400",
  informational: "bg-info-300",
  unknown: "bg-muted-foreground",
};

export const DLP_STATUS_VARIANT: Record<DlpStatus, BadgeVariant> = {
  new: "success",
  inProgress: "warning",
  resolved: "neutral",
};

export const DLP_STATUS_LABELS: Record<DlpStatus, string> = {
  new: "Active",
  inProgress: "In Progress",
  resolved: "Resolved",
};

export const DLP_SEVERITY_ORDER: DlpSeverity[] = ["high", "medium", "low", "informational"];

export const REPEAT_OFFENDER_THRESHOLD = 3;
