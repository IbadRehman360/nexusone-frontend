import type { PowerPlatformEnvironment } from "@/src/types/powerPlatform";

/**
 * Curated sample data for the Power Platform module's two top-level pages
 * (Overview, Environments) — shown instead of live data while a purchased
 * module hasn't been connected yet (see useModuleConnection/ModuleConnectBanner).
 * Deliberately not wired into deeper pages — those show a lighter generic
 * placeholder instead, per the agreed dummy-data scope.
 */
export const SAMPLE_PP_ENVIRONMENTS: PowerPlatformEnvironment[] = [
  {
    environmentId: "sample-prod",
    environmentName: "contoso-production",
    environmentDisplayName: "Production",
    environmentUrl: "https://contoso.crm.dynamics.com",
    type: "Production",
    region: "United States",
    state: "Ready",
    hasDataverse: true,
  },
  {
    environmentId: "sample-sales",
    environmentName: "contoso-sales-sandbox",
    environmentDisplayName: "Sales Sandbox",
    environmentUrl: "https://contoso-sales.crm.dynamics.com",
    type: "Sandbox",
    region: "United States",
    state: "Ready",
    hasDataverse: true,
  },
  {
    environmentId: "sample-dev",
    environmentName: "contoso-dev",
    environmentDisplayName: "Developer",
    environmentUrl: "https://contoso-dev.crm.dynamics.com",
    type: "Developer",
    region: "Europe",
    state: "Ready",
    hasDataverse: false,
  },
];

export const SAMPLE_PP_OVERVIEW = {
  environments: SAMPLE_PP_ENVIRONMENTS.length,
  environmentGroups: 2,
  appsAndFlows: 18,
  compliantEnvironments: 2,
};
