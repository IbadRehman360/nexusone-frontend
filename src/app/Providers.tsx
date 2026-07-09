'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { store, persistor } from '@/src/store';
import { queryClient } from '@/src/lib/query/queryClient';
import { ThemeCustomizationEffect } from '@/src/components/theme/ThemeCustomizationEffect';
import { DevTestingPanel } from '@/src/components/dev/DevTestingPanel';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemeCustomizationEffect />
            {children}
            <DevTestingPanel />
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
