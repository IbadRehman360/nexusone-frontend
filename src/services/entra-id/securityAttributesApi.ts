import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  CsaCategory,
  CsaUser,
  CsaServicePrincipal,
  CreateAttributePayload,
  AssignAttributePayload,
  BulkAttributePayload,
  BulkAttributeResult,
} from "@/src/types/securityAttributes";

export const fetchCsaAttributes = async (): Promise<CsaCategory[]> => {
  const response = await apiClient.get(API_ROUTES.CSA.ATTRIBUTES);
  return unwrap<CsaCategory[]>(response.data) ?? [];
};

export const createCsaAttribute = async (payload: CreateAttributePayload): Promise<void> => {
  await apiClient.post(API_ROUTES.CSA.ATTRIBUTES, payload);
};

export const fetchCsaUsers = async (): Promise<CsaUser[]> => {
  const response = await apiClient.get(API_ROUTES.CSA.USERS);
  return unwrap<CsaUser[]>(response.data) ?? [];
};

export const assignCsaAttribute = async (userId: string, payload: AssignAttributePayload): Promise<void> => {
  await apiClient.patch(API_ROUTES.CSA.ASSIGN_ATTRIBUTE(userId), payload);
};

export const removeCsaAttribute = async (userId: string, setId: string, name: string, isCollection = false): Promise<void> => {
  await apiClient.delete(API_ROUTES.CSA.REMOVE_ATTRIBUTE(userId, setId, name), { params: { isCollection: String(isCollection) } });
};

export const fetchCsaServicePrincipals = async (): Promise<CsaServicePrincipal[]> => {
  const response = await apiClient.get(API_ROUTES.CSA.SERVICE_PRINCIPALS);
  return unwrap<CsaServicePrincipal[]>(response.data) ?? [];
};

export const assignCsaSpAttribute = async (spId: string, payload: AssignAttributePayload): Promise<void> => {
  await apiClient.patch(API_ROUTES.CSA.ASSIGN_SP_ATTRIBUTE(spId), payload);
};

export const removeCsaSpAttribute = async (spId: string, setId: string, name: string, isCollection = false): Promise<void> => {
  await apiClient.delete(API_ROUTES.CSA.REMOVE_SP_ATTRIBUTE(spId, setId, name), { params: { isCollection: String(isCollection) } });
};

export const bulkCsaAttribute = async (payload: BulkAttributePayload): Promise<BulkAttributeResult> => {
  const response = await apiClient.post(API_ROUTES.CSA.BULK, payload);
  return unwrap<BulkAttributeResult>(response.data) ?? { updated: 0, failed: 0 };
};
