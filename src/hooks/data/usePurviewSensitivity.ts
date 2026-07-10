import { useQuery } from "@tanstack/react-query";
import { fetchSensitivityLabels } from "@/src/services/purview/sensitivityApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useSensitivityLabels() {
  const query = useQuery({
    queryKey: queryKeys.purviewSensitivity.labels(),
    queryFn: fetchSensitivityLabels,
  });

  const labels = query.data ?? [];
  return {
    labels,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
