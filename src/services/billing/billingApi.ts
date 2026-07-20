import apiClient from "../client";
import { BILLING_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export interface PlanListItem {
  id: string;
  modules: string[];
  displayName: string;
  features: string[];
  monthlyUSDcents: number;
  invitesIncluded: number;
  trialDays: number;
  sortOrder: number;
}

export interface InvitePackListItem {
  id: string;
  size: number;
  displayName: string;
  oneTimeUSDcents: number;
  sortOrder: number;
}

export interface BillingPlansResponse {
  plans: PlanListItem[];
  invitePacks: InvitePackListItem[];
}

export interface ModuleBillingInfo {
  stripeSubscriptionStatus: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Live Stripe subscription-item amount for this module, in USD cents —
   *  reflects a staff-set custom price override if one is active, not just
   *  the flat catalog price. */
  monthlyUSDcents: number;
}

export interface BillingState {
  nexusStatus: "TRIAL" | "ACTIVE" | "GRACE" | "LOCKED";
  stripeStatus: "trialing" | "active" | "past_due" | "unpaid" | "canceled" | "paused" | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  trialExpiresAt: string;
  gracePeriodUntil: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planId: string | null;
  planDisplayName: string | null;
  modules: string[];
  paidModules: string[];
  invitesIncluded: number;
  invitesUsed: number;
  invitesRemaining: number;
  modulesInTrial: string[];
  anyModuleInTrial: boolean;
  modulesInGrace: string[];
  anyModuleInGrace: boolean;
  moduleBilling: Record<string, ModuleBillingInfo>;
}

export interface InvoiceItem {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: number;
  periodEnd: number;
}

export interface PaymentMethodItem {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  cardholderName: string | null;
}

export interface SeatInfo {
  base: number;
  purchased: number;
  total: number;
  /** Ceiling on how high `total` may go via purchasing — widens by 5 per paid module. */
  maxTotal: number;
  used: number;
  remaining: number;
  pricePerSeatCents: number;
  canManage: boolean;
  /** 'managed' means a staff-negotiated arrangement governs `total` instead
   *  of the self-service formula — show a read-only summary, not the stepper. */
  billingMode: "self_service" | "managed";
  /** Present only when billingMode is 'managed' — the active deal's terms,
   *  so the customer can see what they're actually contracted for instead of
   *  a bare "contact support" message. Null under self_service. */
  managedDeal: {
    paymentTerms: "net_30" | "net_60" | "wire" | "ach" | "custom";
    moduleFeeCents: number | null;
    effectiveStart: string;
    notes: string | null;
  } | null;
}

export const listPlans = async (): Promise<BillingPlansResponse> => {
  const response = await apiClient.get(BILLING_ROUTES.PLANS);
  return unwrap<BillingPlansResponse>(response.data);
};

export const getBillingState = async (): Promise<BillingState> => {
  const response = await apiClient.get(BILLING_ROUTES.STATE);
  return unwrap<BillingState>(response.data);
};

export const redirectToCheckout = async (body: { planId: string } | { invitePackPlanId: string }): Promise<void> => {
  const response = await apiClient.post(BILLING_ROUTES.CHECKOUT_SESSION, body);
  const { url } = unwrap<{ url: string; sessionId: string }>(response.data);
  if (!url) throw new Error("Stripe Checkout session did not return a redirect URL");
  window.location.assign(url);
};

export const createPortalSession = async (): Promise<string> => {
  const response = await apiClient.post(BILLING_ROUTES.PORTAL_SESSION);
  return unwrap<{ url: string }>(response.data).url;
};

export const cancelSubscription = async (opts?: { reason?: string; message?: string }): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.CANCEL, opts ?? {});
};

export const reactivateSubscription = async (): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.REACTIVATE);
};

export const cancelModule = async (moduleKey: string): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.MODULE_CANCEL(moduleKey));
};

export const reactivateModule = async (moduleKey: string): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.MODULE_REACTIVATE(moduleKey));
};

export const retryModuleInvoice = async (moduleKey: string): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.MODULE_RETRY_INVOICE(moduleKey));
};

export const getSeatInfo = async (): Promise<SeatInfo> => {
  const response = await apiClient.get(BILLING_ROUTES.SEATS);
  return unwrap<SeatInfo>(response.data);
};

/** Sets the TOTAL seat count. Returns a Stripe Checkout URL when a seat subscription must first be created. */
export const setSeats = async (total: number): Promise<{ url: string | null }> => {
  const response = await apiClient.post(BILLING_ROUTES.SEATS, { total });
  return unwrap<{ url: string | null }>(response.data);
};

export const retryInvoice = async (invoiceId: string): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.RETRY_INVOICE, { invoiceId });
};

export const getInvoices = async (limit = 10): Promise<InvoiceItem[]> => {
  const response = await apiClient.get(BILLING_ROUTES.INVOICES, { params: { limit } });
  return unwrap<{ invoices: InvoiceItem[] }>(response.data).invoices;
};

export const getPaymentMethods = async (): Promise<PaymentMethodItem[]> => {
  const response = await apiClient.get(BILLING_ROUTES.PAYMENT_METHODS);
  return unwrap<{ methods: PaymentMethodItem[] }>(response.data).methods;
};

export const removePaymentMethod = async (id: string): Promise<void> => {
  await apiClient.delete(BILLING_ROUTES.PAYMENT_METHOD(id));
};
