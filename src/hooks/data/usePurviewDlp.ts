import { useQuery } from "@tanstack/react-query";
import { fetchDlpAlerts } from "@/src/services/purview/dlpApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useDlpAlerts(enabled: boolean = true) {
  const query = useQuery({
    queryKey: queryKeys.purviewDlp.alerts(),
    queryFn: fetchDlpAlerts,
    enabled,
  });

  const alerts = query.data ?? [];
  return {
    alerts,
    isLoading: query.isLoading,
    error: query.error as (Error & { status?: number }) | null,
  };
}
