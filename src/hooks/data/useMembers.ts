"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantMembers, getTenantRoles } from "@/src/services/tenants/tenantApi";
import { getInvitations } from "@/src/services/invitations/invitationApi";
import { useAuth } from "@/src/hooks/useAuth";

export function useTenantMembers() {
  const { user } = useAuth();
  const tenantId = user?.currentTenantId ?? "";
  const query = useQuery({
    queryKey: ["tenants", tenantId, "members"],
    queryFn: () => getTenantMembers(tenantId),
    enabled: !!tenantId,
    staleTime: 30_000,
  });
  return { members: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}

export function useTenantRoles() {
  const { user } = useAuth();
  const tenantId = user?.currentTenantId ?? "";
  const query = useQuery({
    queryKey: ["tenants", tenantId, "roles"],
    queryFn: () => getTenantRoles(tenantId),
    enabled: !!tenantId,
    staleTime: 300_000,
  });
  return { roles: query.data ?? [], isLoading: query.isLoading };
}

export function useInvitations() {
  const query = useQuery({ queryKey: ["invitations"], queryFn: getInvitations, staleTime: 30_000 });
  return { invitations: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}

export function useInvalidateMembers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["invitations"] });
  };
}
