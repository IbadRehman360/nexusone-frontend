import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { CostSummary, VCoreUsage, PurviewMetrics, ScanHistoryFilters, ScanStatusRow } from "@/src/types/purview";

const EMPTY_COST_SUMMARY: CostSummary = { currentMonthCost: 0, lastMonthCost: 0, currency: "USD", trendPercent: 0, dailyTrend: [] };
const EMPTY_VCORE_USAGE: VCoreUsage = { vCoreHours: 0, cost: 0, currency: "USD" };
const EMPTY_PURVIEW_METRICS: PurviewMetrics = {
  dataMapStorageSizeBytes: 0,
  dataMapCapacityUnits: 0,
  scanCompleted: 0,
  scanFailed: 0,
  scanCancelled: 0,
  scanTimeTakenMs: 0,
};

export const fetchCostSummary = async (month?: string): Promise<CostSummary> => {
  const response = await apiClient.get(API_ROUTES.COST.SUMMARY, { params: month ? { month } : undefined });
  return unwrap<CostSummary>(response.data) ?? EMPTY_COST_SUMMARY;
};

export const fetchPurviewMetrics = async (): Promise<PurviewMetrics> => {
  const response = await apiClient.get(API_ROUTES.COST.METRICS);
  return unwrap<PurviewMetrics>(response.data) ?? EMPTY_PURVIEW_METRICS;
};

export const fetchVCoreUsage = async (month?: string): Promise<VCoreUsage> => {
  const response = await apiClient.get(API_ROUTES.COST.VCORE_USAGE, { params: month ? { month } : undefined });
  return unwrap<VCoreUsage>(response.data) ?? EMPTY_VCORE_USAGE;
};

export const fetchCostScanHistory = async (filters: ScanHistoryFilters = {}): Promise<ScanStatusRow[]> => {
  const params: Record<string, string> = {};
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.dataSource && filters.dataSource !== "all") params.dataSource = filters.dataSource;
  const response = await apiClient.get(API_ROUTES.COST.SCAN_HISTORY, { params });
  return unwrap<ScanStatusRow[]>(response.data) ?? [];
};
