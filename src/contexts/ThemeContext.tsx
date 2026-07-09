/**
 * Theme Context
 * Thin wrapper around Redux theme slice.
 * Keeps DOM side-effects (data-theme attribute, system preference listener).
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setTheme as setThemeAction, type Theme } from '@/src/store/slices/themeSlice';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

  // Update DOM and resolve system preference
  useEffect(() => {
    const root = document.documentElement;

    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
        root.setAttribute('data-theme', systemTheme);
      } else {
        setEffectiveTheme(theme);
        root.setAttribute('data-theme', theme);
      }
    };

    updateEffectiveTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') updateEffectiveTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    dispatch(setThemeAction(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
