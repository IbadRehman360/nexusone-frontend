import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SubscriptionView } from "@/src/services/auth";

export type DevTrialScenario = "trial" | "grace" | "locked" | "active";

const SCENARIO_OVERRIDE: Record<DevTrialScenario, Partial<SubscriptionView>> = {
  trial: { status: "TRIAL", daysRemaining: 5, hoursRemaining: null, anyModuleInTrial: true, modulesInTrial: ["purview"], anyModuleInGrace: false, modulesInGrace: [] },
  grace: { status: "GRACE", daysRemaining: 0, hoursRemaining: 18, anyModuleInTrial: false, modulesInTrial: [], anyModuleInGrace: true, modulesInGrace: ["purview"] },
  locked: { status: "LOCKED", daysRemaining: null, hoursRemaining: null, anyModuleInTrial: false, modulesInTrial: [], anyModuleInGrace: false, modulesInGrace: [] },
  active: { status: "ACTIVE", daysRemaining: null, hoursRemaining: null, anyModuleInTrial: false, modulesInTrial: [], anyModuleInGrace: false, modulesInGrace: [] },
};

interface TrialState {
  scenario: DevTrialScenario | null;
}

const initialState: TrialState = { scenario: null };

const trialSlice = createSlice({
  name: "trial",
  initialState,
  reducers: {
    setDevTrialScenario(state, action: PayloadAction<DevTrialScenario>) {
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
