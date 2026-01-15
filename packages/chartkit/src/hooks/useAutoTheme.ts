import { useState, useEffect } from 'react';
import type { ThemeName } from '../themes';

export interface UseAutoThemeOptions {
  /** Theme to use when system/page is in light mode */
  light: ThemeName;
  /** Theme to use when system/page is in dark mode */
  dark: ThemeName;
  /** Selector to observe for class changes (default: 'html') */
  selector?: string;
  /** Class that indicates dark mode (default: 'dark') */
  darkClass?: string;
  /** Use system preference instead of DOM class (default: false) */
  useSystemPreference?: boolean;
}

/**
 * Hook for automatic theme switching based on dark/light mode
 * 
 * Works with:
 * - next-themes (observes 'dark' class on html element)
 * - Tailwind dark mode
 * - System preference via prefers-color-scheme
 * 
 * @example
 * ```tsx
 * // With next-themes or Tailwind dark mode
 * const theme = useAutoTheme({ light: 'sunset', dark: 'neon' });
 * 
 * // With system preference
 * const theme = useAutoTheme({ 
 *   light: 'sunset', 
 *   dark: 'midnight',
 *   useSystemPreference: true 
 * });
 * 
 * <MonitorLine data={data} theme={theme} />
 * ```
 */
export function useAutoTheme({
  light,
  dark,
  selector = 'html',
  darkClass = 'dark',
  useSystemPreference = false,
}: UseAutoThemeOptions): ThemeName {
  const [theme, setTheme] = useState<ThemeName>(light);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    if (useSystemPreference) {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateTheme = () => {
        setTheme(mediaQuery.matches ? dark : light);
      };

      // Set initial value
      updateTheme();

      // Listen for changes
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      // Observe DOM class changes (works with next-themes, Tailwind, etc.)
      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`useAutoTheme: Element not found for selector "${selector}"`);
        return;
      }

      const updateTheme = () => {
        const isDark = element.classList.contains(darkClass);
        setTheme(isDark ? dark : light);
      };

      // Set initial value
      updateTheme();

      // Observe class changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            updateTheme();
            break;
          }
        }
      });

      observer.observe(element, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });

      return () => observer.disconnect();
    }
  }, [light, dark, selector, darkClass, useSystemPreference]);

  return theme;
}
