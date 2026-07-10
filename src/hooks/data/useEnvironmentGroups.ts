import { useQuery } from "@tanstack/react-query";
import { getEnvironmentGroupsWithEnvironments } from "@/src/services/power-platform/environmentGroupApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useEnvironmentGroups(enabled: boolean = true) {
  const query = useQuery({
    queryKey: queryKeys.environmentGroups.withEnvironments(),
    queryFn: getEnvironmentGroupsWithEnvironments,
    enabled,
  });

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
