/**
 * Conditional Access types — mirrors conditional-access.types.ts /
 * conditional-access.detail.types.ts DTOs exactly.
 */

export type CaChipKey = "no_mfa_for_all" | "report_only_too_long" | "break_glass_not_excluded" | "excludes_too_many_users" | "disabled" | "modified_recently" | "healthy";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: CaChipKey;
  severity: ChipSeverity;
  days?: number;
}

export type CaState = "enabled" | "enabledForReportingButNotEnforced" | "disabled";

export interface CaControls {
  mfa: boolean;
  compliantDevice: boolean;
  domainJoined: boolean;
  authStrength: string | null;
  block: boolean;
  signInFrequency: boolean;
  persistentBrowserSession: boolean;
}

export interface CaPolicyListItem {
  id: string;
  displayName: string;
  state: CaState;
  stateLabel: string;
  assignedToSummary: string;
  assignedToCount: number;
  excludedSummary: string;
  excludedCount: number;
  targetAppsSummary: string;
  targetAppsCount: number;
  controls: CaControls;
  includesAllUsers: boolean;
  legacyAuthTargeted: boolean;
  createdDateTime: string | null;
  modifiedDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface CaStats {
  total: number;
  enforced: number;
  reportOnly: number;
  coverageGaps: number;
}

export type RecommendationSeverity = "danger" | "warning" | "info";

export interface CaRecommendation {
  id: string;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  remediationSteps: string[];
  affectedPolicies?: string[];
  learnMoreUrl?: string;
}

export interface CaTenantRecommendations {
  recommendations: CaRecommendation[];
  completionScore: number;
  passedChecks: number;
  totalChecks: number;
}

export interface CaCatalog {
  items: CaPolicyListItem[];
  stats: CaStats;
  recommendations: CaTenantRecommendations;
}

export interface CaPolicyDetail {
  id: string;
  displayName: string;
  state: CaState;
  stateLabel: string;
  createdDateTime: string | null;
  modifiedDateTime: string | null;
  assignedToSummary: string;
  excludedSummary: string;
  targetAppsSummary: string;
  controls: CaControls;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface NamedLocationRef {
  id: string;
  displayName: string;
  isTrusted: boolean;
  type: "ip" | "countryOrRegion" | "unknown";
}

export interface CaConditionsTab {
  users: {
    include: string[];
    exclude: string[];
    includeRoles: string[];
    excludeRoles: string[];
    includeGuestsExternal: boolean;
  };
  applications: { include: string[]; exclude: string[]; userActions: string[] };
  platforms: { include: string[]; exclude: string[] };
  locations: { include: NamedLocationRef[]; exclude: NamedLocationRef[] };
  clientAppTypes: string[];
  risk: {
    userRiskLevels: string[];
    signInRiskLevels: string[];
    p2Available: boolean;
  };
}

export interface CaControlsTab {
  grant: {
    operator: string;
    mfa: boolean;
    compliantDevice: boolean;
    domainJoined: boolean;
    block: boolean;
    authStrength: string | null;
    otherControls: string[];
  };
  session: {
    signInFrequency: string | null;
    persistentBrowser: string | null;
    appEnforcedRestrictions: boolean;
    continuousAccessEvaluation: string | null;
  };
}

export interface CaCoverageGap {
  key: string;
  description: string;
  severity: "danger" | "warning";
}

export interface CaCoverageTab {
  gaps: CaCoverageGap[];
  legacyAuthBlocked: boolean;
  allUsersHaveMfa: boolean;
  breakGlassExcluded: boolean;
}

export interface CaActivityEntry {
  id: string;
  activity: string;
  initiatedBy: string | null;
  activityDateTime: string | null;
  result: string | null;
}

export interface CaActivityTab {
  changes: CaActivityEntry[];
}

export type StateFilter = "all" | "enabled" | "reportOnly" | "disabled";
export type ControlFilter = "all" | "mfa" | "compliantDevice" | "authStrength" | "block";
export type ScopeFilter = "all" | "allUsers" | "roles" | "guests";
export type CaDetailTab = "overview" | "conditions" | "controls" | "coverage" | "activity";

// --- Backups ---

export type CaSnapshotTriggerType = "MANUAL" | "SCHEDULED";
export type CaSnapshotStatusType = "SUCCEEDED" | "FAILED";

export interface CaSnapshotSummary {
  id: string;
  label: string | null;
  triggerType: CaSnapshotTriggerType;
  status: CaSnapshotStatusType;
  policyCount: number;
  createdAt: string;
  createdBy: string;
}

export interface CaSnapshotPolicyView {
  policyId: string;
  displayName: string;
  state: string;
}

export interface CaSnapshotDetail extends CaSnapshotSummary {
  policies: CaSnapshotPolicyView[];
}

export type CaPolicyChangeKind = "added" | "removed" | "modified";

export interface CaPolicyFieldChange {
  field: string;
  before: string;
  after: string;
}

export interface CaPolicyDiff {
  policyId: string;
  displayName: string;
  kind: CaPolicyChangeKind;
  changes: CaPolicyFieldChange[];
}

export interface CaSnapshotDiff {
  fromSnapshotId: string;
  toSnapshotId: string;
  policies: CaPolicyDiff[];
}

export type CaPolicyRestoreStatus = "restored" | "skipped" | "failed";

export interface CaPolicyRestoreResult {
  policyId: string;
  displayName: string;
  status: CaPolicyRestoreStatus;
  mode: "update" | "recreate";
  failureReason?: string;
  recreatedAsPolicyId?: string;
}

export interface CaRestoreSummary {
  snapshotId: string;
  results: CaPolicyRestoreResult[];
  restored: number;
  skipped: number;
  failed: number;
}

// --- Compare ---

export type CaCompareCellStatus = "pass" | "fail" | "na";

export interface CaCompareTenant {
  tenantId: string;
  name: string;
}

export interface CaCompareCheck {
  id: string;
  label: string;
}

export interface CaCompareGrid {
  tenants: CaCompareTenant[];
  checks: CaCompareCheck[];
  cells: Record<string, Record<string, CaCompareCellStatus>>;
}
