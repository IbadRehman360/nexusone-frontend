import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { setCurrentTenantId } from "@/src/lib/tenantContext";
import { unwrap } from "../unwrap";

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
  /** Opt-in TOTP 2FA — whether it's currently enabled for this account. */
  mfaEnabled?: boolean;
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

// ── 2FA (TOTP) ───────────────────────────────────────────────────────────────

/**
 * Completes a login held pending 2FA (after SSO or password auth succeeded
 * but the account has mfaEnabled). Reads the pending session from the
 * mfa_pending_token httpOnly cookie server-side — nothing else to pass here.
 */
export const verifyMfaLogin = async (code: string): Promise<{ mfaRequired: false; user: AuthUser }> => {
  const response = await apiClient.post(API_ROUTES.AUTH.MFA_VERIFY, { code });
  return unwrap(response.data);
};

/** Starts 2FA setup — returns a QR code (data URL) and a manual entry key. Not yet enabled until confirmed. */
export const startMfaSetup = async (): Promise<{ qrCode: string; manualKey: string }> => {
  const response = await apiClient.post(API_ROUTES.AUTH.MFA_SETUP);
  return unwrap(response.data);
};

/** Confirms 2FA setup with a code from the authenticator app and enables it. */
export const confirmMfaSetup = async (code: string): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.MFA_VERIFY_SETUP, { code });
};

/** Disables 2FA for the caller's own account — requires a current valid code. */
export const disableMfa = async (code: string): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.MFA_DISABLE, { code });
};
