'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { themes, type ThemeName, type ChartTheme } from '@derpdaderp/chartkit';

interface ChartThemeContextValue {
  themeName: ThemeName;
  theme: ChartTheme;
  setThemeName: (name: ThemeName) => void;
  allThemes: typeof themes;
}

const ChartThemeContext = createContext<ChartThemeContextValue | null>(null);

interface ChartThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export function ChartThemeProvider({ children, defaultTheme = 'sunset' }: ChartThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme);

  // On mount, restore from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('chartkit-theme') as ThemeName | null;
    if (stored && themes[stored]) {
      setThemeNameState(stored);
    }
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    // Persist to localStorage
    localStorage.setItem('chartkit-theme', name);
  }, []);

  const value: ChartThemeContextValue = {
    themeName,
    theme: themes[themeName],
    setThemeName,
    allThemes: themes,
  };

  return (
    <ChartThemeContext.Provider value={value}>
      {children}
    </ChartThemeContext.Provider>
  );
}

export function useChartTheme() {
  const context = useContext(ChartThemeContext);
  if (!context) {
    throw new Error('useChartTheme must be used within a ChartThemeProvider');
  }
  return context;
}

// Export theme colors for the switcher (using each theme's accent color)
export const themeColors: Record<ThemeName, string> = {
  // Dark themes
  midnight: '#22d3ee',
  emerald: '#06b6d4',
  mono: '#ffffff',
  slate: '#58a6ff',
  arctic: '#88c0d0',
  orchid: '#bd93f9',
  obsidian: '#61afef',
  neon: '#7aa2f7',
  mocha: '#89b4fa',
  owl: '#82aaff',
  retro: '#ff7edb',
  copper: '#fabd2f',
  rose: '#c4a7e7',
  // Light themes
  sunset: '#f59e0b',
  silver: '#0969da',
  pearl: '#4078f2',
  latte: '#1e66f5',
};

// Theme categories for grouping in the UI
export const darkThemes: ThemeName[] = [
  'midnight', 'emerald', 'mono', 'slate', 'arctic', 'orchid',
  'obsidian', 'neon', 'mocha', 'owl', 'retro', 'copper', 'rose'
];

export const lightThemes: ThemeName[] = [
  'sunset', 'silver', 'pearl', 'latte'
];
