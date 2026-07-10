import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { setCurrentTenantId } from "@/src/lib/tenantContext";

export interface SubscriptionView {
  status: "TRIAL" | "GRACE" | "LOCKED" | "ACTIVE";
  daysRemaining: number | null;
  hoursRemaining: number | null;
  /** Effective modules unlocked right now (paid ∪ still-in-trial ∪ in-grace). */
  modules: string[];
  /** Modules actually paid for. */
  paidModules: string[];
  modulesInTrial: string[];
  anyModuleInTrial: boolean;
  modulesInGrace: string[];
  anyModuleInGrace: boolean;
  /** Server-tracked — null until the Welcome modal has been dismissed for this tenant. */
  welcomeAcknowledgedAt?: string | null;
}

export type TenantStatus = "pending_approval" | "active" | "pending_deletion" | "deactivated" | "deleting";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  currentTenantId: string | null;
  tenantRole?: string | null;
  subscription?: SubscriptionView | null;
  /** Live lifecycle status of the current tenant — null when there's no current tenant. */
  tenantStatus?: TenantStatus | null;
}

/**
 * Get the current signed-in user. Rejects (401) when there's no valid session.
 * Also populates tenantContext synchronously (not via a React effect) so the
 * very next request — even one fired from a child component's own effect in
 * the same render pass — already has X-Tenant-Id available.
 */
export const getMe = async (): Promise<AuthUser> => {
  const response = await apiClient.get(API_ROUTES.AUTH.ME);
  const user: AuthUser = response.data?.data ?? response.data;
  setCurrentTenantId(user.currentTenantId ?? null);
  return user;
};

/**
 * Initiate Azure SSO login. Routes through the Next.js proxy (/api/*) so the
 * browser stays same-origin and httpOnly cookies are set correctly on return.
 */
export const initiateAzureLogin = (): void => {
  const origin = encodeURIComponent(window.location.origin);
  window.location.href = `/api${API_ROUTES.AUTH.AZURE_LOGIN}?origin=${origin}`;
};

/** Revoke the session server-side. The refresh_token cookie is sent automatically. */
export const logout = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.LOGOUT);
};

/** Marks the Welcome modal as seen for the current tenant (server-tracked, survives reload/relogin). */
export const acknowledgeWelcome = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.ACKNOWLEDGE_WELCOME);
};
