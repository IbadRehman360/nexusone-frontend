import { useQuery } from "@tanstack/react-query";
import { fetchBackups, fetchBackupDetail, listRestores } from "@/src/services/power-platform/backupsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useBackups(environmentId: string) {
  const query = useQuery({
    queryKey: queryKeys.backups.byEnv(environmentId),
    queryFn: () => fetchBackups(environmentId),
    enabled: !!environmentId,
  });

  return {
    backups: query.data?.backups ?? [],
    manualBackupCount: query.data?.manualBackupCount ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useBackupDetail(bapBackupId: string | null, environmentId: string) {
  const query = useQuery({
    queryKey: queryKeys.backups.detail(bapBackupId ?? ""),
    queryFn: () => fetchBackupDetail(bapBackupId!, environmentId),
    enabled: !!bapBackupId && !!environmentId,
  });

  return { detail: query.data ?? null, isLoading: query.isLoading };
}

export function useRestoreHistory(environmentId: string) {
  const query = useQuery({
    queryKey: queryKeys.backups.restores(environmentId),
    queryFn: () => listRestores(environmentId),
    enabled: !!environmentId,
    refetchInterval: (q) => {
      const runs = q.state.data ?? [];
      return runs.some((r) => r.status === "PENDING") ? 30_000 : false;
    },
  });

  return { restores: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
