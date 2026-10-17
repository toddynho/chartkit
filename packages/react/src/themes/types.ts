/**
 * Theme color configuration for ChartKit components
 */
export interface ChartTheme {
  /** Theme display name */
  name: string;
  /** Primary background color */
  bg: string;
  /** Secondary/elevated background color */
  bgSecondary: string;
  /** Card/panel background color */
  bgCard: string;
  /** Primary text color */
  text: string;
  /** Secondary text color */
  textSecondary: string;
  /** Muted/disabled text color */
  textMuted: string;
  /** Border color */
  border: string;
  /** Grid line color */
  gridLine: string;
  /** Array of chart series colors (legacy, use for backwards compatibility) */
  colors: string[];
  /** Extended series colors - harmonious palette for multi-series charts */
  series?: string[];
  /** Accent color for highlights */
  accent: string;
  /** Positive/success indicator color */
  positive: string;
  /** Negative/error indicator color */
  negative: string;
  /** Optional baseline color for certain charts */
  baseline?: string;
}

/**
 * Available theme names
 */
export type ThemeName = 
  // Dark themes
  | 'midnight'
  | 'emerald'
  | 'mono'
  | 'slate'
  | 'arctic'
  | 'orchid'
  | 'obsidian'
  | 'neon'
  | 'mocha'
  | 'owl'
  | 'retro'
  | 'copper'
  | 'rose'
  // Light themes
  | 'sunset'
  | 'silver'
  | 'pearl'
  | 'latte';

/**
 * Theme registry type
 */
export type ThemeRegistry = Record<ThemeName, ChartTheme>;
