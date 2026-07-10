import apiClient from "../client";
import { BILLING_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import { isDev } from "@/src/lib/devHarness";
import { store } from "@/src/store";

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
}

/**
 * Dev-only: the "Trial active" scenario in DevTestingPanel is a pure
 * client-side preview (mid-trial IS the real default state, so there's no
 * backend override to switch to for it — unlike Grace/Locked/Active, which
 * hit the real /dev/impersonate/module-scenario endpoint and need no splice
 * here since the backend already returns the overridden data for those).
 */
function isDevTrialScenarioActive(): boolean {
  return isDev && typeof window !== "undefined" && store.getState().trial.scenario === "trial";
}

const TRIAL_BILLING_STATE_OVERRIDE: Partial<BillingState> = {
  nexusStatus: "TRIAL",
  stripeStatus: "trialing",
  modules: ["entra", "pp", "purview"],
  paidModules: [],
  modulesInTrial: ["entra", "pp", "purview"],
  anyModuleInTrial: true,
  modulesInGrace: [],
  anyModuleInGrace: false,
  daysRemaining: 14,
  hoursRemaining: 336,
  invitesIncluded: 5,
};

export const listPlans = async (): Promise<BillingPlansResponse> => {
  const response = await apiClient.get(BILLING_ROUTES.PLANS);
  return unwrap<BillingPlansResponse>(response.data);
};

export const getBillingState = async (): Promise<BillingState> => {
  const response = await apiClient.get(BILLING_ROUTES.STATE);
  const state = unwrap<BillingState>(response.data);
  return isDevTrialScenarioActive() ? { ...state, ...TRIAL_BILLING_STATE_OVERRIDE } : state;
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

export const retryModuleInvoice = async (moduleKey: string): Promise<void> => {
  await apiClient.post(BILLING_ROUTES.MODULE_RETRY_INVOICE(moduleKey));
};

export const getSeatInfo = async (): Promise<SeatInfo> => {
  const response = await apiClient.get(BILLING_ROUTES.SEATS);
  const seats = unwrap<SeatInfo>(response.data);
  if (isDevTrialScenarioActive()) {
    // Trial hasn't purchased any modules, so the purchase ceiling is the free
    // base only — mirrors the real backend's own TRIAL cap (see billing.service.ts).
    return { ...seats, base: 5, purchased: 0, total: 5, maxTotal: 5, remaining: Math.max(0, 5 - seats.used), canManage: seats.canManage };
  }
  return seats;
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
