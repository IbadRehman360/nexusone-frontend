import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { IntegrationsHealth } from "@/src/types/purview";

export const fetchIntegrationsHealth = async (): Promise<IntegrationsHealth | null> => {
  const response = await apiClient.get(API_ROUTES.INTEGRATIONS_HEALTH);
  return unwrap<IntegrationsHealth | null>(response.data) ?? null;
};
