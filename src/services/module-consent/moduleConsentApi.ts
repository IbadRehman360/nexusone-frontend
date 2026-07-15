import apiClient from "../client";
import { MODULE_CONSENT_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

/** Mirrors the backend's ServiceType enum (Prisma) — the module keys used
 * here match SubscriptionView.paidModules/connectedModules, not ServiceType
 * directly; the backend does that translation. */
export type ModuleConsentService = "ENTRA_ID" | "POWER_PLATFORM" | "PURVIEW";

export interface ModuleConnectionStatus {
  status: "PROVISIONING" | "ACTIVE" | "FAILED" | "DEACTIVATED" | "REVOKED" | "NOT_CONNECTED";
  connected: boolean;
  provisionedAt: string | null;
  lastHealthCheckAt: string | null;
  failureReason: string | null;
  // True once Microsoft admin consent has actually completed. PROVISIONING
  // alone is ambiguous for Purview — it's the status both right after
  // consent completes (details not yet submitted) AND after details are
  // submitted but role grants aren't done yet. Check this (not just
  // `status`) before resuming a customer at a post-consent step.
  consentCompleted: boolean;
  // Purview-only: true once the connection-details step has saved a Purview
  // account name. Distinguishes "consent done, needs account details" from
  // "consent + details done, needs role grants" — both are PROVISIONING.
  detailsSubmitted: boolean;
}

/** Kicks off the Connect flow for one module — returns the Microsoft
 * adminconsent URL to redirect the browser to. Purview uses this same
 * generic call (no special params) — it only proves the tenant's admin
 * approved the app's Graph scopes; which Purview account is theirs is a
 * separate, later step (see setPurviewConnectionDetails). */
export const initiateModuleConsent = async (
  service: ModuleConsentService,
): Promise<{ authorizationUrl: string }> => {
  const response = await apiClient.post(MODULE_CONSENT_ROUTES.INITIATE, { service });
  return unwrap<{ authorizationUrl: string }>(response.data);
};

/** Purview's "Connection details" step — a plain save, no Microsoft redirect
 * involved. Only succeeds once admin consent has already completed (the
 * backend checks this). */
export const setPurviewConnectionDetails = async (
  accountName: string,
  logAnalyticsWorkspaceId: string,
): Promise<{ saved: boolean }> => {
  const response = await apiClient.post(MODULE_CONSENT_ROUTES.PURVIEW_DETAILS, {
    accountName,
    logAnalyticsWorkspaceId,
  });
  return unwrap<{ saved: boolean }>(response.data);
};

/** Called by the post-consent landing page after Microsoft redirects back. */
export const completeModuleConsent = async (
  state: string,
  azureTenantId: string,
): Promise<{ connected: boolean }> => {
  const response = await apiClient.post(MODULE_CONSENT_ROUTES.COMPLETE, {
    state,
    azureTenantId,
  });
  return unwrap<{ connected: boolean }>(response.data);
};

export const getModuleConnectionStatus = async (
  service: ModuleConsentService,
): Promise<ModuleConnectionStatus> => {
  const response = await apiClient.get(MODULE_CONSENT_ROUTES.STATUS, {
    params: { service },
  });
  return unwrap<ModuleConnectionStatus>(response.data);
};

export interface PurviewVerificationResult {
  purviewReachable: boolean;
  logAnalyticsReachable: boolean;
  active: boolean;
  failureReason: string | null;
}

/** Re-runs the two live checks a Purview connection needs (Purview account
 * reachable, Log Analytics workspace reachable) without forcing a restart of
 * the whole Microsoft consent flow — called by the connect wizard's "Grant
 * access" step whenever the customer says they've granted the roles. */
export const recheckPurviewConnection = async (): Promise<PurviewVerificationResult> => {
  const response = await apiClient.post(MODULE_CONSENT_ROUTES.RECHECK_PURVIEW);
  return unwrap<PurviewVerificationResult>(response.data);
};
