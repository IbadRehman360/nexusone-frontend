import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  tenantRole: string | null;
  isOnline: boolean;
  lastSeen: string | null;
}

interface PlatformState {
  presenceMap: Record<string, { isOnline: boolean; lastSeen: string }>;
}

const initialState: PlatformState = {
  presenceMap: {},
};

const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    setPresenceSnapshot(state, action: PayloadAction<{ onlineUserIds: string[] }>) {
      const now = new Date().toISOString();
      const onlineSet = new Set(action.payload.onlineUserIds);
      for (const id of onlineSet) {
        state.presenceMap[id] = { isOnline: true, lastSeen: now };
      }
      for (const id of Object.keys(state.presenceMap)) {
        if (!onlineSet.has(id)) state.presenceMap[id] = { ...state.presenceMap[id], isOnline: false };
      }
    },
    markUserOnline(state, action: PayloadAction<{ userId: string }>) {
      state.presenceMap[action.payload.userId] = { isOnline: true, lastSeen: new Date().toISOString() };
    },
    markUserOffline(state, action: PayloadAction<{ userId: string }>) {
      state.presenceMap[action.payload.userId] = { isOnline: false, lastSeen: new Date().toISOString() };
    },
    clearPresence(state) {
      state.presenceMap = {};
    },
  },
});

export const { setPresenceSnapshot, markUserOnline, markUserOffline, clearPresence } = platformSlice.actions;
export default platformSlice.reducer;
