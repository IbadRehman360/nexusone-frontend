/**
 * Entra ID licensing types — mirrors entra-id.types.ts DTOs exactly.
 * Field names match the backend's real CostAnalysis shape
 * (totalMonthlySpend / totalWastedMonthly / totalPotentialSavings),
 * NOT the old frontend's stale LicenseCostSummary field names.
 */

export type EntraTier = "free" | "p1" | "p2";

export interface EntraTierInfo {
  tier: EntraTier;
  hasP1: boolean;
  hasP2: boolean;
}

/** GET /entra-id/licenses */
export interface LicenseSummary {
  skuId: string;
  skuPartNumber: string;
  name: string;
  total: number;
  consumed: number;
  available: number;
}

/** GET /entra-id/licenses/users */
export interface UserLicenseSummary {
  userId: string;
  displayName: string;
  email: string;
  licenses: string[];
}

/** GET /entra-id/licenses/usage */
export interface UserActivitySummary {
  userId: string;
  displayName: string;
  userPrincipalName: string;
  lastSignInDateTime: string | null;
  assignedProducts: string[];
}

/** Per-license cost breakdown inside CostAnalysis.licenses */
export interface LicenseCostItem {
  skuId: string;
  skuPartNumber: string;
  name: string;
  pricePerUser: number;
  priceSource: "hardcoded";
  total: number;
  consumed: number;
  available: number;
  totalMonthlyCost: number;
}

/** Per-user cost record inside CostAnalysis.users */
export interface UserCostItem {
  userId: string;
  displayName: string;
  userPrincipalName: string;
  licenses: string[];
  monthlyCost: number;
  annualCost: number;
  lastSignInDateTime: string | null;
  isInactive: boolean;
  daysSinceLastSignIn: number | null;
}

/** Inactive-user waste record inside CostAnalysis.waste */
export interface WasteItem {
  userId: string;
  displayName: string;
  userPrincipalName: string;
  licenses: string[];
  monthlyCost: number;
  daysSinceLastSignIn: number | null;
  recommendation: "deprovision" | "downgrade";
  reason: string;
}

/** GET /entra-id/licenses/costs */
export interface CostAnalysis {
  summary: {
    totalMonthlySpend: number;
    totalAnnualSpend: number;
    totalWastedMonthly: number;
    totalPotentialSavings: number;
    currency: string;
  };
  licenses: LicenseCostItem[];
  users: UserCostItem[];
  waste: WasteItem[];
  meta: { generatedAt: string; priceSource: string };
}

/** GET /entra-id/licenses/users/:userId */
export interface UserLicenseDetail {
  skuId: string;
  skuPartNumber: string;
  name: string;
  servicePlans: { servicePlanName: string; provisioningStatus: string }[];
}

export interface AssignLicensePayload {
  userId: string;
  skuId: string;
  disabledPlans?: string[];
}

export interface RevokeLicensePayload {
  userId: string;
  skuId: string;
}
