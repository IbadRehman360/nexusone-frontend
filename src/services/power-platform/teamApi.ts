import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import { normalizeResponse } from "./environmentApi";

export interface CreateTeamPayload {
  environmentUrl: string;
  name: string;
  businessunitid: string;
  teamtype: 0 | 2;
  description?: string;
  azureactivedirectoryobjectid?: string;
  membershiptype?: 0 | 1;
}

export const createTeam = async (payload: CreateTeamPayload) => {
  const response = await apiClient.post(API_ROUTES.TEAMS.CREATE, payload);
  return unwrap(response.data);
};

export interface RawTeamRole {
  id: string;
  name: string;
}

export const getTeamRoles = async (environmentUrl: string, teamId: string) => {
  const response = await apiClient.get(API_ROUTES.TEAMS.GET_ROLES, {
    params: { environmentUrl, teamId, page_size: 500 },
  });
  return normalizeResponse<RawTeamRole>(response.data);
};

export const assignRolesToTeam = async (environmentUrl: string, teamId: string, roleId: string[]) => {
  const response = await apiClient.post(API_ROUTES.TEAMS.ASSIGN_ROLE, { environmentUrl, teamId, roleId });
  return unwrap(response.data);
};

export const changeTeamBusinessUnit = async (environmentUrl: string, teamId: string, businessUnitId: string) => {
  const response = await apiClient.patch(API_ROUTES.TEAMS.CHANGE_BUSINESS_UNIT, {
    environmentUrl,
    teamId,
    businessUnitId,
  });
  return unwrap(response.data);
};
