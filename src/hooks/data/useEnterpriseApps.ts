import { useQuery } from "@tanstack/react-query";
import {
  fetchEnterpriseAppCatalog,
  fetchEnterpriseAppOverview,
  fetchEnterpriseAppAccess,
  fetchEnterpriseAppSso,
  fetchEnterpriseAppPermissions,
  fetchEnterpriseAppActivity,
} from "@/src/services/entra-id/enterpriseAppsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useEnterpriseApps() {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.catalog(),
    queryFn: fetchEnterpriseAppCatalog,
    staleTime: 120_000,
    retry: false,
  });

  return {
    apps: query.data?.apps ?? [],
    stats: query.data?.stats ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEnterpriseAppOverview(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.overview(id ?? ""),
    queryFn: () => (id ? fetchEnterpriseAppOverview(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 120_000,
    retry: false,
  });

  return {
    overview: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEnterpriseAppAccess(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.access(id ?? ""),
    queryFn: () => fetchEnterpriseAppAccess(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    access: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEnterpriseAppSso(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.sso(id ?? ""),
    queryFn: () => fetchEnterpriseAppSso(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    sso: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEnterpriseAppPermissions(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.permissions(id ?? ""),
    queryFn: () => fetchEnterpriseAppPermissions(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    permissions: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEnterpriseAppActivity(id: string | null, appId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.enterpriseApps.activity(id ?? "", appId ?? ""),
    queryFn: () => fetchEnterpriseAppActivity(id!, appId!),
    enabled: !!id && !!appId && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    activity: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
