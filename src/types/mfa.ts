/**
 * MFA types — mirrors mfa.types.ts / mfa.detail.types.ts / mfa.policy.types.ts /
 * mfa.posture.types.ts DTOs exactly.
 */

export type MfaRiskKey = "phishing_resistant" | "sms_voice_only" | "no_mfa" | "admin_without_strong" | "out_of_scope";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";

export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: MfaRiskKey;
  severity: ChipSeverity;
}

export type MethodStrength = "strong" | "weak" | "none";
export type MethodTone = "strong" | "weak" | "neutral";
export type UserType = "member" | "guest";

export interface MfaUserListItem {
  id: string;
  userPrincipalName: string;
  userDisplayName: string;
  isAdmin: boolean;
  isMfaRegistered: boolean;
  inScope: boolean;
  hasStrongMethod: boolean;
  strength: MethodStrength;
  methodsRegistered: string[];
  userType: UserType;
  lastUpdatedDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface MfaStats {
  coveragePct: number;
  registeredCount: number;
  inScopeCount: number;
  weakFactorOnlyCount: number;
  adminsAtRiskCount: number;
  legacyAuthBlocked: boolean | null;
}

export interface MfaCatalog {
  items: MfaUserListItem[];
  stats: MfaStats;
}

export interface MfaUserMethod {
  id: string;
  type: string;
  displayName: string;
  detail: string | null;
  tone: MethodTone;
}

export interface MfaUserActivity {
  id: string;
  activity: string;
  result: string | null;
  activityDateTime: string | null;
}

export interface MfaUserDetail {
  userPrincipalName: string;
  userDisplayName: string;
  isAdmin: boolean;
  isMfaRegistered: boolean;
  inScope: boolean;
  hasStrongMethod: boolean;
  strength: MethodStrength;
  methodsRegistered: string[];
  userType: UserType;
  lastUpdatedDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
  methods: MfaUserMethod[];
  recentActivity: MfaUserActivity[];
}

export type MfaPolicyState = "enforced" | "report_only" | "off";

export interface MfaEnforcingPolicy {
  id: string;
  displayName: string;
  state: MfaPolicyState;
  stateLabel: string;
  assignedToSummary: string;
  excludedCount: number;
  requiresPhishingResistant: boolean;
}

export interface MfaPolicyHealth {
  enforcingPolicies: MfaEnforcingPolicy[];
  enforcedCount: number;
  reportOnlyCount: number;
  excludedUserCount: number;
  legacyAuthBlocked: boolean;
  gaps: { enforced: number; reportOnly: number; excluded: number };
  graphHealthy: boolean;
  portalDeepLink: string;
  enforcementNote: string;
}

export interface MfaPosturePoint {
  date: string;
  count: number;
}

export interface MfaMethodStrengthBucket {
  name: string;
  count: number;
}

export interface MfaPosture {
  methodStrength: MfaMethodStrengthBucket[];
  adoptionOverTime: MfaPosturePoint[];
  adoptionAvailable: boolean;
  failedPromptsOverTime: MfaPosturePoint[];
  failedPromptsAvailable: boolean;
  summary: {
    coveragePct: number;
    strongPct: number;
    weakCount: number;
    noneCount: number;
  };
}

export type MfaView = "users" | "posture" | "policy";
export type MfaUserFilter = "all" | "capable_no_strong" | "weak_only" | "protected";
