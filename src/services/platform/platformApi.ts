import apiClient from "../client";
import { PLATFORM_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export interface PlatformUserDto {
  userId: string;
  email: string;
  fullName: string;
  tenantRole: string | null;
  isOnline: boolean;
  lastSeen: string | null;
}

export const getPlatformUsers = async (): Promise<PlatformUserDto[]> => {
  const response = await apiClient.get(PLATFORM_ROUTES.USERS);
  return unwrap<PlatformUserDto[]>(response.data) ?? [];
};
