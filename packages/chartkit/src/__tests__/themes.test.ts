import { describe, it, expect } from 'vitest';
import { themes, getTheme } from '../themes';

describe('themes', () => {
  it('should export all theme objects', () => {
    expect(themes).toBeDefined();
    expect(Object.keys(themes).length).toBeGreaterThan(0);
  });

  it('should have required properties in each theme', () => {
    const requiredProps = [
      'name', 'bg', 'bgSecondary', 'bgCard',
      'text', 'textSecondary', 'textMuted',
      'border', 'gridLine', 'colors',
      'accent', 'positive', 'negative'
    ];

    Object.entries(themes).forEach(([key, theme]) => {
      requiredProps.forEach(prop => {
        expect(theme).toHaveProperty(prop);
      });
    });
  });

  it('should have at least 5 colors in each theme', () => {
    Object.entries(themes).forEach(([key, theme]) => {
      expect(theme.colors.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('should have valid hex colors', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    
    Object.entries(themes).forEach(([key, theme]) => {
      expect(theme.bg).toMatch(hexRegex);
      expect(theme.text).toMatch(hexRegex);
      expect(theme.accent).toMatch(hexRegex);
      theme.colors.forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  it('should include expected themes', () => {
    expect(themes['midnight']).toBeDefined();
    expect(themes['sunset']).toBeDefined();
    expect(themes['orchid']).toBeDefined();
    expect(themes['arctic']).toBeDefined();
    expect(themes['slate']).toBeDefined();
  });
});

describe('getTheme', () => {
  it('should return theme by name', () => {
    const theme = getTheme('midnight');
    expect(theme.name).toBe('Midnight');
  });

  it('should return default theme for unknown name', () => {
    const theme = getTheme('nonexistent');
    expect(theme).toEqual(themes['midnight']);
  });

  it('should return consistent results', () => {
    const theme1 = getTheme('orchid');
    const theme2 = getTheme('orchid');
    expect(theme1).toEqual(theme2);
  });
});
