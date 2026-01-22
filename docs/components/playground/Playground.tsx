'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import { PropControls, type PropControlProps } from './PropControls';
import { themes, type ThemeName, ResponsiveChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '../ChartThemeProvider';
import { cn } from '@/lib/utils';

export interface PlaygroundProps {
  /** Component name for display and code generation */
  name: string;
  /** Initial prop values */
  defaultProps: Record<string, unknown>;
  /** Control definitions */
  controls: Omit<PropControlProps, 'value' | 'onChange'>[];
  /** Render function that receives current props and responsive dimensions */
  render: (props: Record<string, unknown>, dimensions?: { width: number; height: number }) => ReactNode;
  /** Whether to include theme selector (now uses global theme) */
  showThemeSelector?: boolean;
  /** Code template - use {{propName}} for interpolation */
  codeTemplate?: string;
  /** Make the chart responsive to fill container width */
  responsive?: boolean;
  /** Default height for responsive mode (ignored if aspectRatio is set) */
  responsiveHeight?: number;
  /** Aspect ratio (width/height) for responsive mode - e.g., 16/9, 2, 1.5 */
  aspectRatio?: number;
}

function generateCode(
  name: string,
  props: Record<string, unknown>,
  themeName: string,
  template?: string
): string {
  if (template) {
    let code = template;
    Object.entries(props).forEach(([key, value]) => {
      const replacement =
        typeof value === 'string'
          ? `"${value}"`
          : typeof value === 'boolean'
          ? value
            ? ''
            : undefined
          : String(value);
      if (replacement !== undefined) {
        code = code.replace(new RegExp(`{{${key}}}`, 'g'), replacement);
      }
    });
    // Remove empty boolean props
    code = code.replace(/\s+\w+={undefined}/g, '');
    // Replace theme placeholder
    code = code.replace(/{{theme}}/g, `"${themeName}"`);
    return code;
  }

  const propStrings = Object.entries(props)
    .filter(([key, value]) => {
      // Skip data prop
      if (key === 'data') return false;
      return true;
    })
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : null;
      }
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean);

  const propsStr = propStrings.length > 0 ? `\n  ${propStrings.join('\n  ')}\n` : ' ';

  return `<${name}
  data={data}
  theme="${themeName}"${propsStr}/>`;
}

export function Playground({
  name,
  defaultProps,
  controls,
  render,
  showThemeSelector = true,
  codeTemplate,
  responsive = true,
  responsiveHeight = 320,
  aspectRatio,
}: PlaygroundProps) {
  const { themeName, theme: globalTheme } = useChartTheme();
  const [props, setProps] = useState<Record<string, unknown>>(defaultProps);
  const [copied, setCopied] = useState(false);

  const updateProp = useCallback((key: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Merge props with global theme
  const propsWithTheme = { ...props, theme: themeName };
  const code = generateCode(name, props, themeName, codeTemplate);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose my-8 rounded-xl border border-border overflow-hidden">
      {/* Preview area */}
      <div
        className="transition-colors duration-300"
        style={{ backgroundColor: globalTheme.bg }}
      >
        {responsive ? (
          <ResponsiveChart 
            height={aspectRatio ? undefined : responsiveHeight}
            aspectRatio={aspectRatio}
          >
            {(dimensions) => render(propsWithTheme, dimensions)}
          </ResponsiveChart>
        ) : (
          <div className="flex items-center justify-center min-h-[200px]">
            {render(propsWithTheme)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Props</h4>
          <div 
            className="flex items-center gap-2 px-2 py-1 rounded-md text-xs font-mono"
            style={{ backgroundColor: globalTheme.bg, color: globalTheme.text, border: `1px solid ${globalTheme.border}` }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: globalTheme.colors[0] }}
            />
            {globalTheme.name}
          </div>
        </div>
        <PropControls
          controls={controls.map((control) => ({
            ...control,
            value: props[control.label] ?? defaultProps[control.label],
            onChange: (value) => updateProp(control.label, value),
          }))}
        />
      </div>

      {/* Code */}
      <div className="border-t border-border bg-muted/50">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">Code</span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}
