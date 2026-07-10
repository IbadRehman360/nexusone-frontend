import { useQuery } from "@tanstack/react-query";
import { getResourceSummary } from "@/src/services/power-platform/resourceSummaryApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useResourceSummary() {
  const query = useQuery({
    queryKey: queryKeys.resourceSummary.all(),
    queryFn: getResourceSummary,
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
