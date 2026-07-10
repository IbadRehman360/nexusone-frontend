/**
 * Access Reviews types — mirrors ar.types.ts / ar-compare.types.ts DTOs exactly.
 */

export type ArChipKey = "overdue" | "incomplete" | "rubber_stamping" | "decisions_not_applied" | "no_recurring_review_privileged" | "on_track";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: ArChipKey;
  severity: ChipSeverity;
}

export type ArScopeType = "role" | "group" | "app" | "accessPackage" | "directory" | "unknown";
export type InsightSeverity = "danger" | "warning" | "info";

export interface ArDecisionTallies {
  approve: number;
  deny: number;
  noResponse: number;
  applied: number;
  total: number;
}

export interface ArCampaignItem {
  id: string;
  displayName: string;
  scopeType: ArScopeType;
  scopeLabel: string;
  isPrivilegedScope: boolean;
  reviewerCount: number;
  recurrenceLabel: string;
  isRecurring: boolean;
  autoApply: boolean;
  instanceStatus: string;
  startDateTime: string | null;
  endDateTime: string | null;
  completionPercent: number | null;
  tallies: ArDecisionTallies | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface ArStats {
  activeReviews: number;
  overdueIncomplete: number;
  avgCompletion: number;
  decisionsPendingApply: number;
}

export interface ArInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendedSteps: string[];
  affectedCampaigns?: string[];
  learnMoreUrl?: string;
}

export interface ArInsights {
  insights: ArInsight[];
  completionScore: number;
  passedChecks: number;
  totalChecks: number;
}

export interface ArCatalog {
  items: ArCampaignItem[];
  stats: ArStats;
  insights: ArInsights;
  arLicensed: boolean;
}

export interface ArInstanceView {
  id: string;
  status: string;
  startDateTime: string | null;
  endDateTime: string | null;
}

export interface ArDecisionView {
  principalName: string;
  decision: string;
  reviewedBy: string | null;
  reviewedDateTime: string | null;
  applied: boolean;
}

export interface ArCampaignDetail {
  id: string;
  displayName: string;
  scopeLabel: string;
  reviewers: string[];
  recurrenceLabel: string;
  autoApply: boolean;
  arLicensed: boolean;
  instances: ArInstanceView[];
  tallies: ArDecisionTallies | null;
  decisions: ArDecisionView[];
}

export type ArStatusFilter = "all" | "active" | "overdue" | "completed";
export type ArScopeFilter = "all" | "role" | "group" | "app" | "accessPackage";

// --- Compare ---

export type ArCompareCellStatus = "pass" | "fail" | "na";

export interface ArCompareTenant {
  tenantId: string;
  name: string;
  completionPercent: number;
  arLicensed: boolean;
}

export interface ArCompareCheck {
  id: string;
  label: string;
}

export interface ArCompareGrid {
  tenants: ArCompareTenant[];
  checks: ArCompareCheck[];
  cells: Record<string, Record<string, ArCompareCellStatus>>;
}
