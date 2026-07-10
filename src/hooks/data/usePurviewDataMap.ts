import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCatalogConnectors,
  fetchCatalogConnectorDetail,
  fetchCatalogStats,
  fetchDataMapCollections,
  fetchScanRuleSets,
  fetchScanStatuses,
} from "@/src/services/purview/dataMapApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import { isFailedStatus } from "@/src/lib/utils/scanStatus";
import type { ConnectorFilters, ScanStatusRow } from "@/src/types/purview";

export function useCatalogConnectors(filters: ConnectorFilters = {}) {
  const { status = "all", sourceType = "all" } = filters;
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.connectors(status, sourceType),
    queryFn: () => fetchCatalogConnectors({ status, sourceType }),
  });

  const connectors = query.data ?? [];
  return {
    connectors,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useDataSourceDetail(name: string | null) {
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.connectorDetail(name ?? ""),
    queryFn: () => (name ? fetchCatalogConnectorDetail(name) : Promise.resolve(null)),
    enabled: !!name,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useDataMapCollections() {
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.collections(),
    queryFn: fetchDataMapCollections,
  });

  const collections = query.data ?? [];
  return {
    collections,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useScanRuleSets() {
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.scanRuleSets(),
    queryFn: fetchScanRuleSets,
  });

  const scanRuleSets = query.data ?? [];
  return {
    scanRuleSets,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useScanStatuses() {
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.scanStatuses(),
    queryFn: fetchScanStatuses,
  });

  const history = query.data ?? [];
  return {
    history,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCatalogStats() {
  const query = useQuery({
    queryKey: queryKeys.purviewDataMap.catalogStats(),
    queryFn: fetchCatalogStats,
  });

  const catalogStats = query.data ?? null;
  return {
    catalogStats,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

/** Pure derivation from scan history — failure counts, success rate, average duration. */
export function useDataMapStats(history: ScanStatusRow[]) {
  return useMemo(() => {
    const failedRows = history.filter((row) => isFailedStatus(row.status));
    const failedRuns = failedRows.length;
    const failedSources = new Set(failedRows.map((row) => row.dataSourceName)).size;

    const successRate = history.length === 0
      ? null
      : Math.round(((history.length - failedRuns) / history.length) * 1000) / 10;

    const durations = history.map((row) => row.scanDurationMs).filter((ms) => ms > 0);
    const avgDurationMin = durations.length === 0
      ? null
      : Math.round((durations.reduce((sum, ms) => sum + ms, 0) / durations.length / 60000) * 10) / 10;

    return { failedRuns, failedSources, successRate, avgDurationMin };
  }, [history]);
}
