import { useQuery } from "@tanstack/react-query";
import { fetchGroups, fetchGroupDetail } from "@/src/services/entra-id/groupsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useGroups(enabled: boolean = true) {
  const query = useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: fetchGroups,
    staleTime: 120_000,
    retry: false,
    enabled,
  });

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useGroupDetail(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.groups.detail(id ?? ""),
    queryFn: () => (id ? fetchGroupDetail(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 120_000,
    retry: false,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
