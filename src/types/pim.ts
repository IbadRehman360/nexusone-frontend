/**
 * PIM types — mirrors pim.types.ts / pim-compare.types.ts DTOs exactly.
 */

export type PimChipKey = "standing_global_admin" | "permanent_high_privilege" | "activation_lacks_mfa_approval" | "eligible_never_activated" | "healthy_jit";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: PimChipKey;
  severity: ChipSeverity;
  days?: number;
}

export type PimAssignmentKind = "eligible" | "active";
export type PimPrincipalType = "user" | "group" | "servicePrincipal" | "unknown";
export type RecommendationSeverity = "danger" | "warning" | "info";

export interface PimActivationRules {
  requiresMfa: boolean;
  requiresApproval: boolean;
  maxDurationHours: number | null;
  approvers: string[];
}

export interface PimAssignmentItem {
  id: string;
  principalId: string;
  principalName: string;
  principalType: PimPrincipalType;
  roleDefinitionId: string;
  roleName: string;
  isTier0: boolean;
  isGlobalAdmin: boolean;
  kind: PimAssignmentKind;
  standing: boolean;
  permanent: boolean;
  activated: boolean;
  memberType: string;
  startDateTime: string | null;
  endDateTime: string | null;
  activation: PimActivationRules | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface PimStats {
  standingAdmins: number;
  eligibleJit: number;
  globalAdmins: number;
  activeNow: number;
}

export interface PimRecommendation {
  id: string;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  remediationSteps: string[];
  affectedPrincipals?: string[];
  learnMoreUrl?: string;
}

export interface PimTenantRecommendations {
  recommendations: PimRecommendation[];
  completionScore: number;
  passedChecks: number;
  totalChecks: number;
}

export interface PimPosture {
  items: PimAssignmentItem[];
  stats: PimStats;
  recommendations: PimTenantRecommendations;
  pimLicensed: boolean;
}

export interface PimActivationEvent {
  roleName: string;
  startDateTime: string | null;
  endDateTime: string | null;
}

export interface PimPrincipalDetail {
  principalId: string;
  principalName: string;
  principalType: PimPrincipalType;
  pimLicensed: boolean;
  assignments: PimAssignmentItem[];
  activationHistory: PimActivationEvent[];
}

export type PimTypeFilter = "all" | "eligible" | "active";
export type PimStandingFilter = "all" | "standing";
export type PimRoleFilter = "all" | "tier0";

// --- Compare ---

export type PimCompareCellStatus = "pass" | "fail" | "na";

export interface PimCompareTenant {
  tenantId: string;
  name: string;
  standingAdmins: number;
  globalAdmins: number;
}

export interface PimCompareCheck {
  id: string;
  label: string;
}

export interface PimCompareGrid {
  tenants: PimCompareTenant[];
  checks: PimCompareCheck[];
  cells: Record<string, Record<string, PimCompareCellStatus>>;
}
