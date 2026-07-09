import apiClient from "../client";
import { API_ROUTES } from "../routes";
import type { PowerApp, PowerFlow, PowerPage, DataverseTable, D365App } from "@/src/types/powerPlatformResources";

export const getEnvironmentApps = async (environmentId: string): Promise<PowerApp[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_APPS(environmentId));
  return response.data?.data ?? response.data ?? [];
};

export const getEnvironmentFlows = async (environmentId: string): Promise<PowerFlow[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_FLOWS(environmentId));
  return response.data?.data ?? response.data ?? [];
};

export const getEnvironmentPages = async (environmentId: string): Promise<PowerPage[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_PAGES(environmentId));
  return response.data?.data ?? response.data ?? [];
};

export const getEnvironmentTables = async (environmentId: string, environmentUrl: string): Promise<DataverseTable[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_TABLES(environmentId), {
    params: { environmentUrl },
  });
  return response.data?.data ?? response.data ?? [];
};

export const getEnvironmentD365Apps = async (environmentId: string): Promise<D365App[]> => {
  const response = await apiClient.get(API_ROUTES.ENVIRONMENTS.GET_D365(environmentId));
  return response.data?.data ?? response.data ?? [];
};
