import { useState, useCallback, useRef, type RefObject, type MouseEvent } from 'react';

export interface MouseTrackingState {
  /** Current X position relative to chart area, null when not hovering */
  x: number | null;
  /** Whether the mouse is currently over the chart */
  isHovering: boolean;
}

export interface UseMouseTrackingOptions {
  /** Left margin offset */
  marginLeft?: number;
  /** Chart width (excluding margins) */
  chartWidth: number;
}

export interface UseMouseTrackingResult {
  /** Ref to attach to the SVG element */
  svgRef: RefObject<SVGSVGElement>;
  /** Current mouse state */
  mouse: MouseTrackingState;
  /** Handler for mouse move events */
  handleMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
  /** Handler for mouse leave events */
  handleMouseLeave: () => void;
}

/**
 * Hook for tracking mouse position over a chart
 * Returns position relative to the chart area (accounting for margins)
 */
export function useMouseTracking({
  marginLeft = 0,
  chartWidth,
}: UseMouseTrackingOptions): UseMouseTrackingResult {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mouse, setMouse] = useState<MouseTrackingState>({
    x: null,
    isHovering: false,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - marginLeft;
      
      if (x >= 0 && x <= chartWidth) {
        setMouse({ x, isHovering: true });
      } else {
        setMouse({ x: null, isHovering: false });
      }
    },
    [marginLeft, chartWidth]
  );

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: null, isHovering: false });
  }, []);

  return {
    svgRef,
    mouse,
    handleMouseMove,
    handleMouseLeave,
  };
}
