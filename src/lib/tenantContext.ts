/**
 * Holds the current tenant id for attaching the X-Tenant-Id header to
 * tenant-scoped API calls. Set once `/auth/me` resolves (see useAuth).
 * A plain module-level value (not Redux/Context) keeps client.ts free of
 * React/store imports — mirrors production's reason for reading tenant id
 * out of band from the request interceptor.
 */
let currentTenantId: string | null = null;

export function setCurrentTenantId(id: string | null): void {
  currentTenantId = id;
}

export function getCurrentTenantId(): string | null {
  return currentTenantId;
}
