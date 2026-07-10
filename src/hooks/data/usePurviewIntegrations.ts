import { useQuery } from "@tanstack/react-query";
import { fetchIntegrationsHealth } from "@/src/services/purview/integrationsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useIntegrationsHealth() {
  const query = useQuery({
    queryKey: queryKeys.purviewIntegrations.health(),
    queryFn: fetchIntegrationsHealth,
  });

  const health = query.data ?? null;
  return {
    health,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
