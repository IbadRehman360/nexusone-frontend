import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { PimPosture, PimPrincipalDetail, PimCompareGrid } from "@/src/types/pim";

const EMPTY_POSTURE: PimPosture = {
  items: [],
  stats: { standingAdmins: 0, eligibleJit: 0, globalAdmins: 0, activeNow: 0 },
  recommendations: { recommendations: [], completionScore: 0, passedChecks: 0, totalChecks: 0 },
  pimLicensed: true,
};

export const fetchPimPosture = async (): Promise<PimPosture> => {
  const response = await apiClient.get(API_ROUTES.PIM.POSTURE, { timeout: 60_000 });
  return unwrap<PimPosture>(response.data) ?? EMPTY_POSTURE;
};

export const fetchPimPrincipal = async (id: string): Promise<PimPrincipalDetail | null> => {
  const response = await apiClient.get(API_ROUTES.PIM.PRINCIPAL(id), { timeout: 60_000 });
  return unwrap<PimPrincipalDetail | null>(response.data) ?? null;
};

const EMPTY_COMPARE_GRID: PimCompareGrid = { tenants: [], checks: [], cells: {} };

export const comparePimTenants = async (tenantIds: string[]): Promise<PimCompareGrid> => {
  const response = await apiClient.post(API_ROUTES.PIM.COMPARE, { tenantIds });
  return unwrap<PimCompareGrid>(response.data) ?? EMPTY_COMPARE_GRID;
};
