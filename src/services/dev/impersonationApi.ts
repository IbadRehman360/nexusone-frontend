import apiClient from "../client";
import { DEV_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

/**
 * Dev-only RBAC role impersonation AND module-scenario override — see backend
 * ImpersonationService. Every call hits real backend endpoints:
 *   - Role impersonation re-issues the session's tokens with the target
 *     role's REAL capabilities baked in.
 *   - Module scenarios are applied live inside SubscriptionsService on every
 *     read (no token reissue needed) — real module pages actually 403 for
 *     modules the fake scenario doesn't grant, not just a UI preview.
 * Not a client-side visual fake in either case: every subsequent API call is
 * actually authorized/gated as the selected state until reverted.
 */

export type ModuleScenario = "all-unlocked" | "trial-ended" | "trial-ended-pp-only" | "grace-period";

export interface ImpersonationStatus {
  eligible: boolean;
  roles: string[];
  moduleScenarios: ModuleScenario[];
  active: string | null;
  activeModuleScenario: ModuleScenario | null;
}

export const getImpersonationStatus = async (): Promise<ImpersonationStatus> => {
  const response = await apiClient.get(DEV_ROUTES.IMPERSONATE_STATUS);
  return unwrap<ImpersonationStatus>(response.data);
};

export const startImpersonation = async (roleName: string): Promise<void> => {
  await apiClient.post(DEV_ROUTES.START_ROLE, { roleName });
};

export const stopImpersonation = async (): Promise<void> => {
  await apiClient.delete(DEV_ROUTES.STOP_ROLE);
};

export const startModuleScenario = async (scenario: ModuleScenario): Promise<void> => {
  await apiClient.post(DEV_ROUTES.START_MODULE_SCENARIO, { scenario });
};

export const stopModuleScenario = async (): Promise<void> => {
  await apiClient.delete(DEV_ROUTES.STOP_MODULE_SCENARIO);
};

/** Destructive — wipes the caller's whole Organization so the next sign-in re-triggers onboarding from scratch. */
export const resetOwnOnboarding = async (): Promise<{ organizationId: string; tenantIds: string[] }> => {
  const response = await apiClient.post(DEV_ROUTES.RESET_ONBOARDING);
  return unwrap(response.data);
};

/** Flips the caller's current tenant between `active` and `pending_approval` for testing the holding screen. */
export const toggleTenantStatus = async (): Promise<{ status: string }> => {
  const response = await apiClient.post(DEV_ROUTES.TOGGLE_TENANT_STATUS);
  return unwrap(response.data);
};
