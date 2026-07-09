import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { PaginationOptions } from "@/src/types/api";

/**
 * Normalize API responses that may come back in any of these shapes:
 *   1. Plain array:              [...items]
 *   2. Standard envelope:        { success: true, data: [...], meta?: {...} }
 *   3. Backend paginated format: { success: true, data: { data: [], meta: { total, page, page_size, total_pages } } }
 *   4. Alt paginated format:     { success: true, data: { items: [], total, page, pageSize } }
 *   5. Old paginated format:     { data: [...], total, page, pageSize }  (no success key)
 *
 * Always returns { success, data, meta? } so callers stay uniform.
 */
export type NormalizedApiResult<T = unknown> = { success: boolean; data: T[]; meta?: Record<string, unknown> };

export function normalizeResponse<T = unknown>(raw: unknown): NormalizedApiResult<T> {
  if (Array.isArray(raw)) {
    return { success: true, data: raw };
  }

  const obj = raw as Record<string, unknown>;

  if (obj && obj.success === true && obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const dataObj = obj.data as Record<string, unknown>;

    if (Array.isArray(dataObj.data)) {
      return { success: true, data: dataObj.data as T[], meta: (dataObj.meta as Record<string, unknown>) ?? {} };
    }

    if (Array.isArray(dataObj.items)) {
      return {
        success: true,
        data: dataObj.items as T[],
        meta: { total: dataObj.total, page: dataObj.page, pageSize: dataObj.pageSize },
      };
    }
  }

  if (obj && !('success' in obj) && Array.isArray(obj.data)) {
    return {
      success: true,
      data: obj.data as T[],
      meta: (obj.meta as Record<string, unknown>) ?? { total: obj.total, page: obj.page, pageSize: obj.pageSize },
    };
  }

  return obj as NormalizedApiResult<T>;
}

export interface CreateEnvironmentPayload {
  displayName: string;
  location: string;
  environmentSku: string;
  description?: string;
  addDataverse?: boolean;
  isManaged?: boolean;
}

export const createEnvironment = async (payload: CreateEnvironmentPayload) => {
  const response = await apiClient.post(API_ROUTES.ENVIRONMENTS.CREATE, payload);
  return unwrap(response.data);
};

export interface UpdateEnvironmentPayload {
  displayName?: string;
  description?: string;
}

export const updateEnvironment = async (environmentId: string, payload: UpdateEnvironmentPayload) => {
  const response = await apiClient.patch(API_ROUTES.ENVIRONMENTS.UPDATE(environmentId), payload);
  return unwrap(response.data);
};

export const getEnvironments = async (state?: string) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_ALL, {
    params: state ? { state } : undefined,
  });
  return normalizeResponse(response.data);
};

export const getEnvironmentSecurityGroup = async (environmentId: string, environmentUrl: string) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_SECURITY_GROUP, {
    params: { environmentId, environmentUrl },
  });
  return unwrap(response.data);
};

export const getEnvironmentBusinessUnits = async (environmentUrl: string, options?: PaginationOptions) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_BUSINESS_UNITS, {
    params: {
      environmentUrl,
      ...(options?.page && { page: options.page }),
      ...(options?.pageSize && { page_size: options.pageSize }),
      ...(options?.search && { search: options.search }),
    },
  });
  return normalizeResponse(response.data);
};

export const getEnvironmentRoles = async (environmentUrl: string, businessUnitId?: string, options?: PaginationOptions) => {
  const params: Record<string, string | number> = { environmentUrl };
  if (businessUnitId) params.businessUnitId = businessUnitId;
  if (options?.page) params.page = options.page;
  if (options?.pageSize) params.page_size = options.pageSize;
  if (options?.search) params.search = options.search;

  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_ROLES, { params });
  return normalizeResponse(response.data);
};

export const getEnvironmentsWithTeams = async (options?: PaginationOptions) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_WITH_TEAMS, {
    params: {
      ...(options?.page && { page: options.page }),
      ...(options?.pageSize && { page_size: options.pageSize }),
      ...(options?.search && { search: options.search }),
    },
  });
  return normalizeResponse(response.data);
};

export const getEnvironmentsWithUsers = async (options?: PaginationOptions) => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_WITH_USERS, {
    params: {
      ...(options?.page && { page: options.page }),
      ...(options?.pageSize && { page_size: options.pageSize }),
      ...(options?.search && { search: options.search }),
    },
  });
  return normalizeResponse(response.data);
};
