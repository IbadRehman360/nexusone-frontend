/**
 * Entitlement Management types — mirrors em.types.ts / em-compare.types.ts DTOs exactly.
 */

export type EmChipKey = "never_expires" | "stale_guest" | "workflow_failing" | "expiring_soon" | "healthy";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: EmChipKey;
  severity: ChipSeverity;
  count?: number;
}

export type EmItemKind = "package" | "workflow";
export type InsightSeverity = "danger" | "warning" | "info";

export interface EmWorkflowRuns {
  total: number;
  failed: number;
  lastStatus: string | null;
}

export interface EmItem {
  id: string;
  kind: EmItemKind;
  name: string;
  catalog: string | null;
  trigger: string | null;
  assignmentCount: number;
  requiresApproval: boolean;
  expiryLabel: string;
  neverExpires: boolean;
  staleGuestCount: number;
  expiringSoonCount: number;
  workflowRuns: EmWorkflowRuns | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface EmStats {
  activePackages: number;
  totalAssignments: number;
  expiringSoon: number;
  workflowFailures: number;
}

export interface EmInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendedSteps: string[];
  affectedItems?: string[];
  learnMoreUrl?: string;
}

export interface EmInsights {
  insights: EmInsight[];
  completionScore: number;
  passedChecks: number;
  totalChecks: number;
}

export interface EmCatalog {
  items: EmItem[];
  stats: EmStats;
  insights: EmInsights;
  emLicensed: boolean;
}

export interface EmAssignmentView {
  principalName: string;
  isGuest: boolean;
  granted: string | null;
  expiry: string | null;
}

export interface EmPolicyView {
  displayName: string;
  requiresApproval: boolean;
  expiryLabel: string;
}

export interface EmResourceView {
  name: string;
  type: string;
}

export interface EmPackageDetail {
  id: string;
  displayName: string;
  catalog: string | null;
  emLicensed: boolean;
  assignments: EmAssignmentView[];
  policies: EmPolicyView[];
  resources: EmResourceView[];
}

export type EmKindFilter = "all" | "package" | "workflow";
export type EmExpiryFilter = "all" | "never" | "expiring";

// --- Compare ---

export type EmCompareCellStatus = "pass" | "fail" | "na";

export interface EmCompareTenant {
  tenantId: string;
  name: string;
  expiringSoon: number;
  emLicensed: boolean;
}

export interface EmCompareCheck {
  id: string;
  label: string;
}

export interface EmCompareGrid {
  tenants: EmCompareTenant[];
  checks: EmCompareCheck[];
  cells: Record<string, Record<string, EmCompareCellStatus>>;
}
