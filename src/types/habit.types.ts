// ✅ Core types for habits, urges, and achievements

// -----------------------------
// 🔹 Habit Categories
// -----------------------------
export type HabitType =
  | 'pornography'
  | 'smoking'
  | 'alcohol'
  | 'gaming'
  | 'social_media'
  | 'junk_food'
  | 'gambling'
  | 'shopping'
  | 'procrastination'
  | 'custom';

// -----------------------------
// 🔹 Severity Levels
// -----------------------------
export type Severity = 'mild' | 'moderate' | 'severe';

// -----------------------------
// 🔹 Habit Model
// -----------------------------
export interface Habit {
  id: string;                 // Unique habit ID
  type: HabitType;            // Predefined or custom habit type
  customName?: string;        // Only for custom habits
  quitDate: Date;             // When user started quitting
  currentStreak: number;      // Current streak in days
  longestStreak: number;      // Longest successful streak
  totalRelapses: number;      // Number of times relapsed
  severity: Severity;         // User-defined or auto-assessed severity
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------
// 🔹 Urge Tracking Model
// -----------------------------
export interface Urge {
  id: string;                 // Unique urge ID
  habitId: string;            // Linked habit
  timestamp: Date;            // When the urge occurred
  intensity: number;          // Scale: 1–10
  trigger?: string;           // e.g., stress, loneliness, boredom
  notes?: string;             // User’s reflection or thoughts
  overcome: boolean;          // Whether the user overcame it
  techniques?: string[];      // Coping strategies used
}

// -----------------------------
// 🔹 Achievement Model
// -----------------------------
export type AchievementType =
  | 'first_day'
  | 'one_week'
  | 'one_month'
  | 'three_months'
  | 'six_months'
  | 'one_year'
  | 'urge_warrior'
  | 'streak_keeper';

export interface Achievement {
  id: string;
  habitId: string;
  type: AchievementType;
  unlockedAt: Date;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
}

// -----------------------------
// 🔹 Optional Analytics Model
// (helps for dashboard stats & insights)
// -----------------------------
export interface HabitStats {
  habitId: string;
  successRate: number;        // (days succeeded / total days) * 100
  relapseFrequency: number;   // Relapses per month
  averageUrgeIntensity: number;
  lastRelapseDate?: Date;
}
