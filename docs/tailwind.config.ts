import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // ChartKit brand colors
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
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'ck-gradient-dark': 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)',
        'ck-gradient-light': 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--accent))',
              '&:hover': {
                color: 'hsl(var(--accent))',
              },
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            blockquote: {
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--border))',
            },
          },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
