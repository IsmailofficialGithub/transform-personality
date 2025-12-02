import { useColorScheme } from 'react-native';
import { Theme, ThemeColors } from '../constants/Theme';
import { useThemeStore } from '../stores/useThemeStore';

export function useTheme(): ThemeColors {
  const systemColorScheme = useColorScheme() ?? 'light';
  const { themeMode } = useThemeStore();
  
  // If theme mode is auto, use system preference; otherwise use selected mode
  const effectiveTheme = themeMode === 'auto' ? systemColorScheme : themeMode;
  
  return Theme[effectiveTheme];
}

