import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { WebStorage } from 'redux-persist/es/types';

import themeReducer from './slices/themeSlice';
import themeCustomizationReducer from './slices/themeCustomizationSlice';
import platformReducer from './slices/platformSlice';
import trialReducer from './slices/trialSlice';

// `redux-persist/lib/storage`'s prebuilt default instance probes
// `window.localStorage` the moment the module is imported, so a plain
// `import storage from 'redux-persist/lib/storage'` still fires the probe
// during Next.js SSR even if the binding is never used server-side. Import
// the un-instantiated factory instead and only call it in the browser.
const noopStorage: WebStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

const clientStorage: WebStorage = typeof window !== 'undefined' ? createWebStorage('local') : noopStorage;

const themePersistConfig = {
  key: 'theme',
  storage: clientStorage,
  whitelist: ['theme'],
};

const themeCustomizationPersistConfig = {
  key:     'themeCustomization',
  storage: clientStorage,
};

const rootReducer = combineReducers({
  theme: persistReducer(themePersistConfig, themeReducer),
  themeCustomization: persistReducer(themeCustomizationPersistConfig, themeCustomizationReducer),
  platform: platformReducer,
  trial: trialReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
