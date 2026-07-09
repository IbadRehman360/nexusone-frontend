import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { ResourceSummary } from "@/src/types/powerPlatform";

export const getResourceSummary = async (): Promise<ResourceSummary> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_RESOURCE_SUMMARY);
  return unwrap<ResourceSummary>(response.data);
};
