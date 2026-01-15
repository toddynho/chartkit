'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Github, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useChartTheme, themeColors } from '../ChartThemeProvider';

interface HeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export function Header({ onMenuToggle, menuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const chartTheme = useChartTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoColor = mounted ? themeColors[chartTheme.themeName] : '#22d3ee';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="mr-4 p-2 -ml-2 md:hidden hover:bg-muted rounded-md"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <span 
            className="text-xl transition-colors duration-300"
            style={{ color: logoColor }}
          >
            ●
          </span>
          <span className="font-semibold text-lg">ChartKit</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Chart Theme Switcher */}
          <ThemeSwitcher />

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-border mx-1" />

          {/* GitHub link */}
          <a
            href="https://github.com/toddynho/chartkit"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-muted rounded-md transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>

          {/* Site theme toggle (dark/light mode) */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle site theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
