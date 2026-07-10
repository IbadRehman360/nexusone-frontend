/**
 * Identity Protection types — mirrors idp.types.ts / idp-compare.types.ts DTOs exactly.
 */

export type IdpChipKey = "high_risk" | "medium_risk" | "low_risk" | "confirmed_compromised" | "unremediated_24h" | "leaked_credentials" | "dismissed" | "remediated";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: IdpChipKey;
  severity: ChipSeverity;
  hours?: number;
}

export type RiskLevel = "high" | "medium" | "low" | "none";
export type RiskState = "atRisk" | "confirmedCompromised" | "dismissed" | "remediated" | "confirmedSafe" | "none";
export type IdpItemKind = "user" | "servicePrincipal";
export type InsightSeverity = "danger" | "warning" | "info";

export interface IdpQueueItem {
  id: string;
  kind: IdpItemKind;
  principalId: string;
  principalName: string;
  principalUpn: string | null;
  riskLevel: RiskLevel;
  riskState: RiskState;
  riskDetail: string | null;
  riskLastUpdated: string | null;
  stalenessHours: number | null;
  reasons: string[];
  riskySignInCount: number;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface IdpStats {
  high: number;
  medium: number;
  low: number;
  riskySignIns: number;
  unremediated24h: number;
  confirmedCompromised: number;
}

export interface IdpInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendedSteps: string[];
  affectedPrincipals?: string[];
  learnMoreUrl?: string;
}

export interface IdpInsights {
  insights: IdpInsight[];
  exposurePercent: number;
  highRisk: number;
  unremediated: number;
}

export interface IdpQueue {
  items: IdpQueueItem[];
  stats: IdpStats;
  insights: IdpInsights;
  idpLicensed: boolean;
}

export interface IdpDetection {
  riskEventType: string;
  riskLevel: string;
  activity: string | null;
  ipAddress: string | null;
  detectedDateTime: string | null;
  source: string | null;
}

export interface IdpRiskySignIn {
  id: string;
  createdDateTime: string | null;
  appDisplayName: string | null;
  ipAddress: string | null;
  location: string | null;
  riskLevel: string;
  riskEventTypes: string[];
}

export interface IdpHistoryEntry {
  riskState: string | null;
  riskLevel: string | null;
  riskDetail: string | null;
  initiatedBy: string | null;
  updatedDateTime: string | null;
}

export interface IdpUserDetail {
  principalId: string;
  principalName: string;
  principalUpn: string | null;
  idpLicensed: boolean;
  riskLevel: RiskLevel;
  riskState: RiskState;
  detections: IdpDetection[];
  riskySignIns: IdpRiskySignIn[];
  history: IdpHistoryEntry[];
}

export type IdpSeverityFilter = "all" | "high" | "medium" | "low";
export type IdpStateFilter = "all" | "atRisk" | "confirmedCompromised" | "dismissed" | "remediated";
export type IdpWindowFilter = "all" | "24h" | "7d" | "30d";

// --- SOC (cross-tenant) ---

export interface IdpSocTenantRollup {
  tenantId: string;
  name: string;
  high: number;
  medium: number;
  low: number;
  unremediated: number;
  idpLicensed: boolean;
}

export interface IdpSocQueueItem extends IdpQueueItem {
  tenantId: string;
  tenantName: string;
}

export interface IdpSocQueue {
  tenants: IdpSocTenantRollup[];
  items: IdpSocQueueItem[];
}
