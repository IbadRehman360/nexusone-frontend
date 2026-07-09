"use client";

import { useQuery } from "@tanstack/react-query";
import { getTenants } from "@/src/services/tenants/tenantApi";
import { useAuth } from "@/src/hooks/useAuth";

export function useTenants() {
  const { user, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const tenants = query.data ?? [];
  const currentTenant = tenants.find((t) => t.id === user?.currentTenantId) ?? null;

  return { tenants, currentTenant, isLoading: query.isLoading };
}
