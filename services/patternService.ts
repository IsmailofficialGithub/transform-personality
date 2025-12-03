import { supabase } from './supabase';
import { TriggerLog, PatternInsight } from '../types';

interface PatternAnalysis {
  timePatterns: Array<{ time: string; count: number }>;
  placePatterns: Array<{ place: string; count: number }>;
  moodPatterns: Array<{ mood: number; count: number }>;
  categoryPatterns: Array<{ category: string; count: number }>;
  dayOfWeekPatterns: Array<{ day: string; count: number }>;
  suggestions: string[];
}

/**
 * Analyze trigger logs to identify patterns
 */
export async function analyzePatterns(
  userId: string,
  habitId: string
): Promise<PatternAnalysis> {
  try {
    const { data: triggerLogs, error } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('created_at', { ascending: false })
      .limit(100); // Analyze last 100 logs

    if (error || !triggerLogs || triggerLogs.length === 0) {
      return {
        timePatterns: [],
        placePatterns: [],
        moodPatterns: [],
        categoryPatterns: [],
        dayOfWeekPatterns: [],
        suggestions: [],
      };
    }

    // Analyze time patterns
    const timeMap = new Map<string, number>();
    triggerLogs.forEach((log) => {
      if (log.time_of_day) {
        const hour = parseInt(log.time_of_day.split(':')[0]);
        const timeSlot = getTimeSlot(hour);
        timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + 1);
      }
    });
    const timePatterns = Array.from(timeMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count);

    // Analyze place patterns
    const placeMap = new Map<string, number>();
    triggerLogs.forEach((log) => {
      if (log.location) {
        placeMap.set(log.location, (placeMap.get(log.location) || 0) + 1);
      }
    });
    const placePatterns = Array.from(placeMap.entries())
      .map(([place, count]) => ({ place, count }))
      .sort((a, b) => b.count - a.count);

    // Analyze mood patterns
    const moodMap = new Map<number, number>();
    triggerLogs.forEach((log) => {
      if (log.mood_context) {
        moodMap.set(log.mood_context, (moodMap.get(log.mood_context) || 0) + 1);
      }
    });
    const moodPatterns = Array.from(moodMap.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);

    // Analyze category patterns
    const categoryMap = new Map<string, number>();
    triggerLogs.forEach((log) => {
      if (log.trigger_category) {
        categoryMap.set(log.trigger_category, (categoryMap.get(log.trigger_category) || 0) + 1);
      }
    });
    const categoryPatterns = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Analyze day of week patterns
    const dayMap = new Map<string, number>();
    triggerLogs.forEach((log) => {
      if (log.day_of_week !== undefined) {
        const dayName = getDayName(log.day_of_week);
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
      }
    });
    const dayOfWeekPatterns = Array.from(dayMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);

    // Generate suggestions
    const suggestions = generateSuggestions({
      timePatterns,
      placePatterns,
      moodPatterns,
      categoryPatterns,
      dayOfWeekPatterns,
      triggerLogs,
    });

    return {
      timePatterns,
      placePatterns,
      moodPatterns,
      categoryPatterns,
      dayOfWeekPatterns,
      suggestions,
    };
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return {
      timePatterns: [],
      placePatterns: [],
      moodPatterns: [],
      categoryPatterns: [],
      dayOfWeekPatterns: [],
      suggestions: [],
    };
  }
}

/**
 * Get time slot from hour (0-23)
 */
function getTimeSlot(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning (5am-12pm)';
  if (hour >= 12 && hour < 17) return 'Afternoon (12pm-5pm)';
  if (hour >= 17 && hour < 21) return 'Evening (5pm-9pm)';
  return 'Night (9pm-5am)';
}

/**
 * Get day name from day of week (0-6, 0 = Sunday)
 */
function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Generate actionable suggestions based on patterns
 */
function generateSuggestions(analysis: {
  timePatterns: Array<{ time: string; count: number }>;
  placePatterns: Array<{ place: string; count: number }>;
  moodPatterns: Array<{ mood: number; count: number }>;
  categoryPatterns: Array<{ category: string; count: number }>;
  dayOfWeekPatterns: Array<{ day: string; count: number }>;
  triggerLogs: TriggerLog[];
}): string[] {
  const suggestions: string[] = [];
  const totalLogs = analysis.triggerLogs.length;

  // Time-based suggestions
  if (analysis.timePatterns.length > 0) {
    const topTime = analysis.timePatterns[0];
    if (topTime.count >= totalLogs * 0.3) {
      // If 30%+ of triggers happen at this time
      suggestions.push(
        `You often experience triggers during ${topTime.time}. Consider scheduling a distraction activity during this time.`
      );
    }
  }

  // Place-based suggestions
  if (analysis.placePatterns.length > 0) {
    const topPlace = analysis.placePatterns[0];
    if (topPlace.count >= totalLogs * 0.3) {
      suggestions.push(
        `Many triggers occur at "${topPlace.place}". Consider avoiding this location or preparing coping strategies when you must be there.`
      );
    }
  }

  // Category-based suggestions
  if (analysis.categoryPatterns.length > 0) {
    const topCategory = analysis.categoryPatterns[0];
    const categorySuggestions: Record<string, string> = {
      stress: 'Stress is a major trigger. Try incorporating stress-reduction techniques like deep breathing or meditation.',
      boredom: 'Boredom triggers are common. Keep a list of engaging activities ready for when you feel bored.',
      social: 'Social situations trigger you. Consider practicing refusal skills or bringing a support person.',
      mood: 'Your mood affects triggers. Track your mood patterns and plan activities for low-mood days.',
      time: 'Time-based triggers suggest routine. Try changing your routine to break the pattern.',
      place: 'Place-based triggers indicate environmental factors. Modify your environment or avoid trigger locations.',
    };
    if (categorySuggestions[topCategory.category]) {
      suggestions.push(categorySuggestions[topCategory.category]);
    }
  }

  // Day of week suggestions
  if (analysis.dayOfWeekPatterns.length > 0) {
    const topDay = analysis.dayOfWeekPatterns[0];
    if (topDay.count >= totalLogs * 0.25) {
      suggestions.push(
        `${topDay.day}s are particularly challenging. Plan extra support or activities on this day.`
      );
    }
  }

  // Overcome rate analysis
  const overcameCount = analysis.triggerLogs.filter((log) => log.overcame).length;
  const overcomeRate = overcameCount / totalLogs;
  if (overcomeRate < 0.5) {
    suggestions.push(
      'Your overcome rate is below 50%. Consider developing stronger coping strategies or seeking additional support.'
    );
  } else if (overcomeRate > 0.8) {
    suggestions.push(
      'Great job! You overcome most triggers. Keep using the strategies that work for you.'
    );
  }

  // Coping strategy analysis
  const logsWithStrategies = analysis.triggerLogs.filter(
    (log) => log.coping_strategy_used && log.overcame
  );
  if (logsWithStrategies.length > 0) {
    const strategyMap = new Map<string, number>();
    logsWithStrategies.forEach((log) => {
      const strategy = log.coping_strategy_used?.toLowerCase() || '';
      // Extract key words from strategy
      const words = strategy.split(/\s+/).filter((w) => w.length > 3);
      words.forEach((word) => {
        strategyMap.set(word, (strategyMap.get(word) || 0) + 1);
      });
    });
    const topStrategies = Array.from(strategyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([strategy]) => strategy);
    if (topStrategies.length > 0) {
      suggestions.push(
        `Your most effective coping strategies involve: ${topStrategies.join(', ')}. Use these more often!`
      );
    }
  }

  return suggestions;
}

/**
 * Save pattern insights to database
 */
export async function savePatternInsights(
  userId: string,
  habitId: string,
  analysis: PatternAnalysis
): Promise<void> {
  try {
    // Delete existing insights
    await supabase.from('pattern_insights').delete().eq('user_id', userId).eq('habit_id', habitId);

    // Save time pattern insights
    if (analysis.timePatterns.length > 0) {
      const topTime = analysis.timePatterns[0];
      await supabase.from('pattern_insights').insert({
        user_id: userId,
        habit_id: habitId,
        insight_type: 'time_pattern',
        pattern_description: `Most triggers occur during ${topTime.time} (${topTime.count} occurrences)`,
        frequency_count: topTime.count,
        suggested_action: `Schedule activities during ${topTime.time} to reduce triggers`,
        confidence_score: Math.min(1.0, topTime.count / 10),
      });
    }

    // Save place pattern insights
    if (analysis.placePatterns.length > 0) {
      const topPlace = analysis.placePatterns[0];
      await supabase.from('pattern_insights').insert({
        user_id: userId,
        habit_id: habitId,
        insight_type: 'place_pattern',
        pattern_description: `Most triggers occur at "${topPlace.place}" (${topPlace.count} occurrences)`,
        frequency_count: topPlace.count,
        suggested_action: `Avoid or prepare for triggers at "${topPlace.place}"`,
        confidence_score: Math.min(1.0, topPlace.count / 10),
      });
    }

    // Save category pattern insights
    if (analysis.categoryPatterns.length > 0) {
      const topCategory = analysis.categoryPatterns[0];
      await supabase.from('pattern_insights').insert({
        user_id: userId,
        habit_id: habitId,
        insight_type: 'trigger_frequency',
        pattern_description: `Most common trigger category: ${topCategory.category} (${topCategory.count} occurrences)`,
        frequency_count: topCategory.count,
        suggested_action: `Focus on developing strategies for ${topCategory.category} triggers`,
        confidence_score: Math.min(1.0, topCategory.count / 10),
      });
    }
  } catch (error) {
    console.error('Error saving pattern insights:', error);
  }
}

/**
 * Get saved pattern insights from database
 */
export async function getPatternInsights(
  userId: string,
  habitId: string
): Promise<PatternInsight[]> {
  try {
    const { data, error } = await supabase
      .from('pattern_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching pattern insights:', error);
      return [];
    }

    return (data as PatternInsight[]) || [];
  } catch (error) {
    console.error('Error getting pattern insights:', error);
    return [];
  }
}

