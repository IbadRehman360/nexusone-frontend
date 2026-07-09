"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBillingState, listPlans, getSeatInfo, getInvoices, getPaymentMethods } from "@/src/services/billing/billingApi";

export function useBillingState() {
  const query = useQuery({
    queryKey: ["billing", "state"],
    queryFn: getBillingState,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  return { state: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}

export function useBillingPlans() {
  const query = useQuery({ queryKey: ["billing", "plans"], queryFn: listPlans, staleTime: 300_000 });
  return { plans: query.data?.plans ?? [], invitePacks: query.data?.invitePacks ?? [], isLoading: query.isLoading, isError: query.isError };
}

export function useSeatInfo() {
  const query = useQuery({ queryKey: ["billing", "seats"], queryFn: getSeatInfo, staleTime: 30_000 });
  return { seats: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}

export function useInvoices(limit = 20) {
  const query = useQuery({ queryKey: ["billing", "invoices", limit], queryFn: () => getInvoices(limit), staleTime: 30_000 });
  return { invoices: query.data ?? [], isLoading: query.isLoading };
}

export function usePaymentMethods() {
  const query = useQuery({ queryKey: ["billing", "payment-methods"], queryFn: getPaymentMethods, staleTime: 30_000 });
  return { methods: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}

export function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["billing"] });
}
