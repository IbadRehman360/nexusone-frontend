import { useQuery } from "@tanstack/react-query";
import { fetchGovernanceActivity } from "@/src/services/purview/governanceApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useGovernanceActivity() {
  const query = useQuery({
    queryKey: queryKeys.purviewGovernance.activity(),
    queryFn: fetchGovernanceActivity,
  });

  const purviewActivity = query.data?.purviewActivity ?? [];
  const entraActivity = query.data?.entraActivity ?? [];
  return {
    purviewActivity,
    entraActivity,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
