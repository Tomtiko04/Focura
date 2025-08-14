// Centralized theme definitions

const base = {
  fonts: {
    main: 'System',
    title: 'System',
  },
  fontSizes: {
    xsmall: 11,
    small: 13,
    medium: 16,
    large: 20,
    xlarge: 28,
    display: 42,
  },
  spacing: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '600',
    bold: '800',
  },
  borderRadius: 12,
};

export const lightTheme = {
  ...base,
  colors: {
    primary: '#6C63FF',
    secondary: '#FF6584',
    tertiary: '#00C2A8',
    accent: '#FFC857', // warm accent
    quaternary: '#4ECDC4', // complementary teal
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1F2937',
    meta: '#6B7280',
    gray: '#A9A9A9',
    lightGray: '#E0E0E0',
    error: '#FF3B30',
    success: '#22C55E',
  },
};

export const darkTheme = {
  ...base,
  colors: {
    primary: '#8C86FF',
    secondary: '#FF7A99',
    tertiary: '#00D1B2',
    accent: '#FFD46B',
    quaternary: '#5FE3DA',
    background: '#0B0F14',
    surface: '#151A21',
    text: '#E5E7EB',
    meta: '#9CA3AF',
    gray: '#6B7280',
    lightGray: '#2A2F36',
    error: '#FF6B6B',
    success: '#34D399',
  },
};

export const getTheme = (scheme) => (scheme === 'dark' ? darkTheme : lightTheme);

// Back-compat default export
export const theme = lightTheme;
