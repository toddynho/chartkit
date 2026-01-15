'use client';

import { useState, useRef, useEffect } from 'react';
import { themes, type ThemeName } from '@derpdaderp/chartkit';
import { useChartTheme, themeColors, darkThemes, lightThemes } from './ChartThemeProvider';
import { cn } from '@/lib/utils';
import { Check, Palette, Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { themeName, setThemeName, theme } = useChartTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  const isLightTheme = lightThemes.includes(themeName);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'hover:bg-muted border border-transparent hover:border-border',
          isOpen && 'bg-muted border-border'
        )}
        aria-label={`Current theme: ${theme.name}. Click to change.`}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ 
            backgroundColor: theme.bg,
            border: `1.5px solid ${theme.border}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: themeColors[themeName] }}
          />
        </div>
        <span className="text-sm font-medium hidden sm:inline">{theme.name}</span>
        <Palette className="w-4 h-4 text-muted-foreground sm:hidden" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Dark themes section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <Moon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Dark Themes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {darkThemes.map((name) => (
                <ThemeOption
                  key={name}
                  name={name}
                  isSelected={name === themeName}
                  onClick={() => {
                    setThemeName(name);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-2" />

          {/* Light themes section */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <Sun className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Light Themes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {lightThemes.map((name) => (
                <ThemeOption
                  key={name}
                  name={name}
                  isSelected={name === themeName}
                  onClick={() => {
                    setThemeName(name);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeOption({ 
  name, 
  isSelected, 
  onClick 
}: { 
  name: ThemeName; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const t = themes[name];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 text-left group',
        isSelected 
          ? 'bg-accent/10 ring-1 ring-accent/30' 
          : 'hover:bg-muted'
      )}
    >
      {/* Theme preview swatch */}
      <div
        className={cn(
          'w-8 h-8 rounded-md flex flex-col items-center justify-center shrink-0 overflow-hidden',
          'transition-transform duration-150 group-hover:scale-105'
        )}
        style={{ 
          backgroundColor: t.bg,
          border: `1.5px solid ${t.border}`,
        }}
      >
        {/* Color dots representing series colors */}
        <div className="flex gap-0.5">
          {t.colors.slice(0, 3).map((color, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex gap-0.5 mt-0.5">
          {t.colors.slice(3, 5).map((color, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      {/* Theme name */}
      <span className={cn(
        'text-sm font-medium flex-1 truncate',
        isSelected && 'text-accent'
      )}>
        {t.name}
      </span>

      {/* Check mark */}
      {isSelected && (
        <Check className="w-4 h-4 text-accent shrink-0" />
      )}
    </button>
  );
}
