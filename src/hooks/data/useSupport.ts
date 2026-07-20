"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupportTickets, getSupportTicketDetail } from "@/src/services/support/supportApi";

export function useSupportTickets() {
  const query = useQuery({ queryKey: ["support-tickets"], queryFn: getSupportTickets, staleTime: 30_000 });
  return { tickets: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}

export function useSupportTicketDetail(id: string | null) {
  const query = useQuery({
    queryKey: ["support-ticket", id],
    queryFn: () => getSupportTicketDetail(id!),
    enabled: !!id,
    // No push signal exists for a staff reply landing on an already-open
    // ticket — poll while the slide-over is open so the customer sees a
    // staff reply without closing/reopening it. Stops once `id` clears.
    refetchInterval: id ? 8_000 : false,
  });
  return { detail: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}

export function useInvalidateSupport() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
}
