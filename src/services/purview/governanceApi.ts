import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type { GovernanceActivity } from "@/src/types/purview";

export interface GovernanceActivityResponse {
  purviewActivity: GovernanceActivity[];
  entraActivity: GovernanceActivity[];
}

export const fetchGovernanceActivity = async (): Promise<GovernanceActivityResponse> => {
  const response = await apiClient.get(API_ROUTES.GOVERNANCE_ACTIVITY);
  return unwrap<GovernanceActivityResponse>(response.data) ?? { purviewActivity: [], entraActivity: [] };
};
