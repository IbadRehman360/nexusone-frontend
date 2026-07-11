import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCsaAttributes,
  fetchCsaUsers,
  fetchCsaServicePrincipals,
  createCsaAttribute,
  assignCsaAttribute,
  removeCsaAttribute,
  assignCsaSpAttribute,
  removeCsaSpAttribute,
  bulkCsaAttribute,
} from "@/src/services/entra-id/securityAttributesApi";
import { queryKeys } from "@/src/lib/query/queryKeys";
import type { AssignAttributePayload, BulkAttributePayload, CreateAttributePayload, CsaCategory, CsaUser, CsaServicePrincipal } from "@/src/types/securityAttributes";

// Stable empty-array fallbacks — `query.data ?? []` allocates a fresh array
// every render while `data` is undefined (loading/error), which breaks any
// consumer that depends on reference equality (e.g. security-attributes'
// Page.tsx re-expands categories whenever `categories` "changes").
const EMPTY_CATEGORIES: CsaCategory[] = [];
const EMPTY_USERS: CsaUser[] = [];
const EMPTY_SERVICE_PRINCIPALS: CsaServicePrincipal[] = [];

export function useCsaAttributes() {
  const query = useQuery({
    queryKey: queryKeys.csa.attributes(),
    queryFn: fetchCsaAttributes,
    staleTime: 300_000,
  });

  return { categories: query.data ?? EMPTY_CATEGORIES, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCsaUsers() {
  const query = useQuery({
    queryKey: queryKeys.csa.users(),
    queryFn: fetchCsaUsers,
    staleTime: 120_000,
  });

  return { users: query.data ?? EMPTY_USERS, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCsaServicePrincipals() {
  const query = useQuery({
    queryKey: queryKeys.csa.servicePrincipals(),
    queryFn: fetchCsaServicePrincipals,
    staleTime: 120_000,
  });

  return { servicePrincipals: query.data ?? EMPTY_SERVICE_PRINCIPALS, isLoading: query.isLoading, error: query.error as Error | null };
}

export function useCsaMutations() {
  const qc = useQueryClient();

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.csa.attributes() });
    void qc.invalidateQueries({ queryKey: queryKeys.csa.users() });
    void qc.invalidateQueries({ queryKey: queryKeys.csa.servicePrincipals() });
  };
  const invalidateUsers = () => void qc.invalidateQueries({ queryKey: queryKeys.csa.users() });
  const invalidateSps = () => void qc.invalidateQueries({ queryKey: queryKeys.csa.servicePrincipals() });

  const createAttribute = useMutation({
    mutationFn: (payload: CreateAttributePayload) => createCsaAttribute(payload),
    onSuccess: invalidateAll,
  });

  const assignAttribute = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AssignAttributePayload }) => assignCsaAttribute(userId, payload),
    onSuccess: invalidateUsers,
  });

  const removeAttribute = useMutation({
    mutationFn: ({ userId, setId, name, isCollection }: { userId: string; setId: string; name: string; isCollection?: boolean }) =>
      removeCsaAttribute(userId, setId, name, isCollection),
    onSuccess: invalidateUsers,
  });

  const assignSpAttribute = useMutation({
    mutationFn: ({ spId, payload }: { spId: string; payload: AssignAttributePayload }) => assignCsaSpAttribute(spId, payload),
    onSuccess: invalidateSps,
  });

  const removeSpAttribute = useMutation({
    mutationFn: ({ spId, setId, name, isCollection }: { spId: string; setId: string; name: string; isCollection?: boolean }) =>
      removeCsaSpAttribute(spId, setId, name, isCollection),
    onSuccess: invalidateSps,
  });

  const bulkApply = useMutation({
    mutationFn: (payload: BulkAttributePayload) => bulkCsaAttribute(payload),
    onSuccess: () => {
      invalidateUsers();
      invalidateSps();
    },
  });

  return { createAttribute, assignAttribute, removeAttribute, assignSpAttribute, removeSpAttribute, bulkApply };
}
