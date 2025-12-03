import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit, PatternInsight } from '../types';
import { analyzePatterns, getPatternInsights, savePatternInsights } from '../services/patternService';
import { TrendingUp, Clock, MapPin, Smile, AlertCircle, Lightbulb } from 'lucide-react-native';

interface PatternAnalysisProps {
  habit: Habit;
}

export default function PatternAnalysis({ habit }: PatternAnalysisProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [patterns, setPatterns] = useState<{
    timePatterns: Array<{ time: string; count: number }>;
    placePatterns: Array<{ place: string; count: number }>;
    moodPatterns: Array<{ mood: number; count: number }>;
    categoryPatterns: Array<{ category: string; count: number }>;
    dayOfWeekPatterns: Array<{ day: string; count: number }>;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    loadPatterns();
  }, [habit.id]);

  async function loadPatterns() {
    setLoading(true);
    try {
      // Get saved insights
      const savedInsights = await getPatternInsights(habit.user_id, habit.id);
      setInsights(savedInsights);

      // Analyze patterns
      const analysis = await analyzePatterns(habit.user_id, habit.id);
      setPatterns(analysis);

      // Save insights if we have new data
      if (analysis.suggestions.length > 0) {
        await savePatternInsights(habit.user_id, habit.id, analysis);
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPatterns();
    setRefreshing(false);
  }

  if (loading && !patterns) {
    return (
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border"
      >
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (!patterns || (patterns.timePatterns.length === 0 && patterns.placePatterns.length === 0)) {
    return (
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border"
      >
        <View className="flex-row items-center mb-2">
          <TrendingUp size={20} color={theme.primary} />
          <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
            Pattern Analysis
          </Text>
        </View>
        <Text style={{ color: theme.text.secondary }} className="text-sm">
          No trigger data yet. Start logging triggers to see patterns and insights.
        </Text>
      </View>
    );
  }

  const PatternBar = ({
    label,
    count,
    maxCount,
    icon: Icon,
  }: {
    label: string;
    count: number;
    maxCount: number;
    icon: any;
  }) => {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Icon size={16} color={theme.text.secondary} />
            <Text style={{ color: theme.text.primary }} className="text-sm font-medium ml-2 flex-1">
              {label}
            </Text>
          </View>
          <Text style={{ color: theme.text.secondary }} className="text-sm font-bold">
            {count}
          </Text>
        </View>
        <View
          style={{ backgroundColor: theme.base.surface, height: 8, borderRadius: 4 }}
          className="overflow-hidden"
        >
          <View
            style={{
              backgroundColor: theme.primary,
              width: `${percentage}%`,
              height: '100%',
              borderRadius: 4,
            }}
          />
        </View>
      </View>
    );
  };

  const maxTimeCount = patterns.timePatterns[0]?.count || 1;
  const maxPlaceCount = patterns.placePatterns[0]?.count || 1;
  const maxCategoryCount = patterns.categoryPatterns[0]?.count || 1;
  const maxDayCount = patterns.dayOfWeekPatterns[0]?.count || 1;

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <TrendingUp size={20} color={theme.primary} />
          <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
            Pattern Analysis
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={{ color: theme.primary }} className="text-sm font-medium">
              Refresh
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {/* Time Patterns */}
        {patterns.timePatterns.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Clock size={16} color={theme.text.secondary} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Time Patterns
              </Text>
            </View>
            {patterns.timePatterns.slice(0, 5).map((pattern) => (
              <PatternBar
                key={pattern.time}
                label={pattern.time}
                count={pattern.count}
                maxCount={maxTimeCount}
                icon={Clock}
              />
            ))}
          </View>
        )}

        {/* Place Patterns */}
        {patterns.placePatterns.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <MapPin size={16} color={theme.text.secondary} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Location Patterns
              </Text>
            </View>
            {patterns.placePatterns.slice(0, 5).map((pattern) => (
              <PatternBar
                key={pattern.place}
                label={pattern.place}
                count={pattern.count}
                maxCount={maxPlaceCount}
                icon={MapPin}
              />
            ))}
          </View>
        )}

        {/* Category Patterns */}
        {patterns.categoryPatterns.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <AlertCircle size={16} color={theme.text.secondary} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Trigger Categories
              </Text>
            </View>
            {patterns.categoryPatterns.slice(0, 5).map((pattern) => (
              <PatternBar
                key={pattern.category}
                label={pattern.category.charAt(0).toUpperCase() + pattern.category.slice(1)}
                count={pattern.count}
                maxCount={maxCategoryCount}
                icon={AlertCircle}
              />
            ))}
          </View>
        )}

        {/* Day of Week Patterns */}
        {patterns.dayOfWeekPatterns.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Clock size={16} color={theme.text.secondary} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Day of Week Patterns
              </Text>
            </View>
            {patterns.dayOfWeekPatterns.slice(0, 7).map((pattern) => (
              <PatternBar
                key={pattern.day}
                label={pattern.day}
                count={pattern.count}
                maxCount={maxDayCount}
                icon={Clock}
              />
            ))}
          </View>
        )}

        {/* Suggestions */}
        {patterns.suggestions.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Lightbulb size={16} color={theme.status.warning} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Suggestions
              </Text>
            </View>
            {patterns.suggestions.map((suggestion, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: theme.status.warning + '15',
                  borderLeftColor: theme.status.warning,
                  borderLeftWidth: 3,
                }}
                className="p-3 rounded-lg mb-2"
              >
                <Text style={{ color: theme.text.primary }} className="text-sm">
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Saved Insights */}
        {insights.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <TrendingUp size={16} color={theme.text.secondary} />
              <Text style={{ color: theme.text.primary }} className="text-base font-bold ml-2">
                Key Insights
              </Text>
            </View>
            {insights.map((insight) => (
              <View
                key={insight.id}
                style={{
                  backgroundColor: theme.base.surface,
                  borderColor: theme.base.border,
                }}
                className="p-3 rounded-lg mb-2 border"
              >
                <Text style={{ color: theme.text.primary }} className="text-sm font-medium mb-1">
                  {insight.pattern_description}
                </Text>
                {insight.suggested_action && (
                  <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                    💡 {insight.suggested_action}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

