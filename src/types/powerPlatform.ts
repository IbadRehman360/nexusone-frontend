export interface PowerPlatformEnvironment {
  environmentId: string;
  environmentName: string;
  environmentDisplayName?: string;
  environmentUrl: string;
  displayName?: string;
  type?: string;
  region?: string;
  state?: string;
  rootBusinessUnit?: unknown;
  hasDataverse?: boolean;
}

export interface SecurityGroup {
  id: string;
  name: string;
  source?: string;
}

export interface Team {
  teamId: string;
  name: string;
  businessUnitId?: string;
  businessUnitName?: string;
  memberCount?: number;
  azureAdObjectId?: string;
  securityGroupName?: string;
}

export interface UserRoleRef {
  roleId: string;
  roleName: string;
}

export interface PPUser {
  userId: string;
  fullName: string;
  email: string;
  businessUnitId?: string;
  businessUnitName?: string;
  roles?: UserRoleRef[];
  enabled?: boolean;
}

export interface BusinessUnit {
  businessUnitId: string;
  name: string;
  parentBusinessUnitId?: string | null;
  children?: BusinessUnit[];
}

export interface Role {
  roleId: string;
  roleName: string;
  businessUnitId?: string;
  businessUnitName?: string;
  description?: string;
}

export interface EnvironmentGroup {
  id: string;
  displayName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnvironmentGroupEnvironment {
  environmentId: string;
  environmentName?: string;
  environmentUrl?: string;
}

export interface EnvironmentGroupWithEnvironments extends EnvironmentGroup {
  environments: EnvironmentGroupEnvironment[];
}

export interface EnvironmentWithTeams {
  environmentId: string;
  environmentName: string;
  environmentUrl: string;
  teams: Team[];
}

export interface EnvironmentWithUsers {
  environmentId: string;
  environmentName: string;
  environmentUrl: string;
  users: PPUser[];
}

export interface ResourceSummaryTotals {
  environments: number;
  apps: number;
  flows: number;
  pages: number;
}

export interface ResourceSummaryByEnv {
  environmentId: string;
  environmentName: string;
  apps: number;
  flows: number;
  pages: number;
}

export interface ResourceSummary {
  totals: ResourceSummaryTotals;
  byEnvironment: ResourceSummaryByEnv[];
}

export interface PPDelegation {
  id: string;
  environmentUrl: string;
  environmentName?: string;
  delegatorId: string;
  delegatorName?: string;
  delegatorEmail?: string;
  delegateeId: string;
  delegateeName?: string;
  delegateeEmail?: string;
  delegatedRoleIds: string[];
  delegatedRoleNames?: string[];
  originalRoleIds: string[];
  reason?: string;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "expired" | "revoked";
  createdAt: string;
  createdBy: string;
}

export type ImportJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED";

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportJob {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  environmentUrl: string;
  targetTable: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: ImportJobStatus;
  errorReport?: ImportRowError[] | null;
  createdAt: string;
  completedAt?: string | null;
}

export type ComplianceStatus = "compliant" | "at_risk" | "non_compliant";

export interface ComplianceOverviewItem {
  environmentId: string;
  environmentName: string;
  score: number | null;
  status: ComplianceStatus | null;
  checkedAt?: string | null;
}

export interface ComplianceCheck {
  checkId: string;
  label: string;
  description: string;
  status: "pass" | "fail" | "warning" | "skipped";
  details: string;
  weight: number;
}

export interface ComplianceReport {
  id: string;
  environmentId: string;
  environmentName: string;
  environmentUrl: string | null;
  score: number;
  status: ComplianceStatus;
  checks: ComplianceCheck[];
  checkedAt: string;
  checkedBy: string | null;
}

export interface ComplianceOverview {
  items: ComplianceOverviewItem[];
  summary: {
    total: number;
    compliant: number;
    at_risk: number;
    non_compliant: number;
    no_report: number;
  };
}

export interface PpDlpEnvironmentRef {
  id: string;
  name: string;
}

export interface PpDlpConnectorCounts {
  business: number;
  nonBusiness: number;
  blocked: number;
}

export interface PpDlpPolicySummary {
  id: string;
  name: string;
  isTenantWide: boolean;
  environmentType: string;
  environments: PpDlpEnvironmentRef[];
  connectorCounts: PpDlpConnectorCounts;
  createdTime: string;
  lastModifiedTime: string;
}

export type DlpConnectorClassification = "Business" | "Non-Business" | "Blocked";

export interface PpDlpConnector {
  name: string;
  classification: DlpConnectorClassification;
}

export interface PpDlpPolicyDetail extends PpDlpPolicySummary {
  connectors: PpDlpConnector[];
}

export interface PpConnectorCatalogItem {
  id: string;
  name: string;
  displayName: string;
  apiId: string;
  tier: string | null;
}

export interface DlpConnectorAssignment {
  id: string;
  name: string;
  type?: string;
}

export interface UpsertDlpPolicyPayload {
  displayName: string;
  defaultConnectorsClassification: "General" | "Confidential" | "Blocked";
  businessConnectors: DlpConnectorAssignment[];
  nonBusinessConnectors: DlpConnectorAssignment[];
  blockedConnectors: DlpConnectorAssignment[];
  environments: string[];
  environmentType: "AllEnvironments" | "ExceptEnvironments" | "OnlyEnvironments";
}

export type AuditActivityCategory = "PowerPlatform" | "Dataverse" | "DLP" | "SecurityCompliance" | "Other";

export interface UnifiedAuditActivity {
  id: string;
  timestamp: string;
  operation: string;
  workload: string;
  category: AuditActivityCategory;
  user: string;
  clientIp: string | null;
  target: string | null;
  resultStatus: string | null;
  policyName: string | null;
}

export interface EnrichedBackup {
  bapBackupId: string;
  backupType: string;
  backupRequestDateTime: string;
  notes?: string;
  bapStatus: string;
  runId?: string;
  triggeredBy?: string;
  createdAt?: string;
}

export interface BackupListResponse {
  backups: EnrichedBackup[];
  manualBackupCount: number;
}

export interface BackupSchedule {
  id: string;
  tenantId: string;
  environmentId: string;
  environmentName: string;
  cronExpression: string;
  enabled: boolean;
  nextRunAt: string;
  createdAt: string;
}

export interface BackupDetail {
  bapBackupId: string;
  environmentId: string;
  environmentName: string;
  backupType: "SystemDefined" | "UserDefined";
  status: "Pending" | "Succeeded" | "Failed";
  backupPointDateTime: string;
  notes: string;
  triggeredBy: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
  appsCount: number;
  flowsCount: number;
}

export interface RestoreRun {
  id: string;
  backupRunId: string | null;
  environmentId: string;
  restoreType: "MANUAL" | "SYSTEM";
  targetEnvironmentName: string | null;
  restorePointDateTime: string | null;
  notes: string | null;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  triggeredBy: string | null;
  createdAt: string;
  completedAt: string | null;
}
