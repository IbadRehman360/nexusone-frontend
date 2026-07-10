import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SubscriptionView } from "@/src/services/auth";

/**
 * "trial" is the only scenario still previewed client-side — mid-trial IS the
 * real default state for a fresh tenant, so there's no backend override to
 * switch to (see DevTestingPanel). "grace"/"locked"/"active" used to be faked
 * the same way, but that only ever changed what the header chip displayed —
 * real module pages, the Billing page, and the invite picker stayed on the
 * tenant's actual (usually TRIAL) state, which is what "not working
 * correctly" meant in practice. Those three now hit the real backend
 * impersonation endpoints (see impersonationApi.ts) instead of living here.
 */
export type DevTrialScenario = "trial" | "needs-connect";

const SCENARIO_OVERRIDE: Record<DevTrialScenario, Partial<SubscriptionView>> = {
  trial: {
    status: "TRIAL",
    daysRemaining: 5,
    hoursRemaining: null,
    modules: ["entra", "pp", "purview"],
    paidModules: [],
    anyModuleInTrial: true,
    modulesInTrial: ["purview"],
    anyModuleInGrace: false,
    modulesInGrace: [],
  },
  // Previews the "purchased but not yet connected" state (Connect banner +
  // sample data) without a real Stripe purchase or real Microsoft consent —
  // pins Power Platform as paid, real ServicePrincipal state stays empty.
  "needs-connect": {
    status: "ACTIVE",
    daysRemaining: null,
    hoursRemaining: null,
    modules: ["entra", "pp", "purview"],
    paidModules: ["pp"],
    connectedModules: [],
    anyModuleInTrial: false,
    modulesInTrial: [],
    anyModuleInGrace: false,
    modulesInGrace: [],
  },
};

interface TrialState {
  scenario: DevTrialScenario | null;
}

const initialState: TrialState = { scenario: null };

const trialSlice = createSlice({
  name: "trial",
  initialState,
  reducers: {
    setDevTrialScenario(state, action: PayloadAction<DevTrialScenario | null>) {
      state.scenario = action.payload;
    },
    clearDevTrialScenario(state) {
      state.scenario = null;
    },
  },
});

export function resolveTrialOverride(scenario: DevTrialScenario | null): Partial<SubscriptionView> | null {
  return scenario ? SCENARIO_OVERRIDE[scenario] : null;
}

export const { setDevTrialScenario, clearDevTrialScenario } = trialSlice.actions;
export default trialSlice.reducer;
