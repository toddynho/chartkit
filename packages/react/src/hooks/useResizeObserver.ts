import { useState, useEffect, useRef, type RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

export interface UseResizeObserverResult<T extends HTMLElement = HTMLElement> {
  /** Ref to attach to the container element */
  ref: RefObject<T>;
  /** Current size of the element */
  size: Size;
  /** Whether the element has been measured at least once */
  ready: boolean;
}

/**
 * Hook for observing element size changes
 * Uses ResizeObserver for efficient size tracking
 * 
 * @example
 * ```tsx
 * function ResponsiveChart({ data }) {
 *   const { ref, size, ready } = useResizeObserver<HTMLDivElement>();
 *   
 *   return (
 *     <div ref={ref} style={{ width: '100%' }}>
 *       {ready && (
 *         <MonitorLine
 *           data={data}
 *           width={size.width}
 *           // ...
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(): UseResizeObserverResult<T> {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Get initial size
    const { width, height } = element.getBoundingClientRect();
    setSize({ width, height });
    setReady(true);

    // Create observer
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, size, ready };
}

/**
 * Hook that returns just the width of a container
 * Useful for making charts responsive
 * 
 * @example
 * ```tsx
 * function ResponsiveChart({ data }) {
 *   const { ref, width } = useContainerWidth<HTMLDivElement>();
 *   
 *   return (
 *     <div ref={ref} style={{ width: '100%' }}>
 *       {width > 0 && (
 *         <MonitorLine data={data} width={width} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>(): {
  ref: RefObject<T>;
  width: number;
} {
  const { ref, size } = useResizeObserver<T>();
  return { ref, width: size.width };
}
