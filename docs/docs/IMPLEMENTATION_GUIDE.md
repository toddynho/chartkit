# ChartKit Brand Implementation Guide

This document contains everything needed to update the ChartKit website (chartkit.dev) with the new brand identity. Follow these specifications exactly.

---

## Brand Overview

**ChartKit** is a lightweight, zero-dependency charting library for React and Next.js. The brand communicates: **clarity, precision, and effortless elegance**.

**Tagline:** "Charts that don't weigh you down."

**Key messages:**
- 14 chart types
- 17 themes
- Zero dependencies
- ~15KB gzipped
- TypeScript first
- RSC ready

---

## Logo

Use **Concept A: Rising Bars** — a data point radiating into ascending bars.

### Dark Mode Logo (SVG)
```svg
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="36" r="4" fill="#38bdf8"/>
  <rect x="20" y="28" width="6" height="12" rx="1" fill="#38bdf8"/>
  <rect x="29" y="20" width="6" height="20" rx="1" fill="#38bdf8" fill-opacity="0.7"/>
  <rect x="38" y="12" width="6" height="28" rx="1" fill="#38bdf8" fill-opacity="0.4"/>
</svg>
```

### Light Mode Logo (SVG)
```svg
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="36" r="4" fill="#0ea5e9"/>
  <rect x="20" y="28" width="6" height="12" rx="1" fill="#0ea5e9"/>
  <rect x="29" y="20" width="6" height="20" rx="1" fill="#0ea5e9" fill-opacity="0.6"/>
  <rect x="38" y="12" width="6" height="28" rx="1" fill="#0ea5e9" fill-opacity="0.3"/>
</svg>
```

### Favicon (Dark background, works for both modes)
```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#0f172a"/>
  <rect x="6" y="18" width="5" height="8" rx="1" fill="#38bdf8"/>
  <rect x="13" y="12" width="5" height="14" rx="1" fill="#38bdf8" fill-opacity="0.8"/>
  <rect x="20" y="6" width="5" height="20" rx="1" fill="#8b5cf6"/>
</svg>
```

### Wordmark Treatment
The word "Chart" uses the text color, "Kit" uses the primary accent color.
- Dark mode: "Chart" in `#f1f5f9`, "Kit" in `#38bdf8`
- Light mode: "Chart" in `#0f172a`, "Kit" in `#0ea5e9`

---

## Color System

### CSS Custom Properties

Add these to your global CSS file:

```css
:root {
  /* ========== DARK MODE COLORS ========== */
  --ck-dark-bg: #0f172a;
  --ck-dark-surface: #1e293b;
  --ck-dark-elevated: #334155;
  --ck-dark-text: #f1f5f9;
  --ck-dark-text-secondary: #cbd5e1;
  --ck-dark-text-muted: #94a3b8;
  --ck-dark-border: #334155;
  --ck-dark-primary: #38bdf8;
  --ck-dark-primary-hover: #7dd3fc;

  /* ========== LIGHT MODE COLORS ========== */
  --ck-light-bg: #ffffff;
  --ck-light-surface: #f8fafc;
  --ck-light-elevated: #f1f5f9;
  --ck-light-text: #0f172a;
  --ck-light-text-secondary: #334155;
  --ck-light-text-muted: #64748b;
  --ck-light-border: #e2e8f0;
  --ck-light-primary: #0ea5e9;
  --ck-light-primary-hover: #0284c7;

  /* ========== SHARED COLORS ========== */
  --ck-violet: #8b5cf6;
  --ck-violet-light: #7c3aed;
  --ck-success: #10b981;
  --ck-success-light: #059669;
  --ck-warning: #f59e0b;
  --ck-error: #f43f5e;

  /* ========== GRADIENTS ========== */
  --ck-gradient-dark: linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%);
  --ck-gradient-light: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%);
}

/* Dark mode (default) */
:root,
[data-theme="dark"] {
  --ck-bg: var(--ck-dark-bg);
  --ck-surface: var(--ck-dark-surface);
  --ck-elevated: var(--ck-dark-elevated);
  --ck-text: var(--ck-dark-text);
  --ck-text-secondary: var(--ck-dark-text-secondary);
  --ck-text-muted: var(--ck-dark-text-muted);
  --ck-border: var(--ck-dark-border);
  --ck-primary: var(--ck-dark-primary);
  --ck-primary-hover: var(--ck-dark-primary-hover);
  --ck-gradient: var(--ck-gradient-dark);
}

/* Light mode */
[data-theme="light"] {
  --ck-bg: var(--ck-light-bg);
  --ck-surface: var(--ck-light-surface);
  --ck-elevated: var(--ck-light-elevated);
  --ck-text: var(--ck-light-text);
  --ck-text-secondary: var(--ck-light-text-secondary);
  --ck-text-muted: var(--ck-light-text-muted);
  --ck-border: var(--ck-light-border);
  --ck-primary: var(--ck-light-primary);
  --ck-primary-hover: var(--ck-light-primary-hover);
  --ck-gradient: var(--ck-gradient-light);
}

/* System preference detection */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --ck-bg: var(--ck-light-bg);
    --ck-surface: var(--ck-light-surface);
    --ck-elevated: var(--ck-light-elevated);
    --ck-text: var(--ck-light-text);
    --ck-text-secondary: var(--ck-light-text-secondary);
    --ck-text-muted: var(--ck-light-text-muted);
    --ck-border: var(--ck-light-border);
    --ck-primary: var(--ck-light-primary);
    --ck-primary-hover: var(--ck-light-primary-hover);
    --ck-gradient: var(--ck-gradient-light);
  }
}
```

### Tailwind Config

If using Tailwind CSS, extend your config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ck: {
          // Dark mode
          'dark-bg': '#0f172a',
          'dark-surface': '#1e293b',
          'dark-elevated': '#334155',
          'dark-text': '#f1f5f9',
          'dark-muted': '#94a3b8',
          'dark-border': '#334155',
          'dark-primary': '#38bdf8',
          
          // Light mode
          'light-bg': '#ffffff',
          'light-surface': '#f8fafc',
          'light-elevated': '#f1f5f9',
          'light-text': '#0f172a',
          'light-muted': '#64748b',
          'light-border': '#e2e8f0',
          'light-primary': '#0ea5e9',
          
          // Shared
          'violet': '#8b5cf6',
          'violet-light': '#7c3aed',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'ck-gradient-dark': 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)',
        'ck-gradient-light': 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
      },
    },
  },
}
```

---

## Typography

### Font Stack

```css
--font-sans: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
```

### Loading Fonts

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Or with Next.js:

```js
// app/layout.tsx
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Display/Hero | 3rem (48px) | 300 | 1.1 |
| H1 | 2.25rem (36px) | 600 | 1.2 |
| H2 | 1.75rem (28px) | 600 | 1.3 |
| H3 | 1.375rem (22px) | 500 | 1.4 |
| Body | 1rem (16px) | 400 | 1.6 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Code | 0.875rem (14px) | 400 (mono) | 1.6 |

---

## Components

### Primary Button

```css
.btn-primary {
  background: var(--ck-gradient);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
}
```

### Secondary Button

```css
.btn-secondary {
  background: var(--ck-surface);
  color: var(--ck-text);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid var(--ck-border);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: var(--ck-elevated);
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: var(--ck-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid var(--ck-primary);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-outline:hover {
  background: rgba(56, 189, 248, 0.1);
}
```

### Badge/Chip

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: var(--ck-surface);
  border: 1px solid var(--ck-border);
  border-radius: 9999px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ck-primary);
}
```

### Card

```css
.card {
  background: var(--ck-surface);
  border: 1px solid var(--ck-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ck-text);
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.875rem;
  color: var(--ck-text-muted);
}
```

### Code Block

```css
.code-block {
  background: var(--ck-dark-bg); /* Always dark for code */
  border: 1px solid var(--ck-dark-border);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  overflow-x: auto;
}

/* Syntax highlighting colors */
.code-block .keyword { color: #ff7b72; }
.code-block .string { color: #a5d6ff; }
.code-block .component { color: #7ee787; }
.code-block .prop { color: #79c0ff; }
.code-block .comment { color: #8b949e; }
```

---

## Page Sections

### Hero Section

```jsx
<section className="hero">
  {/* Grid background pattern */}
  <div className="hero-bg" />
  
  <div className="hero-content">
    {/* Logo */}
    <Logo />
    
    {/* Wordmark */}
    <h1>
      Chart<span className="text-primary">Kit</span>
    </h1>
    
    {/* Tagline */}
    <p className="tagline">Charts that don't weigh you down</p>
    
    {/* Feature badges */}
    <div className="badges">
      <span className="badge">~15KB</span>
      <span className="badge">0 dependencies</span>
      <span className="badge">17 themes</span>
    </div>
    
    {/* CTAs */}
    <div className="cta-row">
      <button className="btn-primary">Get Started</button>
      <button className="btn-secondary">Documentation</button>
    </div>
  </div>
  
  {/* Hero chart visualization */}
  <div className="hero-chart">
    {/* Animated sample chart */}
  </div>
</section>
```

Hero background CSS:

```css
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%),
    repeating-linear-gradient(0deg, transparent, transparent 39px, var(--ck-border) 39px, var(--ck-border) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, var(--ck-border) 39px, var(--ck-border) 40px);
  opacity: 0.5;
}
```

### Feature Section

```jsx
<section className="features">
  <h2>Everything you need</h2>
  
  <div className="feature-grid">
    <div className="card">
      <div className="feature-icon">{/* Icon */}</div>
      <h3>14 Chart Types</h3>
      <p>Lines, bars, areas, scatter, gauges, heatmaps, and more.</p>
    </div>
    
    <div className="card">
      <div className="feature-icon">{/* Icon */}</div>
      <h3>17 Themes</h3>
      <p>Dark and light themes with auto-switching support.</p>
    </div>
    
    <div className="card">
      <div className="feature-icon">{/* Icon */}</div>
      <h3>Zero Dependencies</h3>
      <p>Pure SVG rendering. No D3, no heavy libraries.</p>
    </div>
    
    <div className="card">
      <div className="feature-icon">{/* Icon */}</div>
      <h3>TypeScript First</h3>
      <p>Full type safety with comprehensive types.</p>
    </div>
  </div>
</section>
```

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## Theme Switching

### React Implementation

```jsx
// components/ThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### Theme Toggle Component

```jsx
// components/ThemeToggle.tsx
'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

---

## Open Graph / Social Images

### Meta Tags

```html
<meta property="og:title" content="ChartKit - Lightweight charts for React & Next.js" />
<meta property="og:description" content="14 chart types. 17 themes. Zero dependencies. ~15KB." />
<meta property="og:image" content="https://chartkit.dev/og-image.png" />
<meta property="og:url" content="https://chartkit.dev" />
<meta name="twitter:card" content="summary_large_image" />
```

### OG Image Specifications

- Size: 1200 × 630 pixels
- Background: Use `--ck-bg` (dark or light based on preference)
- Include: Logo, wordmark, tagline, sample chart, feature badges
- Format: PNG or SVG converted to PNG

---

## Sample Chart for Hero

Use this SVG as a starting point for an animated hero chart:

```svg
<svg viewBox="0 0 400 200" fill="none">
  <!-- Area fill -->
  <path 
    d="M0 160 L60 120 L120 140 L180 80 L240 100 L300 50 L360 70 L400 40 L400 200 L0 200 Z" 
    fill="url(#areaGrad)" 
    fill-opacity="0.2"
  />
  
  <!-- Line -->
  <path 
    d="M0 160 L60 120 L120 140 L180 80 L240 100 L300 50 L360 70 L400 40" 
    stroke="url(#lineGrad)" 
    stroke-width="3" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    fill="none"
  />
  
  <!-- Data points -->
  <circle cx="0" cy="160" r="5" fill="#38bdf8"/>
  <circle cx="60" cy="120" r="5" fill="#38bdf8"/>
  <circle cx="120" cy="140" r="5" fill="#38bdf8"/>
  <circle cx="180" cy="80" r="5" fill="#6366f1"/>
  <circle cx="240" cy="100" r="5" fill="#6366f1"/>
  <circle cx="300" cy="50" r="5" fill="#8b5cf6"/>
  <circle cx="360" cy="70" r="5" fill="#8b5cf6"/>
  <circle cx="400" cy="40" r="6" fill="#8b5cf6"/>
  
  <defs>
    <linearGradient id="areaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
</svg>
```

---

## Animation Guidelines

### Page Load

Use staggered fade-in animations:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-in:nth-child(1) { animation-delay: 0ms; }
.animate-in:nth-child(2) { animation-delay: 100ms; }
.animate-in:nth-child(3) { animation-delay: 200ms; }
.animate-in:nth-child(4) { animation-delay: 300ms; }
```

### Hover States

Subtle lift effect:

```css
.hoverable {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### Chart Animations

For the hero chart, animate the line drawing:

```css
.chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
```

---

## Checklist

Before launching, verify:

- [ ] Favicon installed (use dark version)
- [ ] OG image uploaded and meta tags set
- [ ] Fonts loading correctly (Space Grotesk + JetBrains Mono)
- [ ] Theme toggle works and persists
- [ ] System preference detection works
- [ ] All colors using CSS variables
- [ ] Logo renders correctly in both modes
- [ ] Code blocks have syntax highlighting
- [ ] Buttons have hover states
- [ ] Responsive on mobile
- [ ] Animations are smooth (respect prefers-reduced-motion)

---

## Quick Reference

### Colors at a Glance

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--ck-bg` | #0f172a | #ffffff |
| `--ck-surface` | #1e293b | #f8fafc |
| `--ck-text` | #f1f5f9 | #0f172a |
| `--ck-text-muted` | #94a3b8 | #64748b |
| `--ck-border` | #334155 | #e2e8f0 |
| `--ck-primary` | #38bdf8 | #0ea5e9 |
| `--ck-violet` | #8b5cf6 | #7c3aed |

### Font Quick Reference

```css
font-family: 'Space Grotesk', system-ui, sans-serif; /* Headings & body */
font-family: 'JetBrains Mono', monospace; /* Code */
```

### Gradient

```css
/* Dark */
background: linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%);

/* Light */
background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%);
```
