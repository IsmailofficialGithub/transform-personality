import { Habit, UrgeLog } from '../store/habitStore';

export interface AnalyticsData {
  // Time-based patterns
  peakUrgeHours: { hour: number; count: number }[];
  peakUrgeDays: { day: string; count: number }[];
  urgeFrequencyTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Trigger analysis
  topTriggers: { trigger: string; count: number; successRate: number }[];
  triggerSuccessRates: { [key: string]: number };
  
  // Success metrics
  overallSuccessRate: number;
  weeklySuccessRate: number;
  monthlySuccessRate: number;
  longestSuccessStreak: number;
  currentSuccessStreak: number;
  
  // Improvement tracking
  improvementScore: number; // 0-100
  improvementTrend: 'improving' | 'declining' | 'stable';
  weeklyComparison: {
    thisWeek: number;
    lastWeek: number;
    change: number;
    percentChange: number;
  };
  
  // Risk assessment
  riskScore: number; // 0-100 (higher = more risk)
  riskFactors: string[];
  protectiveFactors: string[];
  
  // Predictions
  nextLikelyUrgeTime: Date | null;
  highRiskPeriods: { start: Date; end: Date }[];
  
  // Insights
  insights: AnalyticsInsight[];
  recommendations: string[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  icon: string;
  priority: number;
}

export class AnalyticsEngine {
  
  // 📊 Main analytics calculation
  static calculateAnalytics(habits: Habit[], urgeLogs: UrgeLog[]): AnalyticsData {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter logs by time periods
    const weeklyLogs = urgeLogs.filter(log => new Date(log.timestamp) >= oneWeekAgo);
    const monthlyLogs = urgeLogs.filter(log => new Date(log.timestamp) >= oneMonthAgo);
    const lastWeekLogs = urgeLogs.filter(log => {
      const date = new Date(log.timestamp);
      return date >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < oneWeekAgo;
    });

    // Calculate all metrics
    const peakUrgeHours = this.calculatePeakUrgeHours(urgeLogs);
    const peakUrgeDays = this.calculatePeakUrgeDays(urgeLogs);
    const urgeFrequencyTrend = this.calculateUrgeFrequencyTrend(urgeLogs);
    const topTriggers = this.calculateTopTriggers(urgeLogs);
    const triggerSuccessRates = this.calculateTriggerSuccessRates(urgeLogs);
    const overallSuccessRate = this.calculateSuccessRate(urgeLogs);
    const weeklySuccessRate = this.calculateSuccessRate(weeklyLogs);
    const monthlySuccessRate = this.calculateSuccessRate(monthlyLogs);
    const { longestSuccessStreak, currentSuccessStreak } = this.calculateSuccessStreaks(urgeLogs);
    const improvementScore = this.calculateImprovementScore(urgeLogs, habits);
    const improvementTrend = this.calculateImprovementTrend(weeklyLogs, lastWeekLogs);
    const weeklyComparison = this.calculateWeeklyComparison(weeklyLogs, lastWeekLogs);
    const riskScore = this.calculateRiskScore(urgeLogs, habits);
    const { riskFactors, protectiveFactors } = this.identifyRiskFactors(urgeLogs, habits);
    const nextLikelyUrgeTime = this.predictNextUrgeTime(urgeLogs);
    const highRiskPeriods = this.identifyHighRiskPeriods(urgeLogs);
    const insights = this.generateInsights(urgeLogs, habits);
    const recommendations = this.generateRecommendations(urgeLogs, habits);

    return {
      peakUrgeHours,
      peakUrgeDays,
      urgeFrequencyTrend,
      topTriggers,
      triggerSuccessRates,
      overallSuccessRate,
      weeklySuccessRate,
      monthlySuccessRate,
      longestSuccessStreak,
      currentSuccessStreak,
      improvementScore,
      improvementTrend,
      weeklyComparison,
      riskScore,
      riskFactors,
      protectiveFactors,
      nextLikelyUrgeTime,
      highRiskPeriods,
      insights,
      recommendations,
    };
  }

  // 🕐 Peak urge hours analysis
  static calculatePeakUrgeHours(logs: UrgeLog[]): { hour: number; count: number }[] {
    const hourCounts: { [key: number]: number } = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // 📅 Peak urge days analysis
  static calculatePeakUrgeDays(logs: UrgeLog[]): { day: string; count: number }[] {
    const dayCounts: { [key: string]: number } = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    logs.forEach(log => {
      const day = days[new Date(log.timestamp).getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    return Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);
  }

  // 📈 Urge frequency trend
  static calculateUrgeFrequencyTrend(logs: UrgeLog[]): 'increasing' | 'decreasing' | 'stable' {
    if (logs.length < 14) return 'stable';

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = logs.filter(log => new Date(log.timestamp) >= oneWeekAgo).length;
    const lastWeek = logs.filter(log => {
      const date = new Date(log.timestamp);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    if (thisWeek > lastWeek * 1.2) return 'increasing';
    if (thisWeek < lastWeek * 0.8) return 'decreasing';
    return 'stable';
  }

  // 🎯 Top triggers analysis
  static calculateTopTriggers(logs: UrgeLog[]): { trigger: string; count: number; successRate: number }[] {
    const triggerData: { [key: string]: { count: number; overcome: number } } = {};

    logs.forEach(log => {
      const trigger = log.trigger || 'Unknown';
      if (!triggerData[trigger]) {
        triggerData[trigger] = { count: 0, overcome: 0 };
      }
      triggerData[trigger].count++;
      if (log.overcome) {
        triggerData[trigger].overcome++;
      }
    });

    return Object.entries(triggerData)
      .map(([trigger, data]) => ({
        trigger,
        count: data.count,
        successRate: data.count > 0 ? (data.overcome / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // ✅ Trigger success rates
  static calculateTriggerSuccessRates(logs: UrgeLog[]): { [key: string]: number } {
    const triggerData: { [key: string]: { total: number; overcome: number } } = {};

    logs.forEach(log => {
      const trigger = log.trigger || 'Unknown';
      if (!triggerData[trigger]) {
        triggerData[trigger] = { total: 0, overcome: 0 };
      }
      triggerData[trigger].total++;
      if (log.overcome) {
        triggerData[trigger].overcome++;
      }
    });

    const rates: { [key: string]: number } = {};
    Object.entries(triggerData).forEach(([trigger, data]) => {
      rates[trigger] = data.total > 0 ? (data.overcome / data.total) * 100 : 0;
    });

    return rates;
  }

  // 📊 Success rate calculation
  static calculateSuccessRate(logs: UrgeLog[]): number {
    if (logs.length === 0) return 100;
    const overcome = logs.filter(log => log.overcome).length;
    return (overcome / logs.length) * 100;
  }

  // 🔥 Success streaks
  static calculateSuccessStreaks(logs: UrgeLog[]): { longestSuccessStreak: number; currentSuccessStreak: number } {
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    sortedLogs.forEach(log => {
      if (log.overcome) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak from end
    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      if (sortedLogs[i].overcome) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { longestSuccessStreak: longestStreak, currentSuccessStreak };
  }

  // 📈 Improvement score (0-100)
  static calculateImprovementScore(logs: UrgeLog[], habits: Habit[]): number {
    let score = 50; // Base score

    // Factor 1: Success rate (0-30 points)
    const successRate = this.calculateSuccessRate(logs);
    score += (successRate / 100) * 30;

    // Factor 2: Urge frequency trend (0-20 points)
    const trend = this.calculateUrgeFrequencyTrend(logs);
    if (trend === 'decreasing') score += 20;
    else if (trend === 'stable') score += 10;

    // Factor 3: Current streaks (0-20 points)
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    score += Math.min(20, totalStreak / 5);

    // Factor 4: Recent performance (0-30 points)
    const recentLogs = logs.slice(-10);
    const recentSuccess = this.calculateSuccessRate(recentLogs);
    score += (recentSuccess / 100) * 30;

    return Math.min(100, Math.max(0, score));
  }

  // 📉 Improvement trend
  static calculateImprovementTrend(
    thisWeek: UrgeLog[], 
    lastWeek: UrgeLog[]
  ): 'improving' | 'declining' | 'stable' {
    const thisWeekSuccess = this.calculateSuccessRate(thisWeek);
    const lastWeekSuccess = this.calculateSuccessRate(lastWeek);

    if (thisWeekSuccess > lastWeekSuccess + 10) return 'improving';
    if (thisWeekSuccess < lastWeekSuccess - 10) return 'declining';
    return 'stable';
  }

  // 📊 Weekly comparison
  static calculateWeeklyComparison(thisWeek: UrgeLog[], lastWeek: UrgeLog[]) {
    const thisWeekCount = thisWeek.length;
    const lastWeekCount = lastWeek.length;
    const change = thisWeekCount - lastWeekCount;
    const percentChange = lastWeekCount > 0 
      ? ((change / lastWeekCount) * 100) 
      : 0;

    return {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      change,
      percentChange,
    };
  }

  // 🚨 Risk score (0-100, higher = more risk)
  static calculateRiskScore(logs: UrgeLog[], habits: Habit[]): number {
    let risk = 0;

    // Factor 1: Recent urge frequency
    const recentLogs = logs.slice(-7);
    risk += Math.min(30, recentLogs.length * 4);

    // Factor 2: Success rate
    const successRate = this.calculateSuccessRate(logs);
    risk += (100 - successRate) * 0.3;

    // Factor 3: Urge intensity
    const avgIntensity = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.intensity, 0) / logs.length
      : 0;
    risk += avgIntensity * 6;

    // Factor 4: Streak status
    const avgStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length
      : 0;
    risk += Math.max(0, 20 - avgStreak);

    return Math.min(100, Math.max(0, risk));
  }

  // 🎯 Identify risk and protective factors
  static identifyRiskFactors(logs: UrgeLog[], habits: Habit[]): { riskFactors: string[]; protectiveFactors: string[] } {
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];

    // Analyze urge patterns
    const recentLogs = logs.slice(-7);
    if (recentLogs.length > 5) {
      riskFactors.push('High urge frequency this week');
    }

    const successRate = this.calculateSuccessRate(logs);
    if (successRate < 50) {
      riskFactors.push('Low success rate in overcoming urges');
    } else if (successRate > 80) {
      protectiveFactors.push('High success rate in overcoming urges');
    }

    const peakHours = this.calculatePeakUrgeHours(logs);
    if (peakHours.length > 0 && peakHours[0].count > 3) {
      riskFactors.push(`Peak urge times identified: ${peakHours[0].hour}:00`);
    }

    habits.forEach(habit => {
      if (habit.currentStreak > 30) {
        protectiveFactors.push(`Strong ${habit.customName || habit.type} streak`);
      } else if (habit.currentStreak < 3) {
        riskFactors.push(`Weak ${habit.customName || habit.type} streak`);
      }
    });

    return { riskFactors, protectiveFactors };
  }

  // 🔮 Predict next likely urge time
  static predictNextUrgeTime(logs: UrgeLog[]): Date | null {
    if (logs.length < 5) return null;

    const peakHours = this.calculatePeakUrgeHours(logs);
    if (peakHours.length === 0) return null;

    const mostLikelyHour = peakHours[0].hour;
    const now = new Date();
    const prediction = new Date(now);
    prediction.setHours(mostLikelyHour, 0, 0, 0);

    if (prediction <= now) {
      prediction.setDate(prediction.getDate() + 1);
    }

    return prediction;
  }

  // ⚠️ Identify high-risk periods
  static identifyHighRiskPeriods(logs: UrgeLog[]): { start: Date; end: Date }[] {
    const peakHours = this.calculatePeakUrgeHours(logs).slice(0, 3);
    const periods: { start: Date; end: Date }[] = [];

    peakHours.forEach(({ hour }) => {
      const now = new Date();
      const start = new Date(now);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 2, 0, 0, 0);

      periods.push({ start, end });
    });

    return periods;
  }

  // 💡 Generate insights
  static generateInsights(logs: UrgeLog[], habits: Habit[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const successRate = this.calculateSuccessRate(logs);
    const trend = this.calculateUrgeFrequencyTrend(logs);

    // Success insights
    if (successRate > 80) {
      insights.push({
        id: '1',
        type: 'success',
        title: 'Excellent Control',
        message: `You're overcoming ${successRate.toFixed(0)}% of urges! Keep it up!`,
        icon: '🎉',
        priority: 1,
      });
    }

    // Improvement insights
    if (trend === 'decreasing') {
      insights.push({
        id: '2',
        type: 'success',
        title: 'Positive Trend',
        message: 'Your urges are decreasing over time. Great progress!',
        icon: '📈',
        priority: 2,
      });
    } else if (trend === 'increasing') {
      insights.push({
        id: '3',
        type: 'warning',
        title: 'Increased Activity',
        message: 'Your urges are increasing. Consider reviewing your triggers.',
        icon: '⚠️',
        priority: 1,
      });
    }

    // Streak insights
    habits.forEach(habit => {
      if (habit.currentStreak > 30) {
        insights.push({
          id: `streak-${habit.id}`,
          type: 'achievement',
          title: 'Strong Streak',
          message: `${habit.currentStreak} days clean from ${habit.customName || habit.type}!`,
          icon: '🔥',
          priority: 2,
        });
      }
    });

    return insights.sort((a, b) => a.priority - b.priority);
  }

  // 🎯 Generate recommendations
  static generateRecommendations(logs: UrgeLog[], habits: Habit[]): string[] {
    const recommendations: string[] = [];
    const peakHours = this.calculatePeakUrgeHours(logs);
    const topTriggers = this.calculateTopTriggers(logs);
    const successRate = this.calculateSuccessRate(logs);

    // Peak hours recommendations
    if (peakHours.length > 0) {
      recommendations.push(
        `Plan activities during your peak urge time (${peakHours[0].hour}:00) to stay distracted.`
      );
    }

    // Trigger recommendations
    if (topTriggers.length > 0 && topTriggers[0].successRate < 50) {
      recommendations.push(
        `Work on avoiding or managing "${topTriggers[0].trigger}" - your most challenging trigger.`
      );
    }

    // Success rate recommendations
    if (successRate < 50) {
      recommendations.push(
        'Try the breathing exercises or games when you feel an urge coming.'
      );
    }

    // Streak recommendations
    const weakStreaks = habits.filter(h => h.currentStreak < 7);
    if (weakStreaks.length > 0) {
      recommendations.push(
        'Focus on building consistency. Check in daily to strengthen your streak.'
      );
    }

    // General recommendations
    recommendations.push(
      'Share your progress with an accountability partner for extra support.',
      'Track your selfies weekly to see visual progress over time.'
    );

    return recommendations.slice(0, 5);
  }
}