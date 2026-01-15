import { useState, useEffect, useMemo, type CSSProperties } from 'react';

export interface AnimationConfig {
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Easing function */
  easing?: string;
}

export interface UseAnimatedMountResult {
  /** Whether the animation has completed */
  isAnimated: boolean;
  /** Progress from 0 to 1 */
  progress: number;
  /** CSS styles for fade-in animation */
  fadeStyle: CSSProperties;
  /** CSS styles for scale animation */
  scaleStyle: CSSProperties;
  /** SVG path styles for draw animation (use with strokeDasharray/strokeDashoffset) */
  getPathStyle: (pathLength: number) => CSSProperties;
}

/**
 * Hook for animating component mount
 * Provides various animation styles for different chart elements
 * 
 * @example
 * ```tsx
 * function AnimatedSparkline({ data }) {
 *   const { isAnimated, getPathStyle } = useAnimatedMount({ duration: 800 });
 *   
 *   const pathLength = 500; // Calculate from path
 *   
 *   return (
 *     <svg>
 *       <path
 *         d={pathD}
 *         style={getPathStyle(pathLength)}
 *       />
 *     </svg>
 *   );
 * }
 * ```
 */
export function useAnimatedMount({
  duration = 600,
  delay = 0,
  easing = 'ease-out',
}: AnimationConfig = {}): UseAnimatedMountResult {
  const [progress, setProgress] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const startTime = performance.now() + delay;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const rawProgress = Math.min(elapsed / duration, 1);
      // Apply easing (simple ease-out)
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      
      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, delay]);

  const fadeStyle = useMemo<CSSProperties>(() => ({
    opacity: progress,
    transition: `opacity ${duration}ms ${easing}`,
  }), [progress, duration, easing]);

  const scaleStyle = useMemo<CSSProperties>(() => ({
    transform: `scale(${progress})`,
    transformOrigin: 'center',
    transition: `transform ${duration}ms ${easing}`,
  }), [progress, duration, easing]);

  const getPathStyle = useMemo(() => {
    return (pathLength: number): CSSProperties => ({
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength * (1 - progress),
      transition: `stroke-dashoffset ${duration}ms ${easing}`,
    });
  }, [progress, duration, easing]);

  return {
    isAnimated,
    progress,
    fadeStyle,
    scaleStyle,
    getPathStyle,
  };
}

/**
 * Calculate the approximate length of an SVG path
 * Can be used with useAnimatedMount's getPathStyle
 */
export function estimatePathLength(pathD: string): number {
  // Create a temporary path element to measure
  if (typeof document === 'undefined') return 1000;
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  
  // Append temporarily to measure
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.visibility = 'hidden';
  svg.appendChild(path);
  document.body.appendChild(svg);
  
  const length = path.getTotalLength();
  document.body.removeChild(svg);
  
  return length;
}
