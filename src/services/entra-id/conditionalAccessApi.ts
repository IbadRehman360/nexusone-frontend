import apiClient from "../client";
import { API_ROUTES } from "../routes";
import { unwrap } from "../unwrap";
import type {
  CaCatalog,
  CaPolicyDetail,
  CaConditionsTab,
  CaControlsTab,
  CaCoverageTab,
  CaActivityTab,
  CaCompareGrid,
} from "@/src/types/conditionalAccess";

const EMPTY_CATALOG: CaCatalog = {
  items: [],
  stats: { total: 0, enforced: 0, reportOnly: 0, coverageGaps: 0 },
  recommendations: { recommendations: [], completionScore: 0, passedChecks: 0, totalChecks: 0 },
};

export const fetchCaCatalog = async (): Promise<CaCatalog> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.GET_ALL);
  return unwrap<CaCatalog>(response.data) ?? EMPTY_CATALOG;
};

export const fetchCaOverview = async (id: string): Promise<CaPolicyDetail | null> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.GET_BY_ID(id));
  return unwrap<CaPolicyDetail | null>(response.data) ?? null;
};

const EMPTY_CONDITIONS: CaConditionsTab = {
  users: { include: [], exclude: [], includeRoles: [], excludeRoles: [], includeGuestsExternal: false },
  applications: { include: [], exclude: [], userActions: [] },
  platforms: { include: [], exclude: [] },
  locations: { include: [], exclude: [] },
  clientAppTypes: [],
  risk: { userRiskLevels: [], signInRiskLevels: [], p2Available: false },
};

export const fetchCaConditions = async (id: string): Promise<CaConditionsTab> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.CONDITIONS(id));
  return unwrap<CaConditionsTab>(response.data) ?? EMPTY_CONDITIONS;
};

const EMPTY_CONTROLS: CaControlsTab = {
  grant: { operator: "OR", mfa: false, compliantDevice: false, domainJoined: false, block: false, authStrength: null, otherControls: [] },
  session: { signInFrequency: null, persistentBrowser: null, appEnforcedRestrictions: false, continuousAccessEvaluation: null },
};

export const fetchCaControls = async (id: string): Promise<CaControlsTab> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.CONTROLS(id));
  return unwrap<CaControlsTab>(response.data) ?? EMPTY_CONTROLS;
};

const EMPTY_COVERAGE: CaCoverageTab = { gaps: [], legacyAuthBlocked: false, allUsersHaveMfa: false, breakGlassExcluded: true };

export const fetchCaCoverage = async (id: string): Promise<CaCoverageTab> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.COVERAGE(id));
  return unwrap<CaCoverageTab>(response.data) ?? EMPTY_COVERAGE;
};

const EMPTY_ACTIVITY: CaActivityTab = { changes: [] };

export const fetchCaActivity = async (id: string): Promise<CaActivityTab> => {
  const response = await apiClient.get(API_ROUTES.CONDITIONAL_ACCESS.ACTIVITY(id));
  return unwrap<CaActivityTab>(response.data) ?? EMPTY_ACTIVITY;
};

const EMPTY_COMPARE_GRID: CaCompareGrid = { tenants: [], checks: [], cells: {} };

export const compareCaTenants = async (tenantIds: string[]): Promise<CaCompareGrid> => {
  const response = await apiClient.post(API_ROUTES.CONDITIONAL_ACCESS.COMPARE, { tenantIds });
  return unwrap<CaCompareGrid>(response.data) ?? EMPTY_COMPARE_GRID;
};
