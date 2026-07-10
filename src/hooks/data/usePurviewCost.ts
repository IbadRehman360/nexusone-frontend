import { useQuery } from "@tanstack/react-query";
import {
  fetchCostSummary,
  fetchPurviewMetrics,
  fetchVCoreUsage,
  fetchCostScanHistory,
} from "@/src/services/purview/costApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { ScanHistoryFilters } from "@/src/types/purview";

export function useCostSummary(month?: string) {
  const query = useQuery({
    queryKey: queryKeys.purviewCost.summary(month),
    queryFn: () => fetchCostSummary(month),
  });

  const summary = query.data ?? null;
  return {
    summary,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function usePurviewMetrics() {
  const query = useQuery({
    queryKey: queryKeys.purviewCost.metrics(),
    queryFn: fetchPurviewMetrics,
  });

  const metrics = query.data ?? null;
  return {
    metrics,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useVCoreUsage(month?: string) {
  const query = useQuery({
    queryKey: queryKeys.purviewCost.vCoreUsage(month),
    queryFn: () => fetchVCoreUsage(month),
  });

  const vCoreUsage = query.data ?? null;
  return {
    vCoreUsage,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCostScanHistory(filters: ScanHistoryFilters = {}) {
  const { status = "all", dataSource = "all" } = filters;
  const query = useQuery({
    queryKey: queryKeys.purviewCost.scanHistory(status, dataSource),
    queryFn: () => fetchCostScanHistory({ status, dataSource }),
  });

  const scanHistory = query.data ?? [];
  return {
    scanHistory,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
