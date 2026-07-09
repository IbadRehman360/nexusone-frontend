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
};
