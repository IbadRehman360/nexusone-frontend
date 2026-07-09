import { useQuery } from "@tanstack/react-query";
import { getPPDelegations } from "@/src/services/power-platform/ppDelegationApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function usePPDelegations(environmentUrl: string, status: string = "all") {
  const query = useQuery({
    queryKey: queryKeys.ppDelegations.byEnv(environmentUrl, status),
    queryFn: () => getPPDelegations(environmentUrl, status),
    enabled: !!environmentUrl,
  });

  return {
    delegations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
