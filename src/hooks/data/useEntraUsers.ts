import { useQuery } from "@tanstack/react-query";
import {
  fetchUsers,
  fetchUserById,
  fetchUserGroups,
  fetchUserAppAssignments,
  fetchUserOwnedObjects,
} from "@/src/services/entra-id/usersApi";
import { queryKeys } from "@/src/lib/query/queryKeys";

export function useEntraUsers(enabled: boolean = true) {
  const query = useQuery({
    queryKey: queryKeys.entraUsers.list(),
    queryFn: fetchUsers,
    staleTime: 120_000,
    retry: false,
    enabled,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEntraUser(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.entraUsers.byId(id ?? ""),
    queryFn: () => (id ? fetchUserById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 120_000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEntraUserGroups(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.entraUsers.groups(id ?? ""),
    queryFn: () => fetchUserGroups(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    groups: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEntraUserAppAssignments(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.entraUsers.appAssignments(id ?? ""),
    queryFn: () => fetchUserAppAssignments(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    apps: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useEntraUserOwnedObjects(id: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.entraUsers.ownedObjects(id ?? ""),
    queryFn: () => fetchUserOwnedObjects(id!),
    enabled: !!id && enabled,
    staleTime: 120_000,
    retry: false,
  });

  return {
    owned: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
