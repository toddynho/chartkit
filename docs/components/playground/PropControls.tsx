'use client';

import { cn } from '@/lib/utils';

export interface PropControlProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  type: 'number' | 'boolean' | 'select' | 'color' | 'string' | 'segment';
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

// Toggle Switch component
function ToggleSwitch({ 
  checked, 
  onChange,
  label,
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-accent' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// Segmented Control component
function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: unknown }[];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="inline-flex bg-muted rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => {
        const isSelected = String(opt.value) === String(value);
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function PropControl({
  label,
  value,
  onChange,
  type,
  options,
  min = 0,
  max = 100,
  step = 1,
  description,
}: PropControlProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label className="text-sm font-mono">
          {label}
        </label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {type === 'number' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value as number}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <span className="text-sm font-mono w-12 text-right tabular-nums bg-muted px-2 py-0.5 rounded">
              {value as number}
            </span>
          </div>
        )}
        {type === 'boolean' && (
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs transition-colors',
              !value ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Off
            </span>
            <ToggleSwitch
              checked={value as boolean}
              onChange={(checked) => onChange(checked)}
              label={label}
            />
            <span className={cn(
              'text-xs transition-colors',
              value ? 'text-foreground' : 'text-muted-foreground'
            )}>
              On
            </span>
          </div>
        )}
        {type === 'select' && options && (
          <select
            value={String(value)}
            onChange={(e) => {
              // Try to preserve original type
              const opt = options.find(o => String(o.value) === e.target.value);
              onChange(opt?.value ?? e.target.value);
            }}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            {options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {type === 'segment' && options && (
          <SegmentedControl
            options={options}
            value={value}
            onChange={onChange}
          />
        )}
        {type === 'color' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded-lg border border-border cursor-pointer"
            />
            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{value as string}</span>
          </div>
        )}
        {type === 'string' && (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        )}
      </div>
    </div>
  );
}

export interface PropControlsProps {
  controls: PropControlProps[];
}

export function PropControls({ controls }: PropControlsProps) {
  return (
    <div className="divide-y divide-border/50">
      {controls.map((control) => (
        <PropControl key={control.label} {...control} />
      ))}
    </div>
  );
}
