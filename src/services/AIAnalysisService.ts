import StorageService from './StorageService';
import { useHabitStore } from '../store/habitStore';

interface Analysis {
  riskScore: number; // 0-100
  insights: string[];
  recommendations: string[];
  patterns: {
    peakUrgeTime: string;
    commonTriggers: string[];
    successRate: number;
    streakTrend: 'improving' | 'declining' | 'stable';
  };
  prediction: {
    nextUrgeRisk: 'low' | 'medium' | 'high';
    estimatedTime: string;
  };
}

class AIAnalysisService {
  async analyzeHabitData(habitId: string): Promise<Analysis> {
    const { habits, urgeLogs } = useHabitStore.getState();
    const habit = habits.find(h => h.id === habitId);
    const habitUrges = urgeLogs.filter(log => log.habitId === habitId);

    if (!habit || habitUrges.length === 0) {
      return this.getDefaultAnalysis();
    }

    // Time-based analysis
    const hourCounts: Record<number, number> = {};
    habitUrges.forEach(urge => {
      const hour = new Date(urge.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '0';
    const peakUrgeTime = this.formatPeakTime(parseInt(peakHour));

    // Trigger analysis
    const triggerCounts: Record<string, number> = {};
    habitUrges.forEach(urge => {
      const triggers = urge.trigger.split(',').map(t => t.trim());
      triggers.forEach(trigger => {
        if (trigger) {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        }
      });
    });
    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    // Success rate
    const urgesOvercome = habitUrges.filter(log => log.overcome).length;
    const successRate = Math.round((urgesOvercome / habitUrges.length) * 100);

    // Streak trend
    const recentUrges = habitUrges.slice(0, 10);
    const olderUrges = habitUrges.slice(10, 20);
    const recentSuccess = recentUrges.filter(u => u.overcome).length / Math.max(recentUrges.length, 1);
    const olderSuccess = olderUrges.filter(u => u.overcome).length / Math.max(olderUrges.length, 1);
    const streakTrend = recentSuccess > olderSuccess ? 'improving' : 
                       recentSuccess < olderSuccess ? 'declining' : 'stable';

    // Risk calculation
    const riskScore = this.calculateRiskScore(habitUrges, habit);

    // Generate insights
    const insights = this.generateInsights(habitUrges, habit, successRate, streakTrend);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      riskScore,
      commonTriggers,
      peakUrgeTime,
      streakTrend
    );

    // Predict next urge
    const prediction = this.predictNextUrge(habitUrges, riskScore);

    return {
      riskScore,
      insights,
      recommendations,
      patterns: {
        peakUrgeTime,
        commonTriggers,
        successRate,
        streakTrend,
      },
      prediction,
    };
  }

  private calculateRiskScore(urges: any[], habit: any): number {
    let risk = 0;

    // Recent urge frequency (0-40 points)
    const last7Days = urges.filter(u => {
      const daysDiff = (Date.now() - new Date(u.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    risk += Math.min(last7Days.length * 5, 40);

    // Average intensity (0-30 points)
    const avgIntensity = urges.length > 0
      ? urges.reduce((sum, u) => sum + u.intensity, 0) / urges.length
      : 0;
    risk += (avgIntensity / 10) * 30;

    // Streak health (0-30 points)
    const streakRisk = habit.currentStreak < 7 ? 30 :
                      habit.currentStreak < 14 ? 20 :
                      habit.currentStreak < 30 ? 10 : 0;
    risk += streakRisk;

    return Math.min(Math.round(risk), 100);
  }

  private generateInsights(urges: any[], habit: any, successRate: number, trend: string): string[] {
    const insights: string[] = [];

    if (successRate > 80) {
      insights.push('🌟 Excellent progress! You\'re overcoming most urges successfully.');
    } else if (successRate > 60) {
      insights.push('💪 Good job! You\'re showing strong resilience against urges.');
    } else if (successRate > 40) {
      insights.push('📈 You\'re making progress. Keep working on your strategies.');
    } else {
      insights.push('🎯 Focus needed. Let\'s work on building better coping mechanisms.');
    }

    if (trend === 'improving') {
      insights.push('📊 Your success rate is improving over time. Great work!');
    } else if (trend === 'declining') {
      insights.push('⚠️ Recent struggles detected. Let\'s reinforce your strategies.');
    }

    if (habit.currentStreak >= 30) {
      insights.push('🔥 Amazing 30+ day streak! You\'re building lasting change.');
    } else if (habit.currentStreak >= 7) {
      insights.push('✨ One week strong! The hardest part is behind you.');
    }

    return insights;
  }

  private generateRecommendations(
    riskScore: number,
    triggers: string[],
    peakTime: string,
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('🆘 High risk detected. Use the panic button if needed.');
      recommendations.push('🤝 Consider reaching out to your accountability partner.');
    }

    if (triggers.length > 0) {
      recommendations.push(`🎯 Avoid these triggers: ${triggers.slice(0, 2).join(', ')}`);
    }

    recommendations.push(`⏰ Be extra vigilant around ${peakTime}`);

    if (trend === 'declining') {
      recommendations.push('💡 Try the habit exercises to strengthen your resolve.');
      recommendations.push('📝 Journal about your recent struggles to identify patterns.');
    }

    recommendations.push('🏃 Physical exercise reduces urges by up to 60%');
    recommendations.push('🧘 Practice 5-minute meditation when feeling triggered');

    return recommendations;
  }

  private predictNextUrge(urges: any[], riskScore: number): {
    nextUrgeRisk: 'low' | 'medium' | 'high';
    estimatedTime: string;
  } {
    const risk = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';
    
    // Calculate average time between urges
    if (urges.length < 2) {
      return { nextUrgeRisk: risk, estimatedTime: 'No pattern yet' };
    }

    const times = urges.map(u => new Date(u.timestamp).getTime());
    const intervals = times.slice(0, -1).map((time, i) => times[i + 1] - time);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    const hours = Math.round(avgInterval / (1000 * 60 * 60));
    const estimatedTime = hours < 24 
      ? `Within ${hours} hours`
      : `Within ${Math.round(hours / 24)} days`;

    return { nextUrgeRisk: risk, estimatedTime };
  }

  private formatPeakTime(hour: number): string {
    if (hour >= 5 && hour < 12) return 'Morning (5AM-12PM)';
    if (hour >= 12 && hour < 17) return 'Afternoon (12PM-5PM)';
    if (hour >= 17 && hour < 21) return 'Evening (5PM-9PM)';
    return 'Night (9PM-5AM)';
  }

  private getDefaultAnalysis(): Analysis {
    return {
      riskScore: 50,
      insights: [
        '📊 Start logging urges to get personalized insights',
        '🎯 The more data you provide, the better we can help',
      ],
      recommendations: [
        '📝 Log your first urge to begin analysis',
        '💪 Complete daily exercises to build resilience',
        '📸 Take your first progress selfie',
      ],
      patterns: {
        peakUrgeTime: 'Not enough data',
        commonTriggers: [],
        successRate: 0,
        streakTrend: 'stable',
      },
      prediction: {
        nextUrgeRisk: 'medium',
        estimatedTime: 'Not enough data',
      },
    };
  }
}

export default new AIAnalysisService();