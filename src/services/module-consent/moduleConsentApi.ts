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
}

/** Kicks off the Connect flow for one module — returns the Microsoft
 * adminconsent URL to redirect the browser to. */
export const initiateModuleConsent = async (
  service: ModuleConsentService,
): Promise<{ authorizationUrl: string }> => {
  const response = await apiClient.post(MODULE_CONSENT_ROUTES.INITIATE, { service });
  return unwrap<{ authorizationUrl: string }>(response.data);
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
