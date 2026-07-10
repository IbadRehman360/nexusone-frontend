import { useQuery } from "@tanstack/react-query";
import { getImportJobs } from "@/src/services/import/importApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useImportJobs() {
  const query = useQuery({
    queryKey: queryKeys.importJobs.list(),
    queryFn: getImportJobs,
  });

  return {
    jobs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
