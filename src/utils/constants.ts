import { COLORS } from './theme';

// -----------------------------
// 💬 HABIT NAMES & DESCRIPTIONS
// -----------------------------
export const HABIT_NAMES: Record<string, string> = {
  pornography: 'Pornography',
  smoking: 'Smoking',
  alcohol: 'Alcohol',
  gaming: 'Gaming',
  social_media: 'Social Media',
  junk_food: 'Junk Food',
  gambling: 'Gambling',
  shopping: 'Shopping',
  procrastination: 'Procrastination',
};

export const HABIT_DESCRIPTIONS: Record<string, string> = {
  pornography: 'Break free and reclaim your focus.',
  smoking: 'Breathe easier and live healthier.',
  alcohol: 'Find clarity in a sober life.',
  gaming: 'Play life, not just the screen.',
  social_media: 'Disconnect to reconnect.',
  junk_food: 'Fuel your body with nutrition.',
  gambling: 'Take control of your destiny.',
  shopping: 'Buy less, live more.',
  procrastination: 'Act today, win tomorrow.',
};

// -----------------------------
// 🧠 MOTIVATIONAL QUOTES
// -----------------------------
export const MOTIVATIONAL_QUOTES: string[] = [
  "Every step forward is a step toward success.",
  "You are stronger than your strongest excuse.",
  "Discipline is choosing what you want most over what you want now.",
  "You don’t have to be perfect, just consistent.",
  "Fall seven times, stand up eight.",
  "The pain you feel today will be your strength tomorrow.",
  "Tiny changes create lasting results.",
  "Focus on progress, not perfection.",
  "You are building the best version of yourself.",
  "Your future self is cheering for you.",
];

// -----------------------------
// 🖼️ HABIT IMAGES
// -----------------------------
export const HABIT_IMAGES: Record<string, string> = {
  pornography: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  smoking: 'https://images.unsplash.com/photo-1593032457869-8d132d1e1f2f?w=400',
  alcohol: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
  gaming: 'https://images.unsplash.com/photo-1598550487031-87c6bdc87c85?w=400',
  social_media: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
  junk_food: 'https://images.unsplash.com/photo-1606756790138-8f29f0e69b81?w=400',
  gambling: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400',
  shopping: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
  procrastination: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
};

// -----------------------------
// 🎨 CATEGORY COLORS (for UI tinting)
// -----------------------------
export const HABIT_COLORS: Record<string, readonly [string, string]> = {
  pornography: COLORS.gradientSunset,
  smoking: COLORS.gradientPurple,
  alcohol: COLORS.gradientBlue,
  gaming: COLORS.gradientGreen,
  social_media: COLORS.gradientPurple,
  junk_food: COLORS.gradientOrange,
  gambling: COLORS.gradientMidnight,
  shopping: COLORS.gradientBlue,
  procrastination: COLORS.gradientGreen,
};

// -----------------------------
// 🏷️ CATEGORY LIST
// -----------------------------
export const HABIT_CATEGORIES = [
  'pornography',
  'smoking',
  'alcohol',
  'gaming',
  'social_media',
  'junk_food',
  'gambling',
  'shopping',
  'procrastination',
] as const;

export type HabitType = typeof HABIT_CATEGORIES[number];

// -----------------------------
// 🏆 ACHIEVEMENTS / MILESTONES
// -----------------------------
export const ACHIEVEMENT_MILESTONES = [
  { days: 1, title: 'First Step', icon: '🚶‍♂️' },
  { days: 3, title: 'Momentum Building', icon: '⚡' },
  { days: 7, title: 'One Week Strong', icon: '📅' },
  { days: 14, title: 'Two Weeks Clean', icon: '🏅' },
  { days: 21, title: 'Three Weeks Focused', icon: '🧘‍♂️' },
  { days: 30, title: 'One Month Milestone', icon: '🌟' },
  { days: 60, title: 'Two Months Clarity', icon: '💡' },
  { days: 90, title: 'Three Months Power', icon: '🔥' },
  { days: 180, title: 'Half-Year Warrior', icon: '🛡️' },
  { days: 365, title: 'One-Year Champion', icon: '👑' },
];
