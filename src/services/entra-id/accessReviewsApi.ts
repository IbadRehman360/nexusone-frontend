import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { ArCatalog, ArCampaignDetail, ArCompareGrid } from "@/src/types/accessReviews";

const EMPTY_CATALOG: ArCatalog = {
  items: [],
  stats: { activeReviews: 0, overdueIncomplete: 0, avgCompletion: 0, decisionsPendingApply: 0 },
  insights: { insights: [], completionScore: 0, passedChecks: 0, totalChecks: 0 },
  arLicensed: true,
};

export const fetchArCatalog = async (): Promise<ArCatalog> => {
  const response = await apiClient.get(API_ROUTES.ACCESS_REVIEWS.CATALOG, { timeout: 60_000 });
  return unwrap<ArCatalog>(response.data) ?? EMPTY_CATALOG;
};

export const fetchArCampaign = async (id: string): Promise<ArCampaignDetail | null> => {
  const response = await apiClient.get(API_ROUTES.ACCESS_REVIEWS.CAMPAIGN(id), { timeout: 60_000 });
  return unwrap<ArCampaignDetail | null>(response.data) ?? null;
};

const EMPTY_COMPARE_GRID: ArCompareGrid = { tenants: [], checks: [], cells: {} };

export const compareAccessReviews = async (tenantIds: string[]): Promise<ArCompareGrid> => {
  const response = await apiClient.post(API_ROUTES.ACCESS_REVIEWS.COMPARE, { tenantIds });
  return unwrap<ArCompareGrid>(response.data) ?? EMPTY_COMPARE_GRID;
};
