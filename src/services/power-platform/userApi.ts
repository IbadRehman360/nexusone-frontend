import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export const updateUserRoles = async (environmentUrl: string, userId: string, roleId: string[]) => {
  const response = await apiClient.post(API_ROUTES.USERS.UPDATE_ROLES, { environmentUrl, userId, roleId });
  return unwrap(response.data);
};

export const changeUserBusinessUnit = async (environmentUrl: string, userId: string, businessUnitId: string) => {
  const response = await apiClient.patch(API_ROUTES.USERS.CHANGE_BUSINESS_UNIT, {
    environmentUrl,
    userId,
    businessUnitId,
  });
  return unwrap(response.data);
};
