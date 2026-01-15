import { useMemo } from 'react';

let idCounter = 0;

/**
 * Generates a unique ID for SVG elements like filters and gradients
 * Ensures IDs are unique across multiple chart instances
 */
export function useUniqueId(prefix: string = 'chartkit'): string {
  return useMemo(() => {
    idCounter += 1;
    return `${prefix}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`;
  }, [prefix]);
}
