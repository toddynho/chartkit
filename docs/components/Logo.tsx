'use client';

import { useTheme } from 'next-themes';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Colors based on theme
  const primaryColor = isDark ? '#38bdf8' : '#0ea5e9';
  const opacity1 = isDark ? 0.7 : 0.6;
  const opacity2 = isDark ? 0.4 : 0.3;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="36" r="4" fill={primaryColor} />
      <rect x="20" y="28" width="6" height="12" rx="1" fill={primaryColor} />
      <rect x="29" y="20" width="6" height="20" rx="1" fill={primaryColor} fillOpacity={opacity1} />
      <rect x="38" y="12" width="6" height="28" rx="1" fill={primaryColor} fillOpacity={opacity2} />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const primaryColor = isDark ? '#38bdf8' : '#0ea5e9';

  return (
    <span className={className} style={{ fontWeight: 600 }}>
      <span style={{ color: textColor }}>Chart</span>
      <span style={{ color: primaryColor }}>Kit</span>
    </span>
  );
}

interface LogoWithWordmarkProps {
  size?: number;
  className?: string;
}

export function LogoWithWordmark({ size = 32, className }: LogoWithWordmarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Logo size={size} />
      <Wordmark className="text-xl" />
    </div>
  );
}

// Favicon SVG (for reference - static dark version)
export function FaviconSvg() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0f172a"/>
      <rect x="6" y="18" width="5" height="8" rx="1" fill="#38bdf8"/>
      <rect x="13" y="12" width="5" height="14" rx="1" fill="#38bdf8" fillOpacity="0.8"/>
      <rect x="20" y="6" width="5" height="20" rx="1" fill="#8b5cf6"/>
    </svg>
  );
}
