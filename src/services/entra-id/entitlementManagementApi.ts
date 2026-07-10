import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { EmCatalog, EmPackageDetail, EmCompareGrid } from "@/src/types/emPackages";

const EMPTY_CATALOG: EmCatalog = {
  items: [],
  stats: { activePackages: 0, totalAssignments: 0, expiringSoon: 0, workflowFailures: 0 },
  insights: { insights: [], completionScore: 0, passedChecks: 0, totalChecks: 0 },
  emLicensed: true,
};

export const fetchEmCatalog = async (): Promise<EmCatalog> => {
  const response = await apiClient.get(API_ROUTES.ENTITLEMENT_MANAGEMENT.CATALOG, { timeout: 60_000 });
  return unwrap<EmCatalog>(response.data) ?? EMPTY_CATALOG;
};

export const fetchEmPackage = async (id: string): Promise<EmPackageDetail | null> => {
  const response = await apiClient.get(API_ROUTES.ENTITLEMENT_MANAGEMENT.PACKAGE(id), { timeout: 60_000 });
  return unwrap<EmPackageDetail | null>(response.data) ?? null;
};

const EMPTY_COMPARE_GRID: EmCompareGrid = { tenants: [], checks: [], cells: {} };

export const compareEntitlementManagement = async (tenantIds: string[]): Promise<EmCompareGrid> => {
  const response = await apiClient.post(API_ROUTES.ENTITLEMENT_MANAGEMENT.COMPARE, { tenantIds });
  return unwrap<EmCompareGrid>(response.data) ?? EMPTY_COMPARE_GRID;
};
