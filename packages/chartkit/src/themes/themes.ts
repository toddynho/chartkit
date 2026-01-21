import type { ThemeRegistry } from './types';

/**
 * Built-in themes for ChartKit
 * 
 * Dark Themes (13):
 * - midnight: Default dark theme for monitoring dashboards
 * - emerald: Dark theme with vibrant green accents
 * - mono: Minimal monochrome dark aesthetic
 * - slate: Blue-gray dark theme
 * - arctic: Cold blue color palette
 * - orchid: Dark theme with purple/pink accents
 * - obsidian: Deep dark theme with blue accent
 * - neon: Vibrant colors inspired by city lights
 * - mocha: Warm pastel dark theme
 * - owl: Deep blue theme for night coding
 * - retro: 80s neon aesthetic
 * - copper: Warm retro colors with earth tones
 * - rose: Dark theme with pink/rose accents
 * 
 * Light Themes (4):
 * - sunset: Warm light theme with orange accents
 * - silver: Clean light theme with blue accents
 * - pearl: Warm ivory light theme
 * - latte: Creamy pastel light theme
 */
export const themes: ThemeRegistry = {
  // ============================================
  // DARK THEMES
  // ============================================
  
  midnight: {
    name: 'Midnight',
    bg: '#0c0c0c',
    bgSecondary: '#141414',
    bgCard: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#6b6b6b',
    textMuted: '#404040',
    border: '#262626',
    gridLine: '#1f1f1f',
    colors: ['#4ade80', '#38bdf8', '#a78bfa', '#fb923c', '#f472b6'],
    // Muted, harmonious series palette
    series: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6'],
    accent: '#22d3ee',
    positive: '#4ade80',
    negative: '#f87171',
  },
  
  emerald: {
    name: 'Emerald',
    bg: '#0a0a0a',
    bgSecondary: '#111111',
    bgCard: '#171717',
    text: '#fafafa',
    textSecondary: '#737373',
    textMuted: '#404040',
    border: '#262626',
    gridLine: '#1a1a1a',
    colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'],
    series: ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e', '#a855f7'],
    accent: '#06b6d4',
    positive: '#10b981',
    negative: '#ef4444',
  },
  
  mono: {
    name: 'Mono',
    bg: '#000000',
    bgSecondary: '#0a0a0a',
    bgCard: '#111111',
    text: '#ededed',
    textSecondary: '#888888',
    textMuted: '#444444',
    border: '#333333',
    gridLine: '#222222',
    colors: ['#50e3c2', '#0070f3', '#7928ca', '#f5a623', '#ff0080'],
    accent: '#ffffff',
    positive: '#50e3c2',
    negative: '#ee0000',
  },
  
  slate: {
    name: 'Slate',
    bg: '#0d1117',
    bgSecondary: '#161b22',
    bgCard: '#21262d',
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    textMuted: '#484f58',
    border: '#30363d',
    gridLine: '#21262d',
    colors: ['#3fb950', '#58a6ff', '#a371f7', '#d29922', '#f85149'],
    series: ['#3fb950', '#58a6ff', '#a371f7', '#d29922', '#f778ba', '#39d353', '#f85149', '#bc8cff'],
    accent: '#58a6ff',
    positive: '#3fb950',
    negative: '#f85149',
  },
  
  arctic: {
    name: 'Arctic',
    bg: '#2e3440',
    bgSecondary: '#3b4252',
    bgCard: '#434c5e',
    text: '#eceff4',
    textSecondary: '#d8dee9',
    textMuted: '#4c566a',
    border: '#4c566a',
    gridLine: '#3b4252',
    colors: ['#88c0d0', '#81a1c1', '#b48ead', '#ebcb8b', '#a3be8c'],
    accent: '#88c0d0',
    positive: '#a3be8c',
    negative: '#bf616a',
  },
  
  orchid: {
    name: 'Orchid',
    bg: '#282a36',
    bgSecondary: '#21222c',
    bgCard: '#44475a',
    text: '#f8f8f2',
    textSecondary: '#6272a4',
    textMuted: '#44475a',
    border: '#44475a',
    gridLine: '#343746',
    colors: ['#50fa7b', '#8be9fd', '#bd93f9', '#ffb86c', '#ff79c6'],
    accent: '#bd93f9',
    positive: '#50fa7b',
    negative: '#ff5555',
  },
  
  obsidian: {
    name: 'Obsidian',
    bg: '#282c34',
    bgSecondary: '#21252b',
    bgCard: '#2c313a',
    text: '#abb2bf',
    textSecondary: '#828997',
    textMuted: '#5c6370',
    border: '#3e4451',
    gridLine: '#2c313a',
    colors: ['#98c379', '#61afef', '#c678dd', '#e5c07b', '#e06c75'],
    accent: '#61afef',
    positive: '#98c379',
    negative: '#e06c75',
  },
  
  neon: {
    name: 'Neon',
    bg: '#1a1b26',
    bgSecondary: '#16161e',
    bgCard: '#24283b',
    text: '#c0caf5',
    textSecondary: '#565f89',
    textMuted: '#3b4261',
    border: '#292e42',
    gridLine: '#1f2335',
    colors: ['#9ece6a', '#7aa2f7', '#bb9af7', '#e0af68', '#f7768e'],
    accent: '#7aa2f7',
    positive: '#9ece6a',
    negative: '#f7768e',
  },
  
  mocha: {
    name: 'Mocha',
    bg: '#1e1e2e',
    bgSecondary: '#181825',
    bgCard: '#313244',
    text: '#cdd6f4',
    textSecondary: '#a6adc8',
    textMuted: '#585b70',
    border: '#45475a',
    gridLine: '#313244',
    colors: ['#a6e3a1', '#89b4fa', '#cba6f7', '#fab387', '#f38ba8'],
    accent: '#89b4fa',
    positive: '#a6e3a1',
    negative: '#f38ba8',
  },
  
  owl: {
    name: 'Owl',
    bg: '#011627',
    bgSecondary: '#0b2942',
    bgCard: '#112630',
    text: '#d6deeb',
    textSecondary: '#7fdbca',
    textMuted: '#5f7e97',
    border: '#1d3b53',
    gridLine: '#0b2942',
    colors: ['#22da6e', '#82aaff', '#c792ea', '#ffcb8b', '#f78c6c'],
    accent: '#82aaff',
    positive: '#22da6e',
    negative: '#ef5350',
  },
  
  retro: {
    name: 'Retro',
    bg: '#262335',
    bgSecondary: '#241b2f',
    bgCard: '#34294f',
    text: '#ffffff',
    textSecondary: '#848bbd',
    textMuted: '#495495',
    border: '#495495',
    gridLine: '#34294f',
    colors: ['#72f1b8', '#36f9f6', '#fe4450', '#fede5d', '#ff7edb'],
    accent: '#ff7edb',
    positive: '#72f1b8',
    negative: '#fe4450',
  },
  
  copper: {
    name: 'Copper',
    bg: '#282828',
    bgSecondary: '#1d2021',
    bgCard: '#3c3836',
    text: '#ebdbb2',
    textSecondary: '#a89984',
    textMuted: '#665c54',
    border: '#504945',
    gridLine: '#3c3836',
    colors: ['#b8bb26', '#83a598', '#d3869b', '#fabd2f', '#fb4934'],
    accent: '#fabd2f',
    positive: '#b8bb26',
    negative: '#fb4934',
  },
  
  rose: {
    name: 'Rose',
    bg: '#191724',
    bgSecondary: '#1f1d2e',
    bgCard: '#26233a',
    text: '#e0def4',
    textSecondary: '#908caa',
    textMuted: '#6e6a86',
    border: '#403d52',
    gridLine: '#26233a',
    colors: ['#31748f', '#9ccfd8', '#c4a7e7', '#f6c177', '#ebbcba'],
    accent: '#c4a7e7',
    positive: '#9ccfd8',
    negative: '#eb6f92',
  },
  
  // ============================================
  // LIGHT THEMES
  // ============================================
  
  sunset: {
    name: 'Sunset',
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    bgCard: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    gridLine: '#f3f4f6',
    colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'],
    series: ['#059669', '#0284c7', '#7c3aed', '#d97706', '#db2777', '#0891b2', '#dc2626', '#9333ea'],
    accent: '#f59e0b',
    positive: '#10b981',
    negative: '#ef4444',
    baseline: '#ec4899',
  },
  
  silver: {
    name: 'Silver',
    bg: '#ffffff',
    bgSecondary: '#f6f8fa',
    bgCard: '#ffffff',
    text: '#24292f',
    textSecondary: '#57606a',
    textMuted: '#8c959f',
    border: '#d0d7de',
    gridLine: '#eaeef2',
    colors: ['#1a7f37', '#0969da', '#8250df', '#bf8700', '#cf222e'],
    accent: '#0969da',
    positive: '#1a7f37',
    negative: '#cf222e',
  },
  
  pearl: {
    name: 'Pearl',
    bg: '#fafafa',
    bgSecondary: '#f0f0f1',
    bgCard: '#ffffff',
    text: '#383a42',
    textSecondary: '#696c77',
    textMuted: '#a0a1a7',
    border: '#e5e5e6',
    gridLine: '#f0f0f1',
    colors: ['#50a14f', '#4078f2', '#a626a4', '#c18401', '#e45649'],
    accent: '#4078f2',
    positive: '#50a14f',
    negative: '#e45649',
  },
  
  latte: {
    name: 'Latte',
    bg: '#eff1f5',
    bgSecondary: '#e6e9ef',
    bgCard: '#ffffff',
    text: '#4c4f69',
    textSecondary: '#6c6f85',
    textMuted: '#9ca0b0',
    border: '#ccd0da',
    gridLine: '#e6e9ef',
    colors: ['#40a02b', '#1e66f5', '#8839ef', '#df8e1d', '#d20f39'],
    accent: '#1e66f5',
    positive: '#40a02b',
    negative: '#d20f39',
  },
};

/**
 * Get a theme by name with fallback to midnight
 */
export function getTheme(name: string): ThemeRegistry[keyof ThemeRegistry] {
  return themes[name as keyof ThemeRegistry] ?? themes['midnight'];
}
