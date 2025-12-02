import { Theme } from './Theme';

export default {
  light: {
    text: Theme.light.text.primary,
    background: Theme.light.base.background,
    tint: Theme.light.primary,
    tabIconDefault: Theme.light.text.tertiary,
    tabIconSelected: Theme.light.primary,
  },
  dark: {
    text: Theme.dark.text.primary,
    background: Theme.dark.base.background,
    tint: Theme.dark.primary,
    tabIconDefault: Theme.dark.text.tertiary,
    tabIconSelected: Theme.dark.primary,
  },
};
