"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/src/services/auditLogs/auditLogApi";

export function useActivityLog(startDate?: string) {
  const query = useQuery({
    queryKey: ["audit-logs", startDate ?? "all"],
    queryFn: () => getAuditLogs(startDate ? { startDate } : {}),
    staleTime: 30_000,
  });
  return { activities: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch, isFetching: query.isFetching };
}
