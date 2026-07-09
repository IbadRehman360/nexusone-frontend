/**
 * Axios API client.
 *
 * All requests go to /api/* (relative) — the Next.js rewrite proxies to the
 * backend so httpOnly cookies are included by the browser automatically.
 * No Authorization header, no cookie reads from JS.
 *
 * Simplified from production: no silent-refresh-on-401 retry loop (no
 * /auth/refresh flow wired up yet) — restore once that's ported.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCurrentTenantId } from "@/src/lib/tenantContext";

const TENANT_HEADER_EXEMPT = new Set(["/auth/me", "/auth/azure/login", "/auth/logout", "/tenants"]);

function isTenantHeaderExempt(url: string | undefined): boolean {
  if (!url) return false;
  return TENANT_HEADER_EXEMPT.has(url.split("?")[0]);
}

// Normalise Axios errors into plain Error objects with a `.status` property
// so callers don't need to unwrap AxiosError themselves.
function normalizeError(error: AxiosError): Error & { status?: number; data?: unknown } {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as Record<string, unknown>;
    const message =
      (data?.message as string) ??
      (data?.error as string) ??
      (typeof data === "string" ? data : null) ??
      `API Error ${status}`;
    return Object.assign(new Error(message), { status, data });
  }
  if (error.request) {
    return new Error("Network error — no response from server");
  }
  return error;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tenantId = getCurrentTenantId();
  if (tenantId && !isTenantHeaderExempt(config.url)) {
    config.headers.set("X-Tenant-Id", tenantId);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeError(error)),
);

export default apiClient;
