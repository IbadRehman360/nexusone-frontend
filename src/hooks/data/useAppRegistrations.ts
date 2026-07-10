import { useQuery } from "@tanstack/react-query";
import {
  fetchAppRegistrationCatalog,
  fetchAppRegistrationOverview,
  fetchAppRegistrationCredentials,
  fetchAppRegistrationPermissions,
  fetchAppRegistrationAuthentication,
  fetchAppRegistrationExposedApi,
  fetchAppRegistrationRolesAdmins,
} from "@/src/services/entra-id/appRegistrationsApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useAppRegistrations() {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.catalog(),
    queryFn: fetchAppRegistrationCatalog,
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

export function useAppRegistrationOverview(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.overview(id ?? ""),
    queryFn: () => (id ? fetchAppRegistrationOverview(id) : Promise.resolve(null)),
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

export function useAppRegistrationCredentials(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.credentials(id ?? ""),
    queryFn: () => fetchAppRegistrationCredentials(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    credentials: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useAppRegistrationPermissions(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.permissions(id ?? ""),
    queryFn: () => fetchAppRegistrationPermissions(id!),
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

export function useAppRegistrationAuthentication(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.authentication(id ?? ""),
    queryFn: () => fetchAppRegistrationAuthentication(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    authentication: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useAppRegistrationExposedApi(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.exposedApi(id ?? ""),
    queryFn: () => fetchAppRegistrationExposedApi(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    exposedApi: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useAppRegistrationRolesAdmins(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.appRegistrations.rolesAdmins(id ?? ""),
    queryFn: () => fetchAppRegistrationRolesAdmins(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    rolesAdmins: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
