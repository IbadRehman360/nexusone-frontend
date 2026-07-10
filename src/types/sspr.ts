/**
 * SSPR types — mirrors sspr.types.ts / sspr.detail.types.ts DTOs exactly.
 */

export type SsprChipKey = "registered" | "capable_not_registered" | "admin_not_registered" | "weak_method" | "out_of_scope";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";

export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: SsprChipKey;
  severity: ChipSeverity;
}

export type MethodCategory = "app" | "phone" | "email" | "questions";
export type SsprStatus = "enabled_all" | "enabled_selected" | "off" | "unknown";
export type WritebackStatus = "healthy" | "unhealthy" | "na" | "unknown";

export interface SsprUserListItem {
  id: string;
  userPrincipalName: string;
  userDisplayName: string;
  isRegistered: boolean;
  inScope: boolean;
  isCapable: boolean;
  isAdmin: boolean;
  methodCategories: MethodCategory[];
  lastUpdatedDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface SsprStats {
  status: SsprStatus;
  coveragePct: number;
  registeredCount: number;
  capableCount: number;
  resetsThisMonth: number;
  resetSuccessRate: number;
  writeback: WritebackStatus;
}

export interface SsprCatalog {
  items: SsprUserListItem[];
  stats: SsprStats;
}

export interface SsprUserMethod {
  id: string;
  type: string;
  displayName: string;
  detail: string | null;
}

export type ActivityKind = "reset" | "unlock" | "other";
export type ActivityResult = "success" | "failure" | "other";

export interface SsprUserActivity {
  id: string;
  activity: string;
  kind: ActivityKind;
  result: ActivityResult;
  failureReason: string | null;
  activityDateTime: string | null;
}

export interface SsprUserDetail {
  userPrincipalName: string;
  userDisplayName: string;
  isRegistered: boolean;
  inScope: boolean;
  isCapable: boolean;
  isAdmin: boolean;
  methodCategories: MethodCategory[];
  lastUpdatedDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
  methods: SsprUserMethod[];
  recentActivity: SsprUserActivity[];
}

export interface SsprAllowedMethod {
  method: string;
  state: "enabled" | "disabled";
}

export interface SsprConfig {
  status: SsprStatus;
  scopeLabel: string;
  methodsRequiredNote: string;
  allowedMethods: SsprAllowedMethod[];
  writeback: { applicable: boolean; status: WritebackStatus; source: string };
  portalDeepLink: string;
}

export interface SsprUsagePoint {
  date: string;
  count: number;
}

export interface SsprUsageWeek {
  week: string;
  success: number;
  failure: number;
}

export interface SsprUsageBreakdown {
  name: string;
  count: number;
}

export interface SsprUsage {
  resetsOverTime: SsprUsagePoint[];
  byWeek: SsprUsageWeek[];
  topFailureReasons: SsprUsageBreakdown[];
  byMethod: SsprUsageBreakdown[];
  byMethodAvailable: boolean;
  resetVsUnlock: { resets: number; unlocks: number };
  summary: {
    thisMonth: number;
    succeeded: number;
    failed: number;
    successRatePct: number;
  };
}

export type SsprView = "users" | "config" | "usage";
export type SsprUserFilter = "all" | "capable_not_registered" | "registered" | "out_of_scope";
