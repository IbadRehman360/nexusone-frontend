"use client";

import { useQuery } from "@tanstack/react-query";
import { getDataverseLogs } from "@/src/services/dataverseLogs/dataverseLogsApi";
import type { DataverseLogsFilters } from "@/src/services/dataverseLogs/dataverseLogsApi";

export function useDataverseLogs(filters: DataverseLogsFilters | null) {
  const query = useQuery({
    queryKey: ["dataverse-logs", filters],
    queryFn: () => getDataverseLogs(filters!),
    enabled: !!filters?.environmentUrl,
    staleTime: 30_000,
  });
  return { logs: query.data?.logs ?? [], isLoading: query.isLoading, isFetching: query.isFetching, refetch: query.refetch };
}
