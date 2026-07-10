import { useQuery } from "@tanstack/react-query";
import { fetchComplianceOverview } from "@/src/services/power-platform/complianceApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useComplianceOverview() {
  const query = useQuery({
    queryKey: queryKeys.compliance.overview(),
    queryFn: fetchComplianceOverview,
  });

  return {
    overview: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
