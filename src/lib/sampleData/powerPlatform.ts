/**
 * Curated sample data for the Power Platform module's look-around window.
 * Shown when `useModulePhase('pp').locked` is true — shapes MUST match the
 * real hooks'/services' return types exactly (`useEnvironments`,
 * `useEnvironmentGroups`, `useResourceSummary`, `useComplianceOverview`,
 * `usePpDlpPolicies`, `useImportJobs`, `useBusinessUnits`, `useTeams`,
 * `useBackups`, `usePPDelegations`, `fetchAuditActivity`, `useUsers`,
 * `useRoles`, `useEnvironmentApps`/`Flows`/`Pages`/`Tables`/`D365Apps`,
 * `getLatestComplianceReport`, `getComplianceHistory`) so swapping the data
 * source never changes render code.
 */

import type {
  PowerPlatformEnvironment,
  EnvironmentGroupWithEnvironments,
  ResourceSummary,
  ComplianceOverview,
  ComplianceCheck,
  ComplianceReport,
  PpDlpPolicySummary,
  ImportJob,
  BusinessUnit,
  Team,
  UnifiedAuditActivity,
  EnrichedBackup,
  PPDelegation,
  PPUser,
  Role,
  PpDlpPolicyDetail,
  RestoreRun,
  BackupSchedule,
} from "@/src/types/powerPlatform";
import type { PowerApp, PowerFlow, PowerPage, DataverseTable, D365App } from "@/src/types/powerPlatformResources";

export const SAMPLE_PP_ENVIRONMENTS: PowerPlatformEnvironment[] = [
  {
    environmentId: "sample-env-prod",
    environmentName: "contoso-production",
    environmentDisplayName: "Contoso Production",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    displayName: "Contoso Production",
    type: "Production",
    region: "unitedstates",
    state: "Ready",
    hasDataverse: true,
  },
  {
    environmentId: "sample-env-fin",
    environmentName: "contoso-finance",
    environmentDisplayName: "Finance & Operations",
    environmentUrl: "https://contoso-finance.crm.dynamics.com",
    displayName: "Finance & Operations",
    type: "Production",
    region: "unitedstates",
    state: "Ready",
    hasDataverse: true,
  },
  {
    environmentId: "sample-env-hr",
    environmentName: "contoso-hr-sandbox",
    environmentDisplayName: "HR Sandbox",
    environmentUrl: "https://contoso-hr-sandbox.crm.dynamics.com",
    displayName: "HR Sandbox",
    type: "Sandbox",
    region: "europe",
    state: "Ready",
    hasDataverse: true,
  },
  {
    environmentId: "sample-env-dev",
    environmentName: "contoso-dev",
    environmentDisplayName: "Developer Playground",
    environmentUrl: "https://contoso-dev.crm.dynamics.com",
    displayName: "Developer Playground",
    type: "Developer",
    region: "unitedstates",
    state: "Ready",
    hasDataverse: false,
  },
  {
    environmentId: "sample-env-trial",
    environmentName: "contoso-marketing-trial",
    environmentDisplayName: "Marketing Trial",
    environmentUrl: "https://contoso-marketing-trial.crm.dynamics.com",
    displayName: "Marketing Trial",
    type: "Trial",
    region: "europe",
    state: "Provisioning",
    hasDataverse: false,
  },
];

export const SAMPLE_PP_ENVIRONMENT_GROUPS: EnvironmentGroupWithEnvironments[] = [
  {
    id: "sample-group-prod",
    displayName: "Production Environments",
    description: "Customer-facing production workloads.",
    createdAt: "2025-11-03T09:15:00.000Z",
    updatedAt: "2026-04-18T14:02:00.000Z",
    environments: [
      { environmentId: "sample-env-prod", environmentName: "contoso-production", environmentUrl: "https://contoso-production.crm.dynamics.com" },
      { environmentId: "sample-env-fin", environmentName: "contoso-finance", environmentUrl: "https://contoso-finance.crm.dynamics.com" },
    ],
  },
  {
    id: "sample-group-nonprod",
    displayName: "Non-Production",
    description: "Sandbox, developer, and trial environments used for testing.",
    createdAt: "2025-12-11T11:30:00.000Z",
    updatedAt: "2026-05-02T08:47:00.000Z",
    environments: [
      { environmentId: "sample-env-hr", environmentName: "contoso-hr-sandbox", environmentUrl: "https://contoso-hr-sandbox.crm.dynamics.com" },
      { environmentId: "sample-env-dev", environmentName: "contoso-dev", environmentUrl: "https://contoso-dev.crm.dynamics.com" },
      { environmentId: "sample-env-trial", environmentName: "contoso-marketing-trial", environmentUrl: "https://contoso-marketing-trial.crm.dynamics.com" },
    ],
  },
];

export const SAMPLE_PP_RESOURCE_SUMMARY: ResourceSummary = {
  totals: {
    environments: 5,
    apps: 34,
    flows: 58,
    pages: 12,
  },
  byEnvironment: [
    { environmentId: "sample-env-prod", environmentName: "contoso-production", apps: 14, flows: 22, pages: 6 },
    { environmentId: "sample-env-fin", environmentName: "contoso-finance", apps: 9, flows: 17, pages: 4 },
    { environmentId: "sample-env-hr", environmentName: "contoso-hr-sandbox", apps: 6, flows: 11, pages: 2 },
    { environmentId: "sample-env-dev", environmentName: "contoso-dev", apps: 5, flows: 8, pages: 0 },
    { environmentId: "sample-env-trial", environmentName: "contoso-marketing-trial", apps: 0, flows: 0, pages: 0 },
  ],
};

export const SAMPLE_PP_COMPLIANCE_OVERVIEW: ComplianceOverview = {
  items: [
    { environmentId: "sample-env-prod", environmentName: "contoso-production", score: 96, status: "compliant", checkedAt: "2026-07-08T06:00:00.000Z" },
    { environmentId: "sample-env-fin", environmentName: "contoso-finance", score: 91, status: "compliant", checkedAt: "2026-07-08T06:00:00.000Z" },
    { environmentId: "sample-env-hr", environmentName: "contoso-hr-sandbox", score: 72, status: "at_risk", checkedAt: "2026-07-08T06:00:00.000Z" },
    { environmentId: "sample-env-dev", environmentName: "contoso-dev", score: 58, status: "non_compliant", checkedAt: "2026-07-07T06:00:00.000Z" },
    { environmentId: "sample-env-trial", environmentName: "contoso-marketing-trial", score: null, status: null, checkedAt: null },
  ],
  summary: {
    total: 5,
    compliant: 2,
    at_risk: 1,
    non_compliant: 1,
    no_report: 1,
  },
};

export const SAMPLE_PP_DLP_POLICIES: PpDlpPolicySummary[] = [
  {
    id: "sample-dlp-tenant-wide",
    name: "Tenant-wide Default Policy",
    isTenantWide: true,
    environmentType: "AllEnvironments",
    environments: [],
    connectorCounts: { business: 18, nonBusiness: 42, blocked: 6 },
    createdTime: "2025-10-02T08:00:00.000Z",
    lastModifiedTime: "2026-06-11T13:20:00.000Z",
  },
  {
    id: "sample-dlp-prod-only",
    name: "Production Lockdown",
    isTenantWide: false,
    environmentType: "OnlyEnvironments",
    environments: [
      { id: "sample-env-prod", name: "contoso-production" },
      { id: "sample-env-fin", name: "contoso-finance" },
    ],
    connectorCounts: { business: 12, nonBusiness: 8, blocked: 21 },
    createdTime: "2025-11-20T10:30:00.000Z",
    lastModifiedTime: "2026-05-27T09:45:00.000Z",
  },
  {
    id: "sample-dlp-sandbox",
    name: "Sandbox & Dev Baseline",
    isTenantWide: false,
    environmentType: "ExceptEnvironments",
    environments: [
      { id: "sample-env-hr", name: "contoso-hr-sandbox" },
      { id: "sample-env-dev", name: "contoso-dev" },
    ],
    connectorCounts: { business: 25, nonBusiness: 30, blocked: 3 },
    createdTime: "2026-01-14T15:10:00.000Z",
    lastModifiedTime: "2026-04-02T11:05:00.000Z",
  },
];

export const SAMPLE_PP_BUSINESS_UNITS: BusinessUnit[] = [
  {
    businessUnitId: "sample-bu-root",
    name: "Contoso",
    parentBusinessUnitId: null,
    children: [
      {
        businessUnitId: "sample-bu-sales",
        name: "Sales",
        parentBusinessUnitId: "sample-bu-root",
        children: [
          { businessUnitId: "sample-bu-sales-amer", name: "Sales - Americas", parentBusinessUnitId: "sample-bu-sales", children: [] },
          { businessUnitId: "sample-bu-sales-emea", name: "Sales - EMEA", parentBusinessUnitId: "sample-bu-sales", children: [] },
        ],
      },
      {
        businessUnitId: "sample-bu-finance",
        name: "Finance",
        parentBusinessUnitId: "sample-bu-root",
        children: [],
      },
      {
        businessUnitId: "sample-bu-it",
        name: "IT",
        parentBusinessUnitId: "sample-bu-root",
        children: [],
      },
    ],
  },
];

export const SAMPLE_PP_TEAMS: Team[] = [
  {
    teamId: "sample-team-sales",
    name: "Sales Team",
    businessUnitId: "sample-bu-sales",
    businessUnitName: "Sales",
    memberCount: 18,
    azureAdObjectId: "3f1a9c2e-7b4d-4e11-9c3a-1a2b3c4d5e6f",
    securityGroupName: "SG-Sales-Team",
  },
  {
    teamId: "sample-team-finance",
    name: "Finance Team",
    businessUnitId: "sample-bu-finance",
    businessUnitName: "Finance",
    memberCount: 9,
    azureAdObjectId: "8d2b6a1f-4c3e-4a19-8f2d-6b7c8d9e0f1a",
    securityGroupName: "SG-Finance-Team",
  },
  {
    teamId: "sample-team-it",
    name: "IT Support",
    businessUnitId: "sample-bu-it",
    businessUnitName: "IT",
    memberCount: 6,
    azureAdObjectId: "5e9f3c7a-1d2b-4c8e-9a3f-2b1c0d9e8f7a",
    securityGroupName: "SG-IT-Support",
  },
  {
    teamId: "sample-team-exec",
    name: "Executive Leadership",
    businessUnitId: "sample-bu-root",
    businessUnitName: "Contoso",
    memberCount: 5,
  },
];

export const SAMPLE_PP_IMPORT_JOBS: ImportJob[] = [
  {
    id: "sample-import-accounts",
    tenantId: "sample-tenant",
    userId: "sample-user-1",
    userEmail: "priya.shah@contoso.com",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    targetTable: "Account",
    fileName: "accounts_q2_2026.csv",
    totalRows: 1200,
    successRows: 1200,
    failedRows: 0,
    status: "COMPLETED",
    errorReport: null,
    createdAt: "2026-06-20T09:00:00.000Z",
    completedAt: "2026-06-20T09:04:12.000Z",
  },
  {
    id: "sample-import-contacts",
    tenantId: "sample-tenant",
    userId: "sample-user-2",
    userEmail: "daniel.kim@contoso.com",
    environmentUrl: "https://contoso-finance.crm.dynamics.com",
    targetTable: "Contact",
    fileName: "contacts_finance.csv",
    totalRows: 845,
    successRows: 812,
    failedRows: 33,
    status: "COMPLETED_WITH_ERRORS",
    errorReport: [
      { row: 58, message: "Missing required field 'emailaddress1'." },
      { row: 214, message: "Invalid phone number format." },
    ],
    createdAt: "2026-06-25T14:30:00.000Z",
    completedAt: "2026-06-25T14:36:47.000Z",
  },
  {
    id: "sample-import-leads",
    tenantId: "sample-tenant",
    userId: "sample-user-1",
    userEmail: "priya.shah@contoso.com",
    environmentUrl: "https://contoso-hr-sandbox.crm.dynamics.com",
    targetTable: "Lead",
    fileName: "leads_hr_sandbox.csv",
    totalRows: 300,
    successRows: 0,
    failedRows: 300,
    status: "FAILED",
    errorReport: [{ row: 1, message: "Target table schema mismatch." }],
    createdAt: "2026-07-01T11:15:00.000Z",
    completedAt: "2026-07-01T11:15:42.000Z",
  },
  {
    id: "sample-import-opportunities",
    tenantId: "sample-tenant",
    userId: "sample-user-3",
    userEmail: "olga.novak@contoso.com",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    targetTable: "Opportunity",
    fileName: "opportunities_july.csv",
    totalRows: 560,
    successRows: 410,
    failedRows: 0,
    status: "PROCESSING",
    errorReport: null,
    createdAt: "2026-07-10T16:45:00.000Z",
    completedAt: null,
  },
  {
    id: "sample-import-cases",
    tenantId: "sample-tenant",
    userId: "sample-user-2",
    userEmail: "daniel.kim@contoso.com",
    environmentUrl: "https://contoso-dev.crm.dynamics.com",
    targetTable: "Incident",
    fileName: "support_cases_backlog.csv",
    totalRows: 90,
    successRows: 0,
    failedRows: 0,
    status: "PENDING",
    errorReport: null,
    createdAt: "2026-07-11T08:05:00.000Z",
    completedAt: null,
  },
];

export const SAMPLE_PP_DLP_ACTIVITY: UnifiedAuditActivity[] = [
  {
    id: "sample-activity-dlp-update",
    timestamp: "2026-07-10T14:22:00.000Z",
    operation: "DlpPolicyUpdated",
    workload: "PowerPlatform",
    category: "DLP",
    user: "priya.shah@contoso.com",
    clientIp: "203.0.113.42",
    target: "Production Lockdown",
    resultStatus: "Success",
    policyName: "Production Lockdown",
  },
  {
    id: "sample-activity-connector-blocked",
    timestamp: "2026-07-09T09:47:00.000Z",
    operation: "ConnectorClassificationChanged",
    workload: "PowerAutomate",
    category: "DLP",
    user: "daniel.kim@contoso.com",
    clientIp: "198.51.100.17",
    target: "HTTP with Azure AD",
    resultStatus: "Success",
    policyName: "Tenant-wide Default Policy",
  },
  {
    id: "sample-activity-flow-run",
    timestamp: "2026-07-08T18:03:00.000Z",
    operation: "FlowRunBlockedByDlp",
    workload: "PowerAutomate",
    category: "DLP",
    user: "olga.novak@contoso.com",
    clientIp: "203.0.113.88",
    target: "Send data to third-party CRM",
    resultStatus: "Blocked",
    policyName: "Sandbox & Dev Baseline",
  },
  {
    id: "sample-activity-env-created",
    timestamp: "2026-07-06T11:15:00.000Z",
    operation: "EnvironmentCreated",
    workload: "PowerPlatform",
    category: "PowerPlatform",
    user: "priya.shah@contoso.com",
    clientIp: "203.0.113.42",
    target: "Marketing Trial",
    resultStatus: "Success",
    policyName: null,
  },
  {
    id: "sample-activity-dataverse-export",
    timestamp: "2026-07-05T15:40:00.000Z",
    operation: "BulkDataExport",
    workload: "Dataverse",
    category: "Dataverse",
    user: "daniel.kim@contoso.com",
    clientIp: "198.51.100.17",
    target: "contoso-finance.crm.dynamics.com",
    resultStatus: "Success",
    policyName: null,
  },
  {
    id: "sample-activity-compliance-alert",
    timestamp: "2026-07-03T07:12:00.000Z",
    operation: "ComplianceScoreDropped",
    workload: "SecurityCompliance",
    category: "SecurityCompliance",
    user: "system@contoso.com",
    clientIp: null,
    target: "contoso-dev",
    resultStatus: "Warning",
    policyName: null,
  },
];

export const SAMPLE_PP_BACKUPS: EnrichedBackup[] = [
  {
    bapBackupId: "sample-backup-nightly-1",
    backupType: "Scheduled",
    backupRequestDateTime: "2026-07-10T02:00:00.000Z",
    notes: "Nightly scheduled backup",
    bapStatus: "Succeeded",
    triggeredBy: "scheduler",
    createdAt: "2026-07-10T02:00:00.000Z",
  },
  {
    bapBackupId: "sample-backup-preupgrade",
    backupType: "Manual",
    backupRequestDateTime: "2026-07-08T16:45:00.000Z",
    notes: "Pre-upgrade snapshot before Q3 release",
    bapStatus: "Succeeded",
    triggeredBy: "priya.shah@contoso.com",
    createdAt: "2026-07-08T16:45:00.000Z",
  },
  {
    bapBackupId: "sample-backup-nightly-2",
    backupType: "Scheduled",
    backupRequestDateTime: "2026-07-09T02:00:00.000Z",
    notes: "Nightly scheduled backup",
    bapStatus: "Pending",
    runId: "sample-run-1",
    triggeredBy: "scheduler",
    createdAt: "2026-07-09T02:00:00.000Z",
  },
  {
    bapBackupId: "sample-backup-dlp-rollout",
    backupType: "Manual",
    backupRequestDateTime: "2026-07-05T11:10:00.000Z",
    notes: "Before DLP policy rollout",
    bapStatus: "Failed",
    triggeredBy: "daniel.kim@contoso.com",
    createdAt: "2026-07-05T11:10:00.000Z",
  },
  {
    bapBackupId: "sample-backup-weekly",
    backupType: "Scheduled",
    backupRequestDateTime: "2026-06-28T09:30:00.000Z",
    notes: "Weekly compliance backup",
    bapStatus: "Succeeded",
    triggeredBy: undefined,
    createdAt: "2026-06-28T09:30:00.000Z",
  },
];

export const SAMPLE_PP_DELEGATIONS: PPDelegation[] = [
  {
    id: "sample-delegation-active",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    environmentName: "Contoso Production",
    delegatorId: "sample-user-1",
    delegatorName: "Priya Shah",
    delegatorEmail: "priya.shah@contoso.com",
    delegateeId: "sample-user-4",
    delegateeName: "Marcus Webb",
    delegateeEmail: "marcus.webb@contoso.com",
    delegatedRoleIds: ["role-sales-manager"],
    delegatedRoleNames: ["Sales Manager"],
    originalRoleIds: ["role-sales-rep"],
    reason: "Covering maternity leave for the Sales Manager role.",
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-08-15T00:00:00.000Z",
    status: "active",
    createdAt: "2026-06-28T10:00:00.000Z",
    createdBy: "priya.shah@contoso.com",
  },
  {
    id: "sample-delegation-pending",
    environmentUrl: "https://contoso-finance.crm.dynamics.com",
    environmentName: "Finance & Operations",
    delegatorId: "sample-user-2",
    delegatorName: "Daniel Kim",
    delegatorEmail: "daniel.kim@contoso.com",
    delegateeId: "sample-user-5",
    delegateeName: "Sofia Alvarez",
    delegateeEmail: "sofia.alvarez@contoso.com",
    delegatedRoleIds: ["role-finance-approver"],
    delegatedRoleNames: ["Finance Approver"],
    originalRoleIds: ["role-finance-analyst"],
    reason: "Approving month-end close while on business travel.",
    startDate: "2026-07-20T00:00:00.000Z",
    endDate: "2026-07-27T00:00:00.000Z",
    status: "pending",
    createdAt: "2026-07-10T13:20:00.000Z",
    createdBy: "daniel.kim@contoso.com",
  },
  {
    id: "sample-delegation-expired",
    environmentUrl: "https://contoso-hr-sandbox.crm.dynamics.com",
    environmentName: "HR Sandbox",
    delegatorId: "sample-user-3",
    delegatorName: "Olga Novak",
    delegatorEmail: "olga.novak@contoso.com",
    delegateeId: "sample-user-6",
    delegateeName: "James Park",
    delegateeEmail: "james.park@contoso.com",
    delegatedRoleIds: ["role-hr-admin"],
    delegatedRoleNames: ["HR Administrator"],
    originalRoleIds: ["role-hr-generalist"],
    reason: "Onboarding backlog during recruiter interviews.",
    startDate: "2026-05-01T00:00:00.000Z",
    endDate: "2026-05-31T00:00:00.000Z",
    status: "expired",
    createdAt: "2026-04-28T09:15:00.000Z",
    createdBy: "olga.novak@contoso.com",
  },
  {
    id: "sample-delegation-revoked",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    environmentName: "Contoso Production",
    delegatorId: "sample-user-1",
    delegatorName: "Priya Shah",
    delegatorEmail: "priya.shah@contoso.com",
    delegateeId: "sample-user-7",
    delegateeName: "Wei Zhang",
    delegateeEmail: "wei.zhang@contoso.com",
    delegatedRoleIds: ["role-sales-manager"],
    delegatedRoleNames: ["Sales Manager"],
    originalRoleIds: ["role-sales-rep"],
    reason: "Temporary coverage during system migration.",
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-06-30T00:00:00.000Z",
    status: "revoked",
    createdAt: "2026-05-29T08:40:00.000Z",
    createdBy: "priya.shah@contoso.com",
  },
];

export const SAMPLE_PP_USERS: PPUser[] = [
  {
    userId: "sample-ppuser-priya",
    fullName: "Priya Shah",
    email: "priya.shah@contoso.com",
    businessUnitId: "sample-bu-sales",
    businessUnitName: "Sales",
    roles: [
      { roleId: "Sales Manager", roleName: "Sales Manager" },
      { roleId: "Basic User", roleName: "Basic User" },
    ],
    enabled: true,
  },
  {
    userId: "sample-ppuser-daniel",
    fullName: "Daniel Kim",
    email: "daniel.kim@contoso.com",
    businessUnitId: "sample-bu-finance",
    businessUnitName: "Finance",
    roles: [
      { roleId: "Finance Approver", roleName: "Finance Approver" },
      { roleId: "Basic User", roleName: "Basic User" },
    ],
    enabled: true,
  },
  {
    userId: "sample-ppuser-olga",
    fullName: "Olga Novak",
    email: "olga.novak@contoso.com",
    businessUnitId: "sample-bu-it",
    businessUnitName: "IT",
    roles: [
      { roleId: "IT Administrator", roleName: "IT Administrator" },
      { roleId: "Basic User", roleName: "Basic User" },
    ],
    enabled: true,
  },
  {
    userId: "sample-ppuser-marcus",
    fullName: "Marcus Webb",
    email: "marcus.webb@contoso.com",
    businessUnitId: "sample-bu-root",
    businessUnitName: "Contoso",
    roles: [
      { roleId: "System Administrator", roleName: "System Administrator" },
      { roleId: "Environment Maker", roleName: "Environment Maker" },
      { roleId: "Basic User", roleName: "Basic User" },
    ],
    enabled: true,
  },
  {
    userId: "sample-ppuser-sofia",
    fullName: "Sofia Alvarez",
    email: "sofia.alvarez@contoso.com",
    businessUnitId: "sample-bu-sales",
    businessUnitName: "Sales",
    roles: [{ roleId: "Basic User", roleName: "Basic User" }],
    enabled: false,
  },
  {
    userId: "sample-ppuser-james",
    fullName: "James Park",
    email: "james.park@contoso.com",
    businessUnitId: "sample-bu-it",
    businessUnitName: "IT",
    roles: [{ roleId: "Basic User", roleName: "Basic User" }],
    enabled: true,
  },
];

export const SAMPLE_PP_SECURITY_ROLES: Role[] = [
  { roleId: "sample-role-sysadmin-root", roleName: "System Administrator", businessUnitId: "sample-bu-root", businessUnitName: "Contoso" },
  { roleId: "sample-role-basicuser-root", roleName: "Basic User", businessUnitId: "sample-bu-root", businessUnitName: "Contoso" },
  { roleId: "sample-role-basicuser-sales", roleName: "Basic User", businessUnitId: "sample-bu-sales", businessUnitName: "Sales" },
  { roleId: "sample-role-basicuser-finance", roleName: "Basic User", businessUnitId: "sample-bu-finance", businessUnitName: "Finance" },
  { roleId: "sample-role-basicuser-it", roleName: "Basic User", businessUnitId: "sample-bu-it", businessUnitName: "IT" },
  { roleId: "sample-role-salesmanager-sales", roleName: "Sales Manager", businessUnitId: "sample-bu-sales", businessUnitName: "Sales" },
  { roleId: "sample-role-envmaker-root", roleName: "Environment Maker", businessUnitId: "sample-bu-root", businessUnitName: "Contoso" },
  { roleId: "sample-role-financeapprover-finance", roleName: "Finance Approver", businessUnitId: "sample-bu-finance", businessUnitName: "Finance" },
  { roleId: "sample-role-itadmin-it", roleName: "IT Administrator", businessUnitId: "sample-bu-it", businessUnitName: "IT" },
];

// --- Resources page (Power Apps / Flows / Pages / D365 Apps / Tables tabs) ---

export const SAMPLE_PP_APPS: PowerApp[] = [
  {
    id: "sample-app-onboarding",
    name: "sample-app-onboarding",
    type: "Microsoft.PowerApps/apps",
    properties: {
      displayName: "Customer Onboarding Tracker",
      description: "Tracks new customer onboarding tasks and document collection.",
      appOpenUri: "https://apps.powerapps.com/play/sample-app-onboarding",
      appType: "Canvas",
      createdTime: "2025-09-12T10:00:00.000Z",
      lastModifiedTime: "2026-07-02T15:40:00.000Z",
      owner: { id: "sample-ppuser-priya", displayName: "Priya Shah", email: "priya.shah@contoso.com", type: "User" },
      sharedUsersCount: 24,
      sharedGroupsCount: 3,
    },
  },
  {
    id: "sample-app-field-inspection",
    name: "sample-app-field-inspection",
    type: "Microsoft.PowerApps/apps",
    properties: {
      displayName: "Field Service Inspection",
      description: "Model-driven app for technicians logging on-site inspections.",
      appOpenUri: "https://apps.powerapps.com/play/sample-app-field-inspection",
      appType: "ModelDriven",
      createdTime: "2025-11-04T09:20:00.000Z",
      lastModifiedTime: "2026-06-18T11:05:00.000Z",
      owner: { id: "sample-ppuser-daniel", displayName: "Daniel Kim", email: "daniel.kim@contoso.com", type: "User" },
      sharedUsersCount: 12,
      sharedGroupsCount: 1,
    },
  },
  {
    id: "sample-app-expense-approval",
    name: "sample-app-expense-approval",
    type: "Microsoft.PowerApps/apps",
    properties: {
      displayName: "Expense Approval",
      description: "Employee expense submission and manager approval workflow.",
      appOpenUri: "https://apps.powerapps.com/play/sample-app-expense-approval",
      appType: "Canvas",
      createdTime: "2025-08-21T13:15:00.000Z",
      lastModifiedTime: "2026-07-08T08:22:00.000Z",
      owner: { id: "sample-ppuser-olga", displayName: "Olga Novak", email: "olga.novak@contoso.com", type: "User" },
      sharedUsersCount: 40,
      sharedGroupsCount: 2,
    },
  },
  {
    id: "sample-app-it-asset-request",
    name: "sample-app-it-asset-request",
    type: "Microsoft.PowerApps/apps",
    properties: {
      displayName: "IT Asset Request Portal",
      description: "Self-service portal for requesting hardware and software.",
      appOpenUri: "https://apps.powerapps.com/play/sample-app-it-asset-request",
      appType: "Canvas",
      createdTime: "2026-01-15T10:30:00.000Z",
      lastModifiedTime: "2026-05-30T16:00:00.000Z",
      owner: { id: "sample-ppuser-priya", displayName: "Priya Shah", email: "priya.shah@contoso.com", type: "User" },
      sharedUsersCount: 18,
      sharedGroupsCount: 0,
    },
  },
  {
    id: "sample-app-sales-dashboard",
    name: "sample-app-sales-dashboard",
    type: "Microsoft.PowerApps/apps",
    properties: {
      displayName: "Sales Pipeline Dashboard",
      description: "Model-driven dashboard summarizing opportunities by stage and region.",
      appOpenUri: "https://apps.powerapps.com/play/sample-app-sales-dashboard",
      appType: "ModelDriven",
      createdTime: "2025-10-30T14:45:00.000Z",
      lastModifiedTime: "2026-06-25T09:50:00.000Z",
      owner: { id: "sample-ppuser-daniel", displayName: "Daniel Kim", email: "daniel.kim@contoso.com", type: "User" },
      sharedUsersCount: 30,
      sharedGroupsCount: 4,
    },
  },
];

/** Real environments often have zero flows — an empty tab is a realistic result, not a placeholder gap. */
export const SAMPLE_PP_FLOWS: PowerFlow[] = [
  {
    id: "sample-flow-onboarding-notify",
    name: "sample-flow-onboarding-notify",
    properties: {
      displayName: "New Employee Onboarding Notification",
      description: "Notifies IT and Facilities when a new hire record is created.",
      state: "Started",
      createdTime: "2025-09-14T08:00:00.000Z",
      lastModifiedTime: "2026-06-11T10:15:00.000Z",
    },
  },
  {
    id: "sample-flow-expense-routing",
    name: "sample-flow-expense-routing",
    properties: {
      displayName: "Expense Approval Routing",
      description: "Routes expense submissions to the requester's manager for approval.",
      state: "Started",
      createdTime: "2025-08-22T09:30:00.000Z",
      lastModifiedTime: "2026-07-08T08:25:00.000Z",
    },
  },
  {
    id: "sample-flow-weekly-sales-report",
    name: "sample-flow-weekly-sales-report",
    properties: {
      displayName: "Weekly Sales Report Email",
      description: "Emails a pipeline summary to sales leadership every Monday morning.",
      state: "Started",
      createdTime: "2025-12-01T07:00:00.000Z",
      lastModifiedTime: "2026-04-14T07:00:00.000Z",
    },
  },
  {
    id: "sample-flow-stale-lead-cleanup",
    name: "sample-flow-stale-lead-cleanup",
    properties: {
      displayName: "Stale Lead Cleanup",
      description: "Flags leads with no activity in 90 days for review.",
      state: "Stopped",
      createdTime: "2026-02-10T12:00:00.000Z",
      lastModifiedTime: "2026-03-01T09:10:00.000Z",
    },
  },
];

export const SAMPLE_PP_PAGES: PowerPage[] = [
  {
    id: "sample-page-partner-portal",
    name: "sample-page-partner-portal",
    properties: {
      displayName: "Contoso Partner Portal",
      description: "External-facing portal for reseller partners to view deal registrations.",
      websiteUrl: "https://contoso-partners.powerappsportals.com",
      createdTime: "2025-10-05T09:00:00.000Z",
      lastModifiedTime: "2026-06-20T13:30:00.000Z",
      status: "Launched",
    },
  },
  {
    id: "sample-page-self-service-hub",
    name: "sample-page-self-service-hub",
    properties: {
      displayName: "Customer Self-Service Hub",
      description: "Knowledge base and case submission site for end customers.",
      websiteUrl: "https://contoso-support.powerappsportals.com",
      createdTime: "2026-03-18T11:20:00.000Z",
      lastModifiedTime: "2026-05-27T10:05:00.000Z",
      status: "Under Construction",
    },
  },
];

export const SAMPLE_PP_D365_APPS: D365App[] = [
  {
    id: "sample-d365-sales",
    name: "Dynamics 365 Sales",
    uniqueName: "msdyn_Sales",
    description: "Core Dynamics 365 Sales application.",
    appOpenUri: "https://contoso-production.crm.dynamics.com/main.aspx?appid=sample-d365-sales",
    appType: "D365",
    status: "Installed",
    publisher: "Microsoft Corporation",
  },
  {
    id: "sample-d365-customer-service",
    name: "Dynamics 365 Customer Service",
    uniqueName: "msdyn_CustomerService",
    description: "Core Dynamics 365 Customer Service application.",
    appOpenUri: "https://contoso-production.crm.dynamics.com/main.aspx?appid=sample-d365-customer-service",
    appType: "D365",
    status: "Installed",
    publisher: "Microsoft Corporation",
  },
  {
    id: "sample-d365-field-service-ext",
    name: "Contoso Field Service Extensions",
    uniqueName: "contoso_FieldServiceExt",
    description: "Custom extensions layered on top of Field Service for inspection workflows.",
    appOpenUri: "https://contoso-production.crm.dynamics.com/main.aspx?appid=sample-d365-field-service-ext",
    appType: "D365",
    status: "Installed",
    publisher: "Contoso IT",
  },
];

/**
 * A realistic subset of common Dataverse tables (system + a couple of
 * custom ones) — not an attempt to fake the hundreds of tables a real
 * environment has, per the plan's guidance.
 */
export const SAMPLE_PP_TABLES: DataverseTable[] = [
  { logicalName: "account", displayName: "Account", entitySetName: "accounts", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "contact", displayName: "Contact", entitySetName: "contacts", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "businessunit", displayName: "Business Unit", entitySetName: "businessunits", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "team", displayName: "Team", entitySetName: "teams", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "systemuser", displayName: "User", entitySetName: "systemusers", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "opportunity", displayName: "Opportunity", entitySetName: "opportunities", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "lead", displayName: "Lead", entitySetName: "leads", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "incident", displayName: "Case", entitySetName: "incidents", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "activitypointer", displayName: "Activity", entitySetName: "activitypointers", tableType: "Activity", isCustomEntity: false, isManaged: true },
  { logicalName: "email", displayName: "Email", entitySetName: "emails", tableType: "Activity", isCustomEntity: false, isManaged: true },
  { logicalName: "task", displayName: "Task", entitySetName: "tasks", tableType: "Activity", isCustomEntity: false, isManaged: true },
  { logicalName: "product", displayName: "Product", entitySetName: "products", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "pricelevel", displayName: "Price List", entitySetName: "pricelevels", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "invoice", displayName: "Invoice", entitySetName: "invoices", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "quote", displayName: "Quote", entitySetName: "quotes", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "salesorder", displayName: "Order", entitySetName: "salesorders", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "queue", displayName: "Queue", entitySetName: "queues", tableType: "Standard", isCustomEntity: false, isManaged: true },
  { logicalName: "contoso_employeeonboarding", displayName: "Employee Onboarding Record", entitySetName: "contoso_employeeonboardings", tableType: "Standard", isCustomEntity: true, isManaged: true },
  { logicalName: "contoso_assetrequest", displayName: "Asset Request", entitySetName: "contoso_assetrequests", tableType: "Standard", isCustomEntity: true, isManaged: true },
];

// --- Environmental Compliance detail/history pages ---

const SAMPLE_PP_COMPLIANCE_CHECK_DEFS: Omit<ComplianceCheck, "status">[] = [
  { checkId: "mfa-enforced", label: "Multi-Factor Authentication Enforced", description: "All environment makers and admins have MFA enabled.", details: "24 of 24 admins have MFA enabled.", weight: 20 },
  { checkId: "dlp-policy-applied", label: "Data Loss Prevention Policy Applied", description: "Environment is covered by at least one DLP policy.", details: "Covered by 'Production Lockdown'.", weight: 15 },
  { checkId: "managed-environment", label: "Managed Environment Enabled", description: "Environment has Managed Environment features turned on.", details: "Managed Environment is enabled.", weight: 15 },
  { checkId: "backup-schedule", label: "Backup Schedule Configured", description: "A recurring backup schedule exists for this environment.", details: "Nightly backups configured, last run succeeded.", weight: 15 },
  { checkId: "guest-access", label: "Guest Access Restricted", description: "External guest access to the environment is limited to approved domains.", details: "2 guest accounts found outside the approved domain list.", weight: 15 },
  { checkId: "solution-checker", label: "Solution Checker Enabled", description: "Solution Checker rules run automatically on solution import.", details: "Solution Checker is enabled tenant-wide.", weight: 10 },
  { checkId: "audit-logging", label: "Audit Logging Enabled", description: "Dataverse auditing is enabled for this environment.", details: "Auditing enabled since 2025-09-12.", weight: 10 },
];

function complianceChecks(overrides: Record<string, ComplianceCheck["status"]>): ComplianceCheck[] {
  return SAMPLE_PP_COMPLIANCE_CHECK_DEFS.map((def) => ({ ...def, status: overrides[def.checkId] ?? "pass" }));
}

/** Latest compliance report for the Environmental Compliance detail page — Contoso Production. */
export const SAMPLE_PP_COMPLIANCE_REPORT: ComplianceReport = {
  id: "sample-report-prod-latest",
  environmentId: "sample-env-prod",
  environmentName: "contoso-production",
  environmentUrl: "https://contoso-production.crm.dynamics.com",
  score: 96,
  status: "compliant",
  checks: complianceChecks({ "guest-access": "warning" }),
  checkedAt: "2026-07-08T06:00:00.000Z",
  checkedBy: "olga.novak@contoso.com",
};

/** Past reports for the same environment, shown on the Compliance History page. */
export const SAMPLE_PP_COMPLIANCE_HISTORY: ComplianceReport[] = [
  SAMPLE_PP_COMPLIANCE_REPORT,
  {
    id: "sample-report-prod-2026-06",
    environmentId: "sample-env-prod",
    environmentName: "contoso-production",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    score: 93,
    status: "compliant",
    checks: complianceChecks({ "guest-access": "warning", "solution-checker": "warning" }),
    checkedAt: "2026-06-08T06:00:00.000Z",
    checkedBy: "olga.novak@contoso.com",
  },
  {
    id: "sample-report-prod-2026-05",
    environmentId: "sample-env-prod",
    environmentName: "contoso-production",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    score: 88,
    status: "compliant",
    checks: complianceChecks({ "guest-access": "fail", "backup-schedule": "warning" }),
    checkedAt: "2026-05-08T06:00:00.000Z",
    checkedBy: "priya.shah@contoso.com",
  },
  {
    id: "sample-report-prod-2026-04",
    environmentId: "sample-env-prod",
    environmentName: "contoso-production",
    environmentUrl: "https://contoso-production.crm.dynamics.com",
    score: 74,
    status: "at_risk",
    checks: complianceChecks({ "guest-access": "fail", "backup-schedule": "fail", "managed-environment": "warning", "solution-checker": "skipped" }),
    checkedAt: "2026-04-09T06:00:00.000Z",
    checkedBy: "priya.shah@contoso.com",
  },
];

// --- DLP policy detail (Policies page row-click slide-over) ---

export const SAMPLE_PP_DLP_POLICY_DETAILS: Record<string, PpDlpPolicyDetail> = {
  "sample-dlp-tenant-wide": {
    ...SAMPLE_PP_DLP_POLICIES[0],
    connectors: [
      { name: "Microsoft Dataverse", classification: "Business" },
      { name: "SharePoint", classification: "Business" },
      { name: "Outlook", classification: "Business" },
      { name: "Twitter", classification: "Blocked" },
      { name: "Dropbox", classification: "Blocked" },
      { name: "RSS", classification: "Non-Business" },
    ],
  },
  "sample-dlp-prod-only": {
    ...SAMPLE_PP_DLP_POLICIES[1],
    connectors: [
      { name: "Microsoft Dataverse", classification: "Business" },
      { name: "SQL Server", classification: "Business" },
      { name: "HTTP", classification: "Blocked" },
      { name: "FTP", classification: "Blocked" },
    ],
  },
  "sample-dlp-sandbox": {
    ...SAMPLE_PP_DLP_POLICIES[2],
    connectors: [
      { name: "Microsoft Dataverse", classification: "Business" },
      { name: "Excel Online", classification: "Non-Business" },
      { name: "Forms", classification: "Non-Business" },
      { name: "HTTP", classification: "Blocked" },
    ],
  },
};

// --- Restore History tab (Backups & Restore page) ---

export const SAMPLE_PP_RESTORES: RestoreRun[] = [
  {
    id: "sample-restore-1",
    backupRunId: "sample-backup-preupgrade",
    environmentId: "sample-env-prod",
    restoreType: "MANUAL",
    targetEnvironmentName: "Contoso Production (test copy)",
    restorePointDateTime: "2026-07-08T21:45:00.000Z",
    notes: "Verifying pre-upgrade snapshot before Q3 release",
    status: "SUCCEEDED",
    triggeredBy: "priya.shah@contoso.com",
    createdAt: "2026-07-09T09:15:00.000Z",
    completedAt: "2026-07-09T09:42:00.000Z",
  },
  {
    id: "sample-restore-2",
    backupRunId: null,
    environmentId: "sample-env-prod",
    restoreType: "SYSTEM",
    targetEnvironmentName: "Contoso Production",
    restorePointDateTime: "2026-06-20T04:00:00.000Z",
    notes: null,
    status: "FAILED",
    triggeredBy: "daniel.kim@contoso.com",
    createdAt: "2026-06-21T11:05:00.000Z",
    completedAt: "2026-06-21T11:18:00.000Z",
  },
];

// --- Backup schedule (Backups & Restore page stat cards + schedule banner) ---

export const SAMPLE_PP_BACKUP_SCHEDULE: BackupSchedule = {
  id: "sample-backup-schedule",
  tenantId: "sample-tenant",
  environmentId: "sample-env-prod",
  environmentName: "Contoso Production",
  cronExpression: "0 0 * * *",
  enabled: true,
  nextRunAt: "2026-07-12T07:00:00.000Z",
  createdAt: "2026-01-05T07:00:00.000Z",
};
