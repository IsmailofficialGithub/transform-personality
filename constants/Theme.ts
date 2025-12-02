export const Theme = {
  light: {
    primary: '#6366f1', // Indigo primary
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#8b5cf6', // Purple secondary
    accent: '#ec4899', // Pink accent
    base: {
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    primary: '#818cf8', // Lighter indigo for dark mode
    primaryDark: '#6366f1',
    primaryLight: '#a5b4fc',
    secondary: '#a78bfa', // Lighter purple
    accent: '#f472b6', // Lighter pink
    base: {
      background: '#0f172a',
      surface: '#1e293b',
      card: '#334155',
      border: '#475569',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
    },
    status: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export type ThemeColors = typeof Theme.light;

