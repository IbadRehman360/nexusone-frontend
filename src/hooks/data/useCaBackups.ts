import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCaSnapshots, fetchCaSnapshotDiff, createCaSnapshot, restoreCaSnapshot, deleteCaSnapshot } from "@/src/services/entra-id/conditionalAccessBackupApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useCaBackups() {
  const query = useQuery({
    queryKey: queryKeys.caBackups.list(),
    queryFn: fetchCaSnapshots,
    retry: false,
  });

  return {
    snapshots: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCaSnapshotDiff(fromId: string | null, toId: string | null) {
  const enabled = !!fromId && !!toId && fromId !== toId;
  const query = useQuery({
    queryKey: queryKeys.caBackups.diff(fromId ?? "", toId ?? ""),
    queryFn: () => fetchCaSnapshotDiff(fromId!, toId!),
    enabled,
    retry: false,
  });

  return {
    diff: query.data ?? null,
    isLoading: enabled && query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCaBackupMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.caBackups.list() });

  const create = useMutation({
    mutationFn: (label: string | undefined) => createCaSnapshot(label),
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: ({ id, policyId }: { id: string; policyId?: string }) => restoreCaSnapshot(id, policyId),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCaSnapshot(id),
    onSuccess: invalidate,
  });

  return { create, restore, remove };
}
