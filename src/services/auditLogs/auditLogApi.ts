import apiClient from "../client";
import { AUDIT_LOG_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string;
  userName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  action: string;
  category?: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  description: string;
  changes: unknown;
  metadata: unknown;
  method: string;
  endpoint: string;
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export type ActivityCategory = "auth" | "power_platform" | "entra" | "platform";
export type ActivityStatus = "success" | "failed";

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  /** The specific resource *name* (entityName), when one was recorded — e.g.
   * "test group new". Absent for actions with no named target (login, etc.).
   * Used as the friendly secondary line under the action label. */
  resourceName?: string;
  environment: string;
  environmentUrl?: string;
  status: ActivityStatus;
  category: ActivityCategory;
}

function metadataField(metadata: unknown, key: string): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const obj = metadata as Record<string, unknown>;
  const direct = obj[key];
  if (typeof direct === "string") return direct;
  const body = obj.body;
  if (body && typeof body === "object") {
    const nested = (body as Record<string, unknown>)[key];
    if (typeof nested === "string") return nested;
  }
  return undefined;
}

const VALID_CATEGORIES: ActivityCategory[] = ["auth", "power_platform", "entra", "platform"];

export function mapAuditLogToActivity(log: AuditLog): ActivityLog {
  const category: ActivityCategory = VALID_CATEGORIES.includes(log.category as ActivityCategory) ? (log.category as ActivityCategory) : "platform";
  return {
    id: log.id,
    timestamp: log.createdAt,
    user: log.userName ?? log.userEmail,
    action: log.action,
    resource: log.entityName ?? log.entity,
    resourceName: log.entityName ?? undefined,
    environment: metadataField(log.metadata, "environmentName") ?? "—",
    environmentUrl: metadataField(log.metadata, "environmentUrl"),
    status: log.statusCode >= 400 ? "failed" : "success",
    category,
  };
}

export interface AuditLogFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<ActivityLog[]> => {
  const response = await apiClient.get(AUDIT_LOG_ROUTES.LIST, {
    params: { limit: 500, ...filters },
    headers: { "Cache-Control": "no-cache" },
  });
  const { logs } = unwrap<AuditLogsResponse>(response.data);
  return logs.map(mapAuditLogToActivity);
};
