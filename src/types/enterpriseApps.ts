/** Enterprise Applications — mirrors enterprise-apps.types.ts / enterprise-apps.detail.types.ts DTOs exactly. */

export type SsoMode = "saml" | "oidc" | "none";
export type AppType = "enterprise" | "microsoft" | "managedIdentity" | "other";
export type HealthStatus = "danger" | "warning" | "disabled" | "healthy";
export type ChipSeverity = "danger" | "warning" | "muted" | "success";
export type HealthChipKey = "cert_expired" | "cert_expiring" | "broad_permissions" | "unused" | "disabled" | "healthy";

export interface HealthChip {
  key: HealthChipKey;
  severity: ChipSeverity;
  days?: number;
}

export interface EnterpriseAppListItem {
  id: string;
  appId: string;
  displayName: string;
  publisher: string | null;
  logoUrl: string | null;
  ssoMode: SsoMode;
  accountEnabled: boolean;
  assignmentRequired: boolean;
  appType: AppType;
  createdDateTime: string | null;
  lastSignInDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface EnterpriseAppStats {
  total: number;
  ssoConfigured: number;
  needsAttention: number;
  disabled: number;
}

export interface EnterpriseAppCatalog {
  apps: EnterpriseAppListItem[];
  stats: EnterpriseAppStats;
}

export interface EnterpriseAppDetail {
  id: string;
  appId: string;
  displayName: string;
  publisher: string | null;
  logoUrl: string | null;
  homepage: string | null;
  ssoMode: SsoMode;
  accountEnabled: boolean;
  assignmentRequired: boolean;
  servicePrincipalType: string | null;
  createdDateTime: string | null;
  lastSignInDateTime: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface AssignedPrincipal {
  id: string;
  displayName: string;
  type: "user" | "group" | "other";
  roleName: string | null;
  assignedOn: string | null;
}

export interface AppOwner {
  id: string;
  displayName: string;
  email: string | null;
}

export interface AppRoleSummary {
  id: string;
  displayName: string;
  description: string | null;
}

export interface AccessTabData {
  assignments: AssignedPrincipal[];
  owners: AppOwner[];
  appRoles: AppRoleSummary[];
}

export interface CertInfo {
  thumbprint: string | null;
  endDateTime: string | null;
  status: "expired" | "expiring" | "ok";
  daysUntil: number | null;
}

export interface SsoTabData {
  mode: SsoMode;
  certificates: CertInfo[];
  replyUrls: string[];
}

export interface PermissionRow {
  scope: string;
  consent: "admin" | "user";
  resource: string | null;
  highRisk: boolean;
  type: "delegated" | "application";
}

export interface PermissionsTabData {
  rows: PermissionRow[];
  total: number;
  adminConsented: number;
  highPrivilege: number;
}

export type SignInStatus = "success" | "failure" | "interrupted";

export interface SignInLogRow {
  id: string;
  createdDateTime: string;
  userPrincipalName: string | null;
  userDisplayName: string | null;
  appDisplayName: string | null;
  resourceDisplayName: string | null;
  ipAddress: string | null;
  clientApp: string | null;
  correlationId: string | null;
  conditionalAccessStatus: string | null;
  city: string | null;
  countryOrRegion: string | null;
  location: string | null;
  browser: string | null;
  operatingSystem: string | null;
  status: SignInStatus;
  errorCode: number;
  failureReason: string | null;
}
