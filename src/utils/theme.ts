import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// -----------------------------
// 🔹 SIZES
// -----------------------------
export const SIZES = {
  base: 8,
  font: 14,
  radius: 14,
  radiusLarge: 24,
  padding: 16,
  paddingSmall: 8,
  paddingLarge: 28,
  margin: 12,
  marginSmall: 8,
  marginLarge: 24,

  // Font sizes
  largeTitle: 40,
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,

  width,
  height,
};

// -----------------------------
// 🎨 COLORS
// -----------------------------
export const COLORS = {
  // Primary Palette
  primary: '#6C5CE7',
  primaryDark: '#5A4CCF',
  primaryLight: '#A29BFE',
  accent: '#00D2FF',

  // Status
  success: '#00E676',
  warning: '#FFD54F',
  error: '#FF5252',

  // Background & Surface
  background: '#0F0F0F',
  backgroundSecondary: '#171717',
  surface: '#1E1E1E',
  surfaceGlass: 'rgba(255,255,255,0.05)', // glassmorphic overlay
  surfaceLight: 'rgba(255,255,255,0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#6B7280',
  textInverse: '#000',

  // Border
  border: '#2C2C2C',

  // Gradients
  gradientPurple: ['#667EEA', '#764BA2'] as const,
  gradientBlue: ['#00D2FF', '#3A7BD5'] as const,
  gradientGreen: ['#56ab2f', '#a8e063'] as const,
  gradientSunset: ['#fa709a', '#fee140'] as const,
  gradientMidnight: ['#232526', '#414345'] as const,

  // Habit Category Gradients
  habitGradients: {
    pornography: ['#ff6b6b', '#ff9a9e'],
    smoking: ['#f093fb', '#f5576c'],
    alcohol: ['#43cea2', '#185a9d'],
    gaming: ['#7F00FF', '#E100FF'],
    social_media: ['#00c6ff', '#0072ff'],
    junk_food: ['#f7971e', '#ffd200'],
    gambling: ['#8E2DE2', '#4A00E0'],
    shopping: ['#56CCF2', '#2F80ED'],
    procrastination: ['#C6FFDD', '#FBD786'],
  },
};

// -----------------------------
// ✍️ TYPOGRAPHY
// -----------------------------
export const FONTS = {
  largeTitle: { fontSize: SIZES.largeTitle, fontWeight: '800' as const },
  h1: { fontSize: SIZES.h1, fontWeight: '700' as const },
  h2: { fontSize: SIZES.h2, fontWeight: '700' as const },
  h3: { fontSize: SIZES.h3, fontWeight: '600' as const },
  h4: { fontSize: SIZES.h4, fontWeight: '600' as const },
  body: { fontSize: SIZES.body, fontWeight: '400' as const },
  small: { fontSize: SIZES.small, fontWeight: '400' as const },
  tiny: { fontSize: SIZES.tiny, fontWeight: '400' as const },
};

// -----------------------------
// 🪄 SHADOWS
// -----------------------------
export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
};

// -----------------------------
// 💫 EFFECTS (Optional Extras)
// -----------------------------
export const EFFECTS = {
  glass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    backdropFilter: 'blur(10px)', // web only, for native use expo-blur
  },
  blurLight: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  blurDark: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
};

export default { SIZES, COLORS, FONTS, SHADOWS, EFFECTS };
