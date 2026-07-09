import apiClient from "../client";
import { INVITATION_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
  tenantId: string;
  status: InvitationStatus;
  expiresAt?: string;
  createdAt: string;
  invitedBy?: { id: string; email: string; fullName: string };
}

export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get(INVITATION_ROUTES.LIST);
  return unwrap<Invitation[]>(response.data) ?? [];
};

export const createInvitation = async (payload: { email: string; roleId: string; targetTenantId: string }): Promise<Invitation> => {
  const response = await apiClient.post(INVITATION_ROUTES.CREATE, payload);
  return unwrap<Invitation>(response.data);
};

export const resendInvitation = async (id: string): Promise<void> => {
  await apiClient.post(INVITATION_ROUTES.RESEND(id));
};

export const revokeInvitation = async (id: string): Promise<void> => {
  await apiClient.delete(INVITATION_ROUTES.REVOKE(id));
};
