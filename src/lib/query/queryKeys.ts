/**
 * Central query-key factory. Extend with other modules' keys as they get ported.
 */
export const queryKeys = {
  environments: {
    all: (state?: string) => ['environments', state ?? ''] as const,
  },
  environmentGroups: {
    all: (trigger?: number) => ['environment-groups', trigger ?? 0] as const,
    withEnvironments: (trigger?: number) => ['environment-groups-with-environments', trigger ?? 0] as const,
    byId: (id: string) => ['environment-groups', id] as const,
  },
  businessUnits: {
    byEnv: (envUrl: string, trigger?: number) => ['business-units', envUrl, trigger ?? 0] as const,
  },
  teams: {
    all: (env?: string, trigger?: number) => ['teams', env ?? '', trigger ?? 0] as const,
  },
  users: {
    all: (env?: string, trigger?: number) => ['pp-users', env ?? '', trigger ?? 0] as const,
  },
  roles: {
    byEnv: (envUrl: string) => ['roles', envUrl] as const,
  },
  ppDelegations: {
    byEnv: (envUrl: string, status?: string) => ['pp-delegations', envUrl, status ?? 'all'] as const,
  },
  ppGovernance: {
    dlpPolicies: () => ['pp-dlp-policies'] as const,
    dlpPolicyDetail: (policyName: string) => ['pp-dlp-policy-detail', policyName] as const,
    connectors: () => ['pp-dlp-connectors'] as const,
    auditActivity: (category?: string) => ['pp-audit-activity', category ?? 'all'] as const,
  },
  compliance: {
    overview: () => ['compliance-overview'] as const,
    report: (environmentId: string) => ['compliance-report', environmentId] as const,
    history: (environmentId: string, page: number) => ['compliance-history', environmentId, page] as const,
  },
  resourceSummary: {
    all: () => ['resource-summary'] as const,
  },
  backups: {
    byEnv: (environmentId: string) => ['backups', environmentId] as const,
    schedules: (environmentId: string) => ['backups', 'schedules', environmentId] as const,
    detail: (bapBackupId: string) => ['backups', 'detail', bapBackupId] as const,
    restores: (environmentId: string) => ['backups', 'restores', environmentId] as const,
  },
  importTables: {
    list: (environmentUrl: string) => ['import-tables', environmentUrl] as const,
  },
  importJobs: {
    list: () => ['import-jobs'] as const,
  },
  purviewDataMap: {
    connectors: (status?: string, sourceType?: string) => ['purview-connectors', status ?? 'all', sourceType ?? 'all'] as const,
    connectorDetail: (name: string) => ['purview-connector-detail', name] as const,
    collections: () => ['purview-data-map-collections'] as const,
    scanRuleSets: () => ['purview-scan-rule-sets'] as const,
    scanStatuses: () => ['purview-scan-statuses'] as const,
    catalogStats: () => ['purview-catalog-stats'] as const,
  },
  purviewCatalog: {
    assets: (type?: string, source?: string) => ['purview-catalog-assets', type ?? 'all', source ?? 'all'] as const,
    asset: (guid: string) => ['purview-catalog-asset', guid] as const,
    classificationTypes: (category?: string) => ['purview-classification-types', category ?? 'all'] as const,
    classificationUsage: (name: string) => ['purview-classification-usage', name] as const,
  },
  purviewSensitivity: {
    labels: () => ['purview-sensitivity-labels'] as const,
  },
  purviewGovernance: {
    activity: () => ['purview-governance-activity'] as const,
  },
  purviewDlp: {
    alerts: () => ['purview-dlp-alerts'] as const,
  },
  purviewCost: {
    summary: (month?: string) => ['purview-cost-summary', month ?? 'current'] as const,
    metrics: () => ['purview-cost-metrics'] as const,
    vCoreUsage: (month?: string) => ['purview-cost-vcore-usage', month ?? 'current'] as const,
    scanHistory: (status?: string, dataSource?: string) => ['purview-cost-scan-history', status ?? 'all', dataSource ?? 'all'] as const,
  },
  purviewIntegrations: {
    health: () => ['purview-integrations-health'] as const,
  },
  appRegistrations: {
    catalog: () => ['app-registrations-catalog'] as const,
    overview: (id: string) => ['app-registrations-overview', id] as const,
    credentials: (id: string) => ['app-registrations-credentials', id] as const,
    permissions: (id: string) => ['app-registrations-permissions', id] as const,
    authentication: (id: string) => ['app-registrations-authentication', id] as const,
    exposedApi: (id: string) => ['app-registrations-exposed-api', id] as const,
    rolesAdmins: (id: string) => ['app-registrations-roles-admins', id] as const,
  },
  enterpriseApps: {
    catalog: () => ['enterprise-apps-catalog'] as const,
    overview: (id: string) => ['enterprise-apps-overview', id] as const,
    access: (id: string) => ['enterprise-apps-access', id] as const,
    sso: (id: string) => ['enterprise-apps-sso', id] as const,
    permissions: (id: string) => ['enterprise-apps-permissions', id] as const,
    activity: (id: string, appId: string) => ['enterprise-apps-activity', id, appId] as const,
  },
  groups: {
    list: () => ['entra-groups-list'] as const,
    detail: (id: string) => ['entra-groups-detail', id] as const,
  },
  entraUsers: {
    list: () => ['entra-users-list'] as const,
    byId: (id: string) => ['entra-users-by-id', id] as const,
    groups: (id: string) => ['entra-users-groups', id] as const,
    appAssignments: (id: string) => ['entra-users-app-assignments', id] as const,
    ownedObjects: (id: string) => ['entra-users-owned-objects', id] as const,
  },
  licenses: {
    list: () => ['entra-licenses-list'] as const,
    users: () => ['entra-licenses-users'] as const,
    usage: () => ['entra-licenses-usage'] as const,
    costs: () => ['entra-licenses-costs'] as const,
    userDetail: (userId: string) => ['entra-licenses-user-detail', userId] as const,
    tier: () => ['entra-licenses-tier'] as const,
  },
  signInLogs: {
    list: (filtersKey: string) => ['sign-in-logs', filtersKey] as const,
  },
  mfa: {
    catalog: () => ['mfa-catalog'] as const,
    userDetail: (id: string) => ['mfa-user-detail', id] as const,
    posture: () => ['mfa-posture'] as const,
    policy: () => ['mfa-policy'] as const,
  },
  sspr: {
    catalog: () => ['sspr-catalog'] as const,
    userDetail: (id: string) => ['sspr-user-detail', id] as const,
    config: () => ['sspr-config'] as const,
    usage: () => ['sspr-usage'] as const,
  },
  conditionalAccess: {
    catalog: () => ['conditional-access-catalog'] as const,
    detail: (id: string, tab: string) => ['conditional-access-detail', id, tab] as const,
  },
  caBackups: {
    list: () => ['ca-backups-list'] as const,
    diff: (from: string, to: string) => ['ca-backups-diff', from, to] as const,
  },
  pim: {
    posture: () => ['pim-posture'] as const,
    principal: (id: string) => ['pim-principal', id] as const,
  },
  identityProtection: {
    queue: () => ['identity-protection-queue'] as const,
    user: (id: string) => ['identity-protection-user', id] as const,
  },
  accessReviews: {
    catalog: () => ['access-reviews-catalog'] as const,
    campaign: (id: string) => ['access-reviews-campaign', id] as const,
  },
  entitlementManagement: {
    catalog: () => ['entitlement-management-catalog'] as const,
    package: (id: string) => ['entitlement-management-package', id] as const,
  },
  csa: {
    attributes: () => ['csa-attributes'] as const,
    users: () => ['csa-users'] as const,
    servicePrincipals: () => ['csa-service-principals'] as const,
  },
};
