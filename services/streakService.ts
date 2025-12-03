import { supabase } from './supabase';
import { HabitCheckIn, StreakData, Milestone } from '../types';

/**
 * Calculate the current streak for a habit
 * A streak is consecutive days with status='success' check-ins
 */
export async function calculateStreak(
  userId: string,
  habitId: string
): Promise<number> {
  try {
    // Get all successful check-ins, ordered by date descending
    const { data: checkIns, error } = await supabase
      .from('habit_checkins')
      .select('date, status')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('status', 'success')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching check-ins for streak:', error);
      return 0;
    }

    if (!checkIns || checkIns.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let expectedDate = new Date(today);

    // Check if today has a check-in, if not start from yesterday
    const todayStr = expectedDate.toISOString().split('T')[0];
    const hasTodayCheckIn = checkIns.some(ci => ci.date === todayStr);
    
    if (!hasTodayCheckIn) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    // Count consecutive days
    for (const checkIn of checkIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      const checkInDateStr = checkInDate.toISOString().split('T')[0];

      if (checkInDateStr === expectedDateStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (checkInDate < expectedDate) {
        // Gap found, streak broken
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Calculate the longest streak for a habit
 */
export async function calculateLongestStreak(
  userId: string,
  habitId: string
): Promise<number> {
  try {
    const { data: checkIns, error } = await supabase
      .from('habit_checkins')
      .select('date, status')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('status', 'success')
      .order('date', { ascending: true });

    if (error || !checkIns || checkIns.length === 0) {
      return 0;
    }

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < checkIns.length; i++) {
      const prevDate = new Date(checkIns[i - 1].date);
      const currDate = new Date(checkIns[i].date);
      
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Gap found, reset streak
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  } catch (error) {
    console.error('Error calculating longest streak:', error);
    return 0;
  }
}

/**
 * Calculate days clean from quit date
 */
export function calculateDaysClean(quitDate: string | null | undefined): number {
  if (!quitDate) {
    return 0;
  }
  
  const quit = new Date(quitDate);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(quit.getTime())) {
    console.warn('Invalid quit_date:', quitDate);
    return 0;
  }
  
  quit.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - quit.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Ensure we return a valid number
  if (isNaN(diffDays)) {
    return 0;
  }
  
  return Math.max(0, diffDays);
}

/**
 * Get comprehensive streak data for a habit
 */
export async function getStreakData(
  userId: string,
  habitId: string,
  quitDate: string | null | undefined
): Promise<StreakData> {
  const [currentStreak, longestStreak] = await Promise.all([
    calculateStreak(userId, habitId),
    calculateLongestStreak(userId, habitId),
  ]);

  // Use current date as fallback if quit_date is missing
  const effectiveQuitDate = quitDate || new Date().toISOString();
  const daysClean = calculateDaysClean(effectiveQuitDate);

  // Get last check-in date
  const { data: lastCheckIn } = await supabase
    .from('habit_checkins')
    .select('date')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  return {
    current_streak: isNaN(currentStreak) ? 0 : currentStreak,
    longest_streak: isNaN(longestStreak) ? 0 : longestStreak,
    days_clean: isNaN(daysClean) ? 0 : daysClean,
    last_check_in_date: lastCheckIn?.date,
  };
}

/**
 * Check and award milestones based on days clean
 */
export async function checkAndAwardMilestones(
  userId: string,
  habitId: string,
  daysClean: number
): Promise<Milestone[]> {
  const milestoneTypes: Array<{
    type: Milestone['milestone_type'];
    days: number;
  }> = [
    { type: '1_day', days: 1 },
    { type: '3_days', days: 3 },
    { type: '1_week', days: 7 },
    { type: '2_weeks', days: 14 },
    { type: '1_month', days: 30 },
    { type: '3_months', days: 90 },
    { type: '6_months', days: 180 },
    { type: '1_year', days: 365 },
  ];

  const newMilestones: Milestone[] = [];

  for (const milestone of milestoneTypes) {
    if (daysClean >= milestone.days) {
      // Check if milestone already exists
      const { data: existing } = await supabase
        .from('milestones')
        .select('id')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('milestone_type', milestone.type)
        .maybeSingle();

      if (!existing) {
        // Create new milestone
        const { data: newMilestone, error } = await supabase
          .from('milestones')
          .insert({
            user_id: userId,
            habit_id: habitId,
            days_count: milestone.days,
            milestone_type: milestone.type,
            celebrated: false,
          })
          .select()
          .single();

        if (!error && newMilestone) {
          newMilestones.push(newMilestone as Milestone);
        }
      }
    }
  }

  return newMilestones;
}

/**
 * Update streak counters in user profile or habit
 * This can be called after check-ins to keep streak data up to date
 */
export async function updateStreakCounters(
  userId: string,
  habitId: string,
  quitDate: string
): Promise<void> {
  const streakData = await getStreakData(userId, habitId, quitDate);
  
  // Optionally update a streak tracking table or user profile
  // For now, we'll just ensure milestones are checked
  await checkAndAwardMilestones(userId, habitId, streakData.days_clean);
}

