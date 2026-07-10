/** App Registrations — mirrors app-registrations.types.ts / app-registrations.detail.types.ts DTOs exactly. */

export type Audience = "single" | "multi";

export type HealthChipKey =
  | "secret_expired"
  | "cert_expired"
  | "secret_expiring"
  | "cert_expiring"
  | "high_risk_permissions"
  | "no_owner"
  | "no_credentials"
  | "multitenant"
  | "healthy";

export type ChipSeverity = "danger" | "warning" | "muted" | "info" | "success";

/** Worst-severity status for a row (drives sort + the security banner). */
export type HealthStatus = "danger" | "warning" | "healthy";

export interface HealthChip {
  key: HealthChipKey;
  severity: ChipSeverity;
  /** expiring chips → days until expiry. */
  days?: number;
}

export interface AppRegistrationListItem {
  id: string;
  appId: string;
  displayName: string;
  publisherDomain: string | null;
  audience: Audience;
  signInAudience: string | null;
  createdDateTime: string | null;
  secretCount: number;
  certCount: number;
  /** Soonest credential expiry (secret or cert), ISO, or null if none. */
  nearestExpiry: string | null;
  apiPermissionCount: number;
  hasHighRiskPermission: boolean;
  /** Display names of owners (possibly empty); empty when ownerCount is null. */
  owners: string[];
  /** null = owners unknown (the $expand fallback path), so no "No owner" chip. */
  ownerCount: number | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export interface AppRegistrationStats {
  total: number;
  secretsExpiringSoon: number;
  expiredCredentials: number;
  noOwner: number;
}

export interface AppRegistrationCatalog {
  apps: AppRegistrationListItem[];
  stats: AppRegistrationStats;
}

export interface AppOwner {
  id: string;
  displayName: string;
  userPrincipalName: string | null;
}

export interface AppRegistrationOverview {
  id: string;
  appId: string;
  displayName: string;
  publisherDomain: string | null;
  audience: Audience;
  signInAudience: string | null;
  createdDateTime: string | null;
  notes: string | null;
  secretCount: number;
  certCount: number;
  nearestExpiry: string | null;
  ownerCount: number;
  owners: AppOwner[];
  /** SP objectId for the matching enterprise app, or null if none in tenant. */
  spObjectId: string | null;
  healthStatus: HealthStatus;
  chips: HealthChip[];
}

export type CredentialStatus = "expired" | "expiring" | "ok";

export interface CredentialInfo {
  keyId: string | null;
  displayName: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  status: CredentialStatus;
  daysUntil: number | null;
}

export interface CredentialsTabData {
  secrets: CredentialInfo[];
  certificates: CredentialInfo[];
}

export type PermissionType = "delegated" | "application";
export type ConsentState = "granted" | "not_granted" | "unknown";

export interface PermissionRow {
  id: string;
  name: string;
  type: PermissionType;
  resource: string;
  highRisk: boolean;
  consent: ConsentState;
}

export interface PermissionsTabData {
  delegated: PermissionRow[];
  application: PermissionRow[];
  total: number;
  granted: number;
  highRisk: number;
}

export interface RedirectGroup {
  platform: string;
  uris: string[];
}

export interface AuthenticationTabData {
  redirectGroups: RedirectGroup[];
  logoutUrl: string | null;
  implicitAccessToken: boolean;
  implicitIdToken: boolean;
  signInAudience: string | null;
  audience: Audience;
}

export interface ExposedScope {
  id: string;
  value: string | null;
  adminConsentDisplayName: string | null;
  type: string | null;
  isEnabled: boolean;
}

export interface DefinedAppRole {
  id: string;
  value: string | null;
  displayName: string | null;
  allowedMemberTypes: string[];
  isEnabled: boolean;
}

export interface ExposedApiTabData {
  identifierUris: string[];
  scopes: ExposedScope[];
  appRoles: DefinedAppRole[];
}

export interface DirectoryRoleAssignment {
  id: string;
  roleDefinitionId: string | null;
  displayName: string | null;
  description: string | null;
  isBuiltIn: boolean;
  isPrivileged: boolean;
  /** directoryScopeId from Graph; '/' means tenant-wide. */
  scope: string;
}

export interface RolesAdminsTabData {
  /** Enterprise-app SP objectId the roles are assigned to, or null if no SP. */
  spObjectId: string | null;
  /** false when RoleManagement.Read.Directory is missing (403). */
  accessible: boolean;
  assignments: DirectoryRoleAssignment[];
}
