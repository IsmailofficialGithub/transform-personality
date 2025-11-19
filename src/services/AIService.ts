import AsyncStorage from '@react-native-async-storage/async-storage';

interface UrgePattern {
  dayOfWeek: number;
  hourOfDay: number;
  intensity: number;
  triggers: string[];
}

interface RiskPrediction {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  primaryFactors: string[];
  recommendations: string[];
  nextHighRiskTime?: string;
}

class AIService {
  async analyzeUrgePatterns(): Promise<RiskPrediction> {
    try {
      // Load urge history
      const urgeLogsStr = await AsyncStorage.getItem('urgeLogs');
      const urgeLogs = urgeLogsStr ? JSON.parse(urgeLogsStr) : [];

      if (urgeLogs.length < 5) {
        return {
          riskScore: 20,
          riskLevel: 'low',
          primaryFactors: ['Not enough data yet'],
          recommendations: ['Keep logging urges to get personalized insights'],
        };
      }

      // Analyze patterns
      const patterns = this.extractPatterns(urgeLogs);
      const currentRisk = this.calculateCurrentRisk(patterns);
      
      return {
        riskScore: currentRisk.score,
        riskLevel: currentRisk.level,
        primaryFactors: currentRisk.factors,
        recommendations: this.generateRecommendations(currentRisk),
        nextHighRiskTime: this.predictNextHighRisk(patterns),
      };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return {
        riskScore: 0,
        riskLevel: 'low',
        primaryFactors: [],
        recommendations: ['Error analyzing patterns'],
      };
    }
  }

  private extractPatterns(urgeLogs: any[]): UrgePattern[] {
    return urgeLogs.map(log => {
      const date = new Date(log.timestamp);
      return {
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours(),
        intensity: log.intensity,
        triggers: log.triggers || [],
      };
    });
  }

  private calculateCurrentRisk(patterns: UrgePattern[]): {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  } {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    // Calculate risk factors
    let riskScore = 0;
    const factors: string[] = [];

    // Time-based risk
    const sameTimeUrges = patterns.filter(
      p => p.hourOfDay === currentHour
    ).length;
    
    if (sameTimeUrges > 2) {
      riskScore += 30;
      factors.push(`High risk time: ${currentHour}:00`);
    }

    // Day-based risk
    const sameDayUrges = patterns.filter(
      p => p.dayOfWeek === currentDay
    ).length;
    
    if (sameDayUrges > 3) {
      riskScore += 25;
      factors.push(`${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay]} is a trigger day`);
    }

    // Recent intensity
    const recentUrges = patterns.slice(-5);
    const avgIntensity = recentUrges.reduce((sum, p) => sum + p.intensity, 0) / recentUrges.length;
    
    if (avgIntensity > 7) {
      riskScore += 35;
      factors.push('Recent urges have been intense');
    } else if (avgIntensity > 5) {
      riskScore += 20;
      factors.push('Moderate intensity urges recently');
    }

    // Common triggers
    const triggerCounts: Record<string, number> = {};
    patterns.forEach(p => {
      p.triggers.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });

    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([trigger]) => trigger);

    if (topTriggers.length > 0) {
      riskScore += 10;
      factors.push(`Common triggers: ${topTriggers.join(', ')}`);
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 70) {
      level = 'high';
    } else if (riskScore >= 40) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { score: riskScore, level, factors };
  }

  private generateRecommendations(risk: {
    score: number;
    level: string;
    factors: string[];
  }): string[] {
    const recommendations: string[] = [];

    if (risk.level === 'high') {
      recommendations.push('🆘 Consider reaching out to your accountability partner');
      recommendations.push('🧘 Try a 5-minute breathing exercise');
      recommendations.push('🚶 Go for a short walk or change environment');
    } else if (risk.level === 'medium') {
      recommendations.push('📝 Journal about your current feelings');
      recommendations.push('💪 Review your progress and achievements');
      recommendations.push('📞 Call a supportive friend or family member');
    } else {
      recommendations.push('✅ You\'re doing great! Keep it up');
      recommendations.push('📚 Read some motivational content');
      recommendations.push('🎯 Set a new personal goal');
    }

    return recommendations;
  }

  private predictNextHighRisk(patterns: UrgePattern[]): string {
    // Find most common high-risk hour
    const hourCounts: Record<number, number> = {};
    patterns.forEach(p => {
      if (p.intensity >= 7) {
        hourCounts[p.hourOfDay] = (hourCounts[p.hourOfDay] || 0) + 1;
      }
    });

    const highRiskHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    if (highRiskHour) {
      return `${highRiskHour}:00 - ${parseInt(highRiskHour) + 1}:00`;
    }

    return 'Not enough data';
  }

  async getPredictiveAlert(): Promise<string | null> {
    const prediction = await this.analyzeUrgePatterns();
    
    if (prediction.riskLevel === 'high') {
      return `⚠️ High risk detected! Risk score: ${prediction.riskScore}%. ${prediction.recommendations[0]}`;
    } else if (prediction.riskLevel === 'medium') {
      return `⚡ Moderate risk. ${prediction.recommendations[0]}`;
    }
    
    return null;
  }
}

export default new AIService();