import { useQuery } from "@tanstack/react-query";
import { fetchPpDlpPolicies } from "@/src/services/power-platform/ppGovernanceApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function usePpDlpPolicies() {
  const query = useQuery({
    queryKey: queryKeys.ppGovernance.dlpPolicies(),
    queryFn: fetchPpDlpPolicies,
  });

  return {
    policies: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
