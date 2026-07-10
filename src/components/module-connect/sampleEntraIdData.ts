import type { EntraUser } from "@/src/types/entraUsers";

/**
 * Curated sample data for Entra ID's two top-level pages (Overview, Users) —
 * shown instead of live data while the module hasn't been connected yet.
 * Mirrors samplePowerPlatformData.ts's role — deeper Entra ID pages get the
 * generic useModuleEmptyState placeholder instead of full fake data.
 */
export const SAMPLE_ENTRA_USERS: EntraUser[] = [
  {
    id: "sample-1",
    displayName: "Avery Chen",
    userPrincipalName: "avery.chen@contoso.com",
    mail: "avery.chen@contoso.com",
    jobTitle: "IT Administrator",
    department: "Information Technology",
    officeLocation: "Seattle HQ",
    mobilePhone: "",
    accountEnabled: true,
    assignedLicenses: [{ skuId: "sample-e5" }],
    createdDateTime: "2024-02-11T09:00:00Z",
  },
  {
    id: "sample-2",
    displayName: "Priya Natarajan",
    userPrincipalName: "priya.natarajan@contoso.com",
    mail: "priya.natarajan@contoso.com",
    jobTitle: "Finance Manager",
    department: "Finance",
    officeLocation: "Austin",
    mobilePhone: "",
    accountEnabled: true,
    assignedLicenses: [{ skuId: "sample-e3" }],
    createdDateTime: "2023-11-04T09:00:00Z",
  },
  {
    id: "sample-3",
    displayName: "Marcus Webb",
    userPrincipalName: "marcus.webb@contoso.com",
    mail: "marcus.webb@contoso.com",
    jobTitle: "Sales Representative",
    department: "Sales",
    officeLocation: "Chicago",
    mobilePhone: "",
    accountEnabled: false,
    assignedLicenses: [],
    createdDateTime: "2022-06-20T09:00:00Z",
  },
];

export const SAMPLE_ENTRA_OVERVIEW = {
  users: SAMPLE_ENTRA_USERS.length,
  groups: 6,
  enterpriseApps: 9,
  conditionalAccessPolicies: 4,
};
