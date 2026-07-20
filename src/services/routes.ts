/**
 * Central route constants, grouped per module. Paths are relative to
 * apiClient's baseURL ("/api").
 *
 * Each module (Power Platform, and later Entra ID / Data Protection) gets its
 * own named export below — add a new `<MODULE>_ROUTES` const and spread it
 * into `API_ROUTES` the same way `POWER_PLATFORM_ROUTES` is. Non-module calls
 * used by app-shell chrome (layout, home, auth) live in their own small
 * variables rather than being folded into a module block.
 */

/** Session/auth calls used by the app shell (layout, sign-in, home) — not tied to any product module. */
export const AUTH_ROUTES = {
  AZURE_LOGIN: "/auth/azure/login",
  CALLBACK: "/auth/azure/callback",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  ACKNOWLEDGE_WELCOME: "/auth/welcome-acknowledged",
  MFA_VERIFY: "/auth/mfa/verify",
  MFA_SETUP: "/auth/mfa/setup",
  MFA_VERIFY_SETUP: "/auth/mfa/verify-setup",
  MFA_DISABLE: "/auth/mfa/disable",
} as const;

/** Presence + tenant member list used by the app-shell header/rail — not tied to any product module. */
export const PLATFORM_ROUTES = {
  USERS: "/platform/users",
} as const;

/** Tenant list/switch/consent calls used by the app-shell tenant switcher — not tied to any product module. */
export const TENANT_ROUTES = {
  GET_ALL: "/tenants",
  INITIATE_CONSENT: "/tenants/initiate-consent",
  COMPLETE_CONSENT: "/tenants/complete-consent",
  SWITCH: (id: string) => `/tenants/${id}/switch`,
  ROLES: (id: string) => `/tenants/${id}/roles`,
  MEMBERS: (id: string) => `/tenants/${id}/members`,
  MEMBER: (id: string, userId: string) => `/tenants/${id}/members/${userId}`,
  DISABLE_MEMBER_MFA: (id: string, userId: string) =>
    `/tenants/${id}/members/${userId}/disable-mfa`,
} as const;

/** Per-module Microsoft admin-consent flow — Connect button on a purchased-
 * but-not-yet-connected module. Distinct from TENANT_ROUTES' consent calls
 * (tenant bootstrap, not module-scoped). */
export const MODULE_CONSENT_ROUTES = {
  INITIATE: "/module-consent/initiate",
  COMPLETE: "/module-consent/complete",
  STATUS: "/module-consent/status",
  RECHECK_PURVIEW: "/module-consent/recheck-purview",
  PURVIEW_DETAILS: "/module-consent/purview-details",
} as const;

/** Invitations — pending invites into a tenant. */
export const INVITATION_ROUTES = {
  LIST: "/invitations",
  CREATE: "/invitations",
  RESEND: (id: string) => `/invitations/${id}/resend`,
  REVOKE: (id: string) => `/invitations/${id}`,
} as const;

/** Dev-only role/module-scenario impersonation — see backend ImpersonationService. Not reachable outside development. */
export const DEV_ROUTES = {
  IMPERSONATE_STATUS: "/dev/impersonate",
  START_ROLE: "/dev/impersonate",
  STOP_ROLE: "/dev/impersonate",
  START_MODULE_SCENARIO: "/dev/impersonate/module-scenario",
  STOP_MODULE_SCENARIO: "/dev/impersonate/module-scenario",
  RESET_ONBOARDING: "/dev/impersonate/reset-onboarding",
  TOGGLE_TENANT_STATUS: "/dev/impersonate/toggle-tenant-status",
} as const;

/** Billing & Plan settings page — subscription, invoices, payment methods, seats. */
export const BILLING_ROUTES = {
  PLANS: "/billing/plans",
  STATE: "/billing/state",
  CHECKOUT_SESSION: "/billing/checkout-session",
  PORTAL_SESSION: "/billing/portal-session",
  CANCEL: "/billing/cancel",
  REACTIVATE: "/billing/reactivate",
  MODULE_CANCEL: (module: string) => `/billing/modules/${module}/cancel`,
  MODULE_REACTIVATE: (module: string) => `/billing/modules/${module}/reactivate`,
  MODULE_RETRY_INVOICE: (module: string) => `/billing/modules/${module}/retry-invoice`,
  RETRY_INVOICE: "/billing/retry-invoice",
  INVOICES: "/billing/invoices",
  PAYMENT_METHODS: "/billing/payment-methods",
  PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,
  SEATS: "/billing/seats",
} as const;

/** Activity Log — tenant audit trail. */
export const AUDIT_LOG_ROUTES = {
  LIST: "/audit-logs",
  EXPORT: "/audit-logs/export",
} as const;

/** Dataverse audit trail — Power Platform environment audit logs. */
export const DATAVERSE_LOGS_ROUTES = {
  LIST: "/dataverse-logs",
} as const;

/** Support settings page — Zoho Desk-backed tickets. */
export const SUPPORT_ROUTES = {
  TICKETS: "/support/tickets",
  TICKET: (id: string) => `/support/tickets/${id}`,
  REPLIES: (id: string) => `/support/tickets/${id}/replies`,
  ATTACHMENT_CONTENT: (id: string, attachmentId: string) => `/support/tickets/${id}/attachments/${attachmentId}/content`,
} as const;

/** All Power Platform module API calls. */
export const POWER_PLATFORM_ROUTES = {
  ENVIRONMENTS: {
    GET_ALL: "/environments",
    CREATE: "/environments",
    GET_BUSINESS_UNITS: "/environments/business-units",
    GET_ROLES: "/environments/roles",
    GET_SECURITY_GROUP: "/environments/security-group",
    UPDATE: (id: string) => `/environments/${id}`,
    GET_WITH_TEAMS: "/environments/with-teams",
    GET_WITH_USERS: "/environments/with-users",
    GET_APPS: (id: string) => `/environments/${id}/apps`,
    GET_APP_PERMISSIONS: (envId: string, appId: string) => `/environments/${envId}/apps/${appId}/permissions`,
    GET_FLOWS: (id: string) => `/environments/${id}/flows`,
    GET_PAGES: (id: string) => `/environments/${id}/pages`,
    GET_D365: (id: string) => `/environments/${id}/d365`,
    GET_GROUP: (id: string) => `/environments/${id}/group`,
    GET_CAPACITY: "/environments/capacity",
    GET_ORPHAN_FLOWS: "/environments/orphan-flows",
    GET_RESOURCE_SUMMARY: "/environments/resources/summary",
    GET_ORPHAN_APPS: "/environments/orphan-apps",
    GET_STATE: (id: string) => `/environments/${id}/state`,
    GET_STORAGE: "/environments/storage",
    GET_TABLES: (id: string) => `/environments/${id}/tables`,
    GET_TABLE_RECORDS: (id: string, entitySetName: string) => `/environments/${id}/tables/${entitySetName}/records`,
  },
  TEAMS: {
    CREATE: "/teams",
    ASSIGN_ROLE: "/teams/assign-role",
    GET_ROLES: "/teams/roles",
    CHANGE_BUSINESS_UNIT: "/teams/change-business-unit",
  },
  BUSINESS_UNITS: { CREATE: "/business-units" },
  USERS: {
    SEARCH: "/users/search",
    ADD_TO_ENVIRONMENT: "/users/add-to-environment",
    ASSIGN_TO_TEAM: "/users/assign-to-team",
    UPDATE_ROLES: "/users/update-roles",
    CHANGE_BUSINESS_UNIT: "/users/change-business-unit",
  },
  ENVIRONMENT_GROUPS: {
    GET_ALL: "/environment-groups",
    WITH_ENVIRONMENTS: "/environment-groups/with-environments",
    GET_BY_ID: (id: string) => `/environment-groups/${id}`,
    CREATE: "/environment-groups",
    UPDATE: (id: string) => `/environment-groups/${id}`,
    DELETE: (id: string) => `/environment-groups/${id}`,
    GET_ENVIRONMENTS: (groupId: string) => `/environment-groups/${groupId}/environments`,
    ADD_ENVIRONMENT: (groupId: string) => `/environment-groups/${groupId}/environments`,
    REMOVE_ENVIRONMENT: (groupId: string, environmentId: string) => `/environment-groups/${groupId}/environments/${environmentId}`,
  },
  COMPLIANCE: {
    GET_OVERVIEW: "/environmental-compliance",
    GET_LATEST: (environmentId: string) => `/environmental-compliance/${environmentId}`,
    RUN: (environmentId: string) => `/environmental-compliance/${environmentId}/run`,
    GET_HISTORY: (environmentId: string) => `/environmental-compliance/${environmentId}/history`,
  },
  PP_GOVERNANCE: {
    DLP_POLICIES: "/pp-governance/dlp-policies",
    DLP_POLICY_DETAIL: (policyName: string) => `/pp-governance/dlp-policies/${policyName}`,
    CONNECTORS: "/pp-governance/connectors",
    AUDIT_ACTIVITY: "/pp-governance/audit-activity",
  },
  PP_DELEGATIONS: {
    LIST: "/power-platform/delegations",
    CREATE: "/power-platform/delegations",
    REVOKE: (id: string) => `/power-platform/delegations/${id}`,
    USER_ROLES: "/power-platform/delegations/user-roles",
  },
  IMPORT: {
    TABLES: "/import/tables",
    COLUMNS: "/import/columns",
    RUN: "/import/run",
    JOBS: "/import/jobs",
    JOB: (id: string) => `/import/jobs/${id}`,
  },
  BACKUPS: {
    LIST: "/backups",
    CREATE: "/backups",
    SYSTEM_RESTORE: "/backups/system-restore",
    SYNC: (runId: string) => `/backups/${runId}/sync`,
    RESTORE: (runId: string) => `/backups/${runId}/restore`,
    DELETE: (runId: string) => `/backups/${runId}`,
    DELETE_BAP: (bapBackupId: string) => `/backups/bap/${bapBackupId}`,
    RESTORE_BAP: (bapBackupId: string) => `/backups/bap/${bapBackupId}/restore`,
    DETAIL: (bapBackupId: string) => `/backups/${bapBackupId}/detail`,
    SCHEDULES_LIST: "/backups/schedules",
    SCHEDULE_CREATE: "/backups/schedules",
    SCHEDULE_DELETE: (id: string) => `/backups/schedules/${id}`,
    SCHEDULE_RUN_NOW: (id: string) => `/backups/schedules/${id}/run-now`,
    RESTORES_LIST: "/backups/restores",
  },
} as const;

/** Entra ID module API calls. */
export const ENTRA_ID_ROUTES = {
  APP_REGISTRATIONS: {
    GET_ALL: "/entra-id/app-registrations",
    GET_BY_ID: (id: string) => `/entra-id/app-registrations/${id}`,
    CREDENTIALS: (id: string) => `/entra-id/app-registrations/${id}/credentials`,
    PERMISSIONS: (id: string) => `/entra-id/app-registrations/${id}/permissions`,
    AUTHENTICATION: (id: string) => `/entra-id/app-registrations/${id}/authentication`,
    EXPOSED_API: (id: string) => `/entra-id/app-registrations/${id}/exposed-api`,
    ROLES_ADMINS: (id: string) => `/entra-id/app-registrations/${id}/roles-admins`,
  },
  ENTERPRISE_APPS: {
    GET_ALL: "/entra-id/enterprise-apps",
    GET_BY_ID: (id: string) => `/entra-id/enterprise-apps/${id}`,
    ACCESS: (id: string) => `/entra-id/enterprise-apps/${id}/access`,
    SSO: (id: string) => `/entra-id/enterprise-apps/${id}/sso`,
    PERMISSIONS: (id: string) => `/entra-id/enterprise-apps/${id}/permissions`,
    ACTIVITY: (id: string) => `/entra-id/enterprise-apps/${id}/activity`,
  },
  GROUPS: {
    GET_ALL: "/entra-id/groups",
    GET_DETAIL: (id: string) => `/entra-id/groups/${id}/detail`,
  },
  ENTRA_USERS: {
    GET_ALL: "/entra-id/users",
    GET_BY_ID: (id: string) => `/entra-id/users/${id}`,
    GROUPS: (id: string) => `/entra-id/users/${id}/groups`,
    APP_ASSIGNMENTS: (id: string) => `/entra-id/users/${id}/app-assignments`,
    OWNED_OBJECTS: (id: string) => `/entra-id/users/${id}/owned-objects`,
  },
  LICENSES: {
    GET_ALL: "/entra-id/licenses",
    GET_TIER: "/entra-id/licenses/tier",
    GET_USERS: "/entra-id/licenses/users",
    GET_USAGE: "/entra-id/licenses/usage",
    GET_COSTS: "/entra-id/licenses/costs",
    GET_USER_DETAIL: (userId: string) => `/entra-id/licenses/users/${userId}`,
    ASSIGN: "/entra-id/licenses/assign",
    REVOKE: "/entra-id/licenses/revoke",
  },
  SIGN_IN_LOGS: {
    GET_ALL: "/entra-id/sign-in-logs",
    EXPORT: "/entra-id/sign-in-logs/export",
  },
  MFA: {
    GET_ALL: "/entra-id/mfa",
    GET_BY_ID: (id: string) => `/entra-id/mfa/${id}`,
    POSTURE: "/entra-id/mfa/posture",
    POLICY: "/entra-id/mfa/policy",
  },
  SSPR: {
    GET_ALL: "/entra-id/sspr",
    GET_BY_ID: (id: string) => `/entra-id/sspr/${id}`,
    CONFIG: "/entra-id/sspr/config",
    USAGE: "/entra-id/sspr/usage",
  },
  CONDITIONAL_ACCESS: {
    GET_ALL: "/entra-id/conditional-access",
    GET_BY_ID: (id: string) => `/entra-id/conditional-access/${id}`,
    CONDITIONS: (id: string) => `/entra-id/conditional-access/${id}/conditions`,
    CONTROLS: (id: string) => `/entra-id/conditional-access/${id}/controls`,
    COVERAGE: (id: string) => `/entra-id/conditional-access/${id}/coverage`,
    ACTIVITY: (id: string) => `/entra-id/conditional-access/${id}/activity`,
    COMPARE: "/entra-id/conditional-access/compare",
  },
  CONDITIONAL_ACCESS_BACKUPS: {
    LIST: "/entra-id/conditional-access-backups",
    CREATE: "/entra-id/conditional-access-backups",
    DIFF: "/entra-id/conditional-access-backups/diff",
    GET_BY_ID: (id: string) => `/entra-id/conditional-access-backups/${id}`,
    RESTORE: (id: string) => `/entra-id/conditional-access-backups/${id}/restore`,
    DELETE: (id: string) => `/entra-id/conditional-access-backups/${id}`,
  },
  PIM: {
    POSTURE: "/entra-id/pim/posture",
    PRINCIPAL: (id: string) => `/entra-id/pim/principals/${id}`,
    COMPARE: "/entra-id/pim/compare",
  },
  IDENTITY_PROTECTION: {
    QUEUE: "/entra-id/identity-protection/queue",
    USER: (id: string) => `/entra-id/identity-protection/users/${id}`,
    COMPARE: "/entra-id/identity-protection/compare",
  },
  ACCESS_REVIEWS: {
    CATALOG: "/entra-id/access-reviews/catalog",
    CAMPAIGN: (id: string) => `/entra-id/access-reviews/${id}`,
    COMPARE: "/entra-id/access-reviews/compare",
  },
  ENTITLEMENT_MANAGEMENT: {
    CATALOG: "/entra-id/entitlement-management/catalog",
    PACKAGE: (id: string) => `/entra-id/entitlement-management/${id}`,
    COMPARE: "/entra-id/entitlement-management/compare",
  },
  CSA: {
    ATTRIBUTES: "/entra-id/csa/attributes",
    USERS: "/entra-id/csa/users",
    SERVICE_PRINCIPALS: "/entra-id/csa/service-principals",
    BULK: "/entra-id/csa/bulk",
    ASSIGN_ATTRIBUTE: (userId: string) => `/entra-id/csa/users/${userId}`,
    REMOVE_ATTRIBUTE: (userId: string, setId: string, name: string) => `/entra-id/csa/users/${userId}/attributes/${setId}/${name}`,
    ASSIGN_SP_ATTRIBUTE: (spId: string) => `/entra-id/csa/service-principals/${spId}`,
    REMOVE_SP_ATTRIBUTE: (spId: string, setId: string, name: string) => `/entra-id/csa/service-principals/${spId}/attributes/${setId}/${name}`,
  },
} as const;

/** Purview module API calls. */
export const PURVIEW_ROUTES = {
  CATALOG: {
    CONNECTORS: "/purview/catalog/connectors",
    CONNECTOR_DETAIL: (name: string) => `/purview/catalog/connectors/${encodeURIComponent(name)}`,
    STATS: "/purview/catalog/stats",
    ASSETS: "/purview/catalog/assets",
    ASSET: (guid: string) => `/purview/catalog/assets/${guid}`,
    CLASSIFICATION_TYPES: "/purview/catalog/classification-types",
    CLASSIFICATION_USAGE: "/purview/catalog/classification-usage",
  },
  DATA_MAP: {
    COLLECTIONS: "/purview/data-map/collections",
    SCAN_RULE_SETS: "/purview/data-map/scan-rule-sets",
  },
  SCAN_STATUSES: "/purview/scan-statuses",
  SENSITIVITY_LABELS: "/purview/sensitivity-labels",
  DLP: "/purview/dlp",
  INTEGRATIONS_HEALTH: "/purview/integrations/health",
} as const;

/**
 * Flat, backward-compatible surface — existing call sites use
 * `API_ROUTES.BACKUPS.LIST` etc. New code should prefer the module-scoped
 * consts above directly.
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  PLATFORM: PLATFORM_ROUTES,
  TENANTS: TENANT_ROUTES,
  MODULE_CONSENT: MODULE_CONSENT_ROUTES,
  INVITATIONS: INVITATION_ROUTES,
  DEV: DEV_ROUTES,
  BILLING: BILLING_ROUTES,
  SUPPORT: SUPPORT_ROUTES,
  AUDIT_LOGS: AUDIT_LOG_ROUTES,
  DATAVERSE_LOGS: DATAVERSE_LOGS_ROUTES,
  ...POWER_PLATFORM_ROUTES,
  ...PURVIEW_ROUTES,
  ...ENTRA_ID_ROUTES,
} as const;
