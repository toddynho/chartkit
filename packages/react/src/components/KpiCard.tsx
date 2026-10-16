import type { CSSProperties, ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { Sparkline } from './Sparkline';

export interface KpiCardProps<T = Record<string, unknown>> {
  /** Label text displayed above the value */
  label: string;
  /** Main KPI value */
  value: number;
  /** Percentage change (positive or negative) */
  delta?: number;
  /** Optional sparkline data */
  data?: T[] | number[];
  /** Key to extract numeric value when data contains objects */
  dataKey?: keyof T;
  /** Theme name */
  theme: ThemeName;
  /** Custom value formatter */
  format?: (value: number) => string;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Optional children to render below the sparkline */
  children?: ReactNode;
}

const defaultFormat = (v: number) => v.toLocaleString();

/**
 * KpiCard - A card displaying a key metric with optional trend indicator
 * 
 * @example
 * ```tsx
 * <KpiCard
 *   label="Total Revenue"
 *   value={125000}
 *   delta={12.5}
 *   data={revenueHistory}
 *   theme="monitor-dark"
 *   format={(v) => `$${(v / 1000).toFixed(0)}K`}
 * />
 * ```
 */
export function KpiCard<T extends Record<string, unknown>>({
  label,
  value,
  delta,
  data,
  dataKey = 'value' as keyof T,
  theme,
  format = defaultFormat,
  className,
  style,
  children,
}: KpiCardProps<T>) {
  const t = themes[theme];
  const isPositive = delta !== undefined && delta >= 0;
  const deltaColor = isPositive ? t.positive : t.negative;

  const cardStyle: CSSProperties = {
    backgroundColor: t.bgCard,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${t.border}`,
    minWidth: '200px',
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontSize: '13px',
    color: t.textSecondary,
    marginBottom: '8px',
    fontWeight: 500,
  };

  const valueContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: data ? '12px' : 0,
  };

  const valueStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    color: t.text,
    letterSpacing: '-0.02em',
  };

  const deltaStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: deltaColor,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  };

  return (
    <div className={className} style={cardStyle}>
      <div style={labelStyle}>{label}</div>

      <div style={valueContainerStyle}>
        <span style={valueStyle}>{format(value)}</span>

        {delta !== undefined && (
          <span style={deltaStyle}>
            <span style={{ fontSize: '12px' }}>{isPositive ? '\u2197' : '\u2198'}</span>
            {Math.abs(delta).toFixed(2)}%
          </span>
        )}
      </div>

      {data && (
        <Sparkline
          data={data}
          dataKey={dataKey}
          width={160}
          height={32}
          theme={theme}
          color={t.colors[0]}
          fill
          strokeWidth={1.5}
        />
      )}

      {children}
    </div>
  );
}
