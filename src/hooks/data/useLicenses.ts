import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLicenses,
  fetchLicenseUsers,
  fetchLicenseUsage,
  fetchLicenseCosts,
  fetchUserLicenseDetail,
  assignLicense,
  revokeLicense,
} from "@/src/services/entra-id/licensesApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { AssignLicensePayload, RevokeLicensePayload } from "@/src/types/licenses";

export function useLicenses() {
  const query = useQuery({
    queryKey: queryKeys.licenses.list(),
    queryFn: fetchLicenses,
    staleTime: 120_000,
    retry: false,
  });

  return {
    licenses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useLicenseUsers() {
  const query = useQuery({
    queryKey: queryKeys.licenses.users(),
    queryFn: fetchLicenseUsers,
    staleTime: 120_000,
    retry: false,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useLicenseUsage() {
  const query = useQuery({
    queryKey: queryKeys.licenses.usage(),
    queryFn: fetchLicenseUsage,
    staleTime: 120_000,
    retry: false,
  });

  return {
    usage: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useLicenseCosts() {
  const query = useQuery({
    queryKey: queryKeys.licenses.costs(),
    queryFn: fetchLicenseCosts,
    staleTime: 120_000,
    retry: false,
  });

  return {
    costs: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useUserLicenseDetail(userId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.licenses.userDetail(userId ?? ""),
    queryFn: () => fetchUserLicenseDetail(userId!),
    enabled: !!userId,
    staleTime: 120_000,
    retry: false,
  });

  return {
    details: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useAssignLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignLicensePayload) => assignLicense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.users() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.usage() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.costs() });
    },
  });
}

export function useRevokeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RevokeLicensePayload) => revokeLicense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.users() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.usage() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.licenses.costs() });
    },
  });
}
