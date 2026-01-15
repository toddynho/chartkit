import { type CSSProperties } from 'react';
import { themes, type ThemeName, type ChartTheme } from '../themes';
import type { Annotation, ReferenceLine, ReferenceArea } from './types';

export interface AnnotationsProps {
  /** Annotations to render */
  annotations: Annotation[];
  /** Theme name */
  theme: ThemeName;
  /** X scale function */
  xScale: (value: number) => number;
  /** Y scale function */
  yScale: (value: number) => number;
  /** Chart width */
  chartWidth: number;
  /** Chart height */
  chartHeight: number;
}

/**
 * Annotations - Render reference lines and areas on charts
 * 
 * This component is designed to be rendered inside a chart's SVG <g> element
 * with the chart's coordinate system already applied via transform.
 * 
 * @example
 * ```tsx
 * <Annotations
 *   annotations={[
 *     { type: 'line', value: 100, axis: 'y', label: 'Target', color: '#ef4444' },
 *     { type: 'area', start: 80, end: 120, axis: 'y', color: '#22c55e', opacity: 0.1 },
 *   ]}
 *   theme="monitor-dark"
 *   xScale={xScale}
 *   yScale={yScale}
 *   chartWidth={500}
 *   chartHeight={300}
 * />
 * ```
 */
export function Annotations({
  annotations,
  theme,
  xScale,
  yScale,
  chartWidth,
  chartHeight,
}: AnnotationsProps) {
  const t = themes[theme];

  return (
    <g className="annotations">
      {annotations.map((annotation, i) => {
        if (annotation.type === 'line') {
          return (
            <ReferenceLineComponent
              key={`line-${i}`}
              line={annotation}
              theme={t}
              xScale={xScale}
              yScale={yScale}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          );
        }

        if (annotation.type === 'area') {
          return (
            <ReferenceAreaComponent
              key={`area-${i}`}
              area={annotation}
              theme={t}
              xScale={xScale}
              yScale={yScale}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          );
        }

        return null;
      })}
    </g>
  );
}

interface ReferenceLineComponentProps {
  line: ReferenceLine;
  theme: ChartTheme;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  chartWidth: number;
  chartHeight: number;
}

function ReferenceLineComponent({
  line,
  theme,
  xScale,
  yScale,
  chartWidth,
  chartHeight,
}: ReferenceLineComponentProps) {
  const color = line.color || theme.accent;
  const strokeWidth = line.strokeWidth || 1;
  const strokeDasharray = line.strokeDasharray || '4,4';

  let x1: number, y1: number, x2: number, y2: number;

  if (line.axis === 'y') {
    const y = yScale(line.value);
    x1 = 0;
    y1 = y;
    x2 = chartWidth;
    y2 = y;
  } else {
    const x = xScale(line.value);
    x1 = x;
    y1 = 0;
    x2 = x;
    y2 = chartHeight;
  }

  // Calculate label position
  let labelX: number, labelY: number;
  let textAnchor: 'start' | 'middle' | 'end' = 'start';
  let dy = '0.35em';

  if (line.axis === 'y') {
    labelY = y1;
    switch (line.labelPosition) {
      case 'center':
        labelX = chartWidth / 2;
        textAnchor = 'middle';
        break;
      case 'end':
        labelX = chartWidth - 4;
        textAnchor = 'end';
        break;
      default:
        labelX = 4;
        textAnchor = 'start';
    }
    dy = '-0.5em'; // Position above the line
  } else {
    labelX = x1;
    switch (line.labelPosition) {
      case 'center':
        labelY = chartHeight / 2;
        break;
      case 'end':
        labelY = chartHeight - 4;
        break;
      default:
        labelY = 4;
    }
    textAnchor = 'middle';
  }

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
      {line.label && (
        <text
          x={labelX}
          y={labelY}
          dy={dy}
          fill={color}
          textAnchor={textAnchor}
          style={{
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
          }}
        >
          {line.label}
        </text>
      )}
    </g>
  );
}

interface ReferenceAreaComponentProps {
  area: ReferenceArea;
  theme: ChartTheme;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  chartWidth: number;
  chartHeight: number;
}

function ReferenceAreaComponent({
  area,
  theme,
  xScale,
  yScale,
  chartWidth,
  chartHeight,
}: ReferenceAreaComponentProps) {
  const color = area.color || theme.accent;
  const opacity = area.opacity ?? 0.1;

  let x: number, y: number, width: number, height: number;

  if (area.axis === 'y') {
    const y1 = yScale(area.start);
    const y2 = yScale(area.end);
    x = 0;
    y = Math.min(y1, y2);
    width = chartWidth;
    height = Math.abs(y2 - y1);
  } else {
    const x1 = xScale(area.start);
    const x2 = xScale(area.end);
    x = Math.min(x1, x2);
    y = 0;
    width = Math.abs(x2 - x1);
    height = chartHeight;
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        opacity={opacity}
      />
      {area.label && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
          }}
        >
          {area.label}
        </text>
      )}
    </g>
  );
}

// Export standalone components for direct use
export { ReferenceLineComponent as ReferenceLine };
export { ReferenceAreaComponent as ReferenceArea };
