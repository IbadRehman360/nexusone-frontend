import { useQuery } from "@tanstack/react-query";
import { getEnvironments } from "@/src/services/power-platform/environmentApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { PowerPlatformEnvironment } from "@/src/types/powerPlatform";

export function useEnvironments(state?: string) {
  const query = useQuery({
    queryKey: queryKeys.environments.all(state),
    queryFn: () => getEnvironments(state),
  });

  return {
    environments: (query.data?.data ?? []) as PowerPlatformEnvironment[],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
