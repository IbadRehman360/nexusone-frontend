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
} as const;

/** Invitations — pending invites into a tenant. */
export const INVITATION_ROUTES = {
  LIST: "/invitations",
  CREATE: "/invitations",
  RESEND: (id: string) => `/invitations/${id}/resend`,
  REVOKE: (id: string) => `/invitations/${id}`,
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
  RETRY_INVOICE: "/billing/retry-invoice",
  INVOICES: "/billing/invoices",
  PAYMENT_METHODS: "/billing/payment-methods",
  PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,
  SEATS: "/billing/seats",
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

// TODO: ENTRA_ID_ROUTES — add here once the Entra ID module is ported, then spread below.
// TODO: DATA_PROTECTION_ROUTES — add here once the Data Protection module is ported, then spread below.

/**
 * Flat, backward-compatible surface — existing call sites use
 * `API_ROUTES.BACKUPS.LIST` etc. New code should prefer the module-scoped
 * consts above directly.
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  PLATFORM: PLATFORM_ROUTES,
  TENANTS: TENANT_ROUTES,
  INVITATIONS: INVITATION_ROUTES,
  BILLING: BILLING_ROUTES,
  SUPPORT: SUPPORT_ROUTES,
  ...POWER_PLATFORM_ROUTES,
} as const;
