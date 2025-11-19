import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BodyMetrics {
  estimatedBodyFat: number;
  muscleDefinition: number;
  overallHealth: number;
  skinQuality: number;
  energyLevel: number;
}

export interface PhotoAnalysis {
  id: string;
  photoUri: string;
  timestamp: string;
  daysClean: number;
  metrics: BodyMetrics;
  improvements: string[];
  recommendations: string[];
  comparisonScore: number;
  transformationStage: 'early' | 'progress' | 'advanced' | 'mastery';
}

export interface TransformationPrediction {
  expectedChanges: {
    weeks: number;
    improvements: string[];
  }[];
  motivationalInsights: string[];
  healthWarnings: string[];
}

class AIPhotoAnalysisService {
  private readonly STORAGE_KEY = 'photo_analyses';

  // Simulate AI analysis (In production, this would call a real AI API)
  async analyzePhoto(
    photoUri: string,
    daysClean: number,
    habitType: string
  ): Promise<PhotoAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate metrics based on days clean and habit type
    const baseMetrics = this.calculateBaseMetrics(daysClean, habitType);
    const improvements = this.identifyImprovements(daysClean, baseMetrics);
    const recommendations = this.generateRecommendations(baseMetrics, daysClean);
    const stage = this.determineStage(daysClean);

    const analysis: PhotoAnalysis = {
      id: Date.now().toString(),
      photoUri,
      timestamp: new Date().toISOString(),
      daysClean,
      metrics: baseMetrics,
      improvements,
      recommendations,
      comparisonScore: this.calculateComparisonScore(baseMetrics),
      transformationStage: stage,
    };

    // Save analysis
    await this.saveAnalysis(analysis);

    return analysis;
  }

  private calculateBaseMetrics(daysClean: number, habitType: string): BodyMetrics {
    // Base improvement rate per day (%)
    const improvementRate = 0.5;
    const maxImprovement = 30;

    // Different habits affect metrics differently
    const habitMultipliers = {
      pornography: { skinQuality: 1.2, energyLevel: 1.3, muscleDefinition: 1.0 },
      smoking: { skinQuality: 1.5, energyLevel: 1.2, muscleDefinition: 0.8 },
      alcohol: { muscleDefinition: 1.3, skinQuality: 1.4, energyLevel: 1.1 },
      gaming: { energyLevel: 1.4, muscleDefinition: 0.9, skinQuality: 1.0 },
      social_media: { energyLevel: 1.2, skinQuality: 1.1, muscleDefinition: 0.9 },
    };

    const multipliers = habitMultipliers[habitType] || { 
      skinQuality: 1.0, 
      energyLevel: 1.0, 
      muscleDefinition: 1.0 
    };

    const baseImprovement = Math.min(daysClean * improvementRate, maxImprovement);

    return {
      estimatedBodyFat: Math.max(15, 25 - (daysClean * 0.1)),
      muscleDefinition: Math.min(85, 50 + baseImprovement * multipliers.muscleDefinition),
      overallHealth: Math.min(90, 60 + baseImprovement),
      skinQuality: Math.min(90, 55 + baseImprovement * multipliers.skinQuality),
      energyLevel: Math.min(95, 50 + baseImprovement * multipliers.energyLevel),
    };
  }

  private identifyImprovements(daysClean: number, metrics: BodyMetrics): string[] {
    const improvements: string[] = [];

    if (daysClean >= 7) {
      improvements.push('Visible reduction in eye bags and dark circles');
      improvements.push('Improved skin hydration and glow');
    }

    if (daysClean >= 14) {
      improvements.push('Enhanced facial symmetry and jawline definition');
      improvements.push('Reduced facial bloating');
    }

    if (daysClean >= 30) {
      improvements.push('Significant improvement in skin clarity');
      improvements.push('Enhanced muscle tone and definition');
      improvements.push('Better posture and body alignment');
    }

    if (daysClean >= 60) {
      improvements.push('Complete skin transformation visible');
      improvements.push('Optimal hormonal balance reflected in appearance');
      improvements.push('Peak physical condition achieved');
    }

    if (daysClean >= 90) {
      improvements.push('Sustained transformation excellence');
      improvements.push('Maximum vitality and energy levels');
    }

    // Metric-based improvements
    if (metrics.skinQuality > 75) {
      improvements.push('Excellent skin quality detected');
    }

    if (metrics.energyLevel > 80) {
      improvements.push('High energy levels visible in appearance');
    }

    if (metrics.muscleDefinition > 70) {
      improvements.push('Strong muscle definition visible');
    }

    return improvements;
  }

  private generateRecommendations(metrics: BodyMetrics, daysClean: number): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('Continue your current streak - you\'re on the right path!');

    if (metrics.skinQuality < 70) {
      recommendations.push('Increase water intake to 2-3L daily for better skin');
      recommendations.push('Add vitamin C serum to your skincare routine');
    }

    if (metrics.muscleDefinition < 65) {
      recommendations.push('Incorporate strength training 3-4x per week');
      recommendations.push('Increase protein intake to 1.6g per kg body weight');
    }

    if (metrics.energyLevel < 70) {
      recommendations.push('Ensure 7-9 hours of quality sleep nightly');
      recommendations.push('Add 30 minutes of cardio daily');
    }

    if (daysClean < 30) {
      recommendations.push('Focus on the first 30 days - transformation accelerates');
      recommendations.push('Take weekly progress photos for motivation');
    }

    if (daysClean >= 30 && daysClean < 90) {
      recommendations.push('You\'re in the growth phase - stay consistent');
      recommendations.push('Consider adding meditation for mental clarity');
    }

    if (daysClean >= 90) {
      recommendations.push('You\'ve achieved mastery - focus on maintenance');
      recommendations.push('Share your journey to inspire others');
    }

    // Advanced recommendations
    recommendations.push('Cold showers boost skin quality by 40%');
    recommendations.push('Intermittent fasting can accelerate fat loss');
    recommendations.push('Supplement with Omega-3 for optimal skin health');

    return recommendations;
  }

  private calculateComparisonScore(metrics: BodyMetrics): number {
    const weights = {
      skinQuality: 0.25,
      energyLevel: 0.25,
      muscleDefinition: 0.2,
      overallHealth: 0.2,
      bodyFat: 0.1,
    };

    const bodyFatScore = Math.max(0, 100 - (metrics.estimatedBodyFat - 15) * 2);

    const score =
      metrics.skinQuality * weights.skinQuality +
      metrics.energyLevel * weights.energyLevel +
      metrics.muscleDefinition * weights.muscleDefinition +
      metrics.overallHealth * weights.overallHealth +
      bodyFatScore * weights.bodyFat;

    return Math.round(score);
  }

  private determineStage(daysClean: number): 'early' | 'progress' | 'advanced' | 'mastery' {
    if (daysClean < 14) return 'early';
    if (daysClean < 30) return 'progress';
    if (daysClean < 90) return 'advanced';
    return 'mastery';
  }

  async predictTransformation(currentDays: number): Promise<TransformationPrediction> {
    const predictions: TransformationPrediction = {
      expectedChanges: [
        {
          weeks: 1,
          improvements: [
            'Clearer eyes, reduced dark circles',
            'Better sleep quality',
            'Initial energy boost',
          ],
        },
        {
          weeks: 2,
          improvements: [
            'Visible skin improvements',
            'Enhanced facial symmetry',
            'Improved mood and focus',
          ],
        },
        {
          weeks: 4,
          improvements: [
            'Significant skin transformation',
            'Enhanced muscle tone',
            'Peak mental clarity',
          ],
        },
        {
          weeks: 8,
          improvements: [
            'Complete physical transformation',
            'Optimal hormone levels',
            'Maximum confidence and energy',
          ],
        },
        {
          weeks: 12,
          improvements: [
            'Sustained excellence',
            'Permanent lifestyle change',
            'Inspiring transformation complete',
          ],
        },
      ],
      motivationalInsights: [
        'Your transformation is scientifically proven to accelerate',
        'Each day compounds your results exponentially',
        'You\'re building the best version of yourself',
        'Visible changes peak around day 60-90',
        'Your brain is rewiring for long-term success',
      ],
      healthWarnings: currentDays < 30 ? [
        'First 30 days are critical - avoid triggers',
        'Withdrawal symptoms may temporarily affect appearance',
        'Stay hydrated and maintain good nutrition',
      ] : [],
    };

    return predictions;
  }

  async comparePhotos(photo1Id: string, photo2Id: string): Promise<{
    timeDifference: number;
    improvements: string[];
    metricsComparison: {
      metric: string;
      before: number;
      after: number;
      change: number;
    }[];
    overallProgress: number;
  }> {
    const analyses = await this.getAllAnalyses();
    const analysis1 = analyses.find(a => a.id === photo1Id);
    const analysis2 = analyses.find(a => a.id === photo2Id);

    if (!analysis1 || !analysis2) {
      throw new Error('Photos not found');
    }

    const timeDiff = Math.abs(analysis2.daysClean - analysis1.daysClean);

    const metricsComparison = [
      {
        metric: 'Skin Quality',
        before: analysis1.metrics.skinQuality,
        after: analysis2.metrics.skinQuality,
        change: analysis2.metrics.skinQuality - analysis1.metrics.skinQuality,
      },
      {
        metric: 'Energy Level',
        before: analysis1.metrics.energyLevel,
        after: analysis2.metrics.energyLevel,
        change: analysis2.metrics.energyLevel - analysis1.metrics.energyLevel,
      },
      {
        metric: 'Muscle Definition',
        before: analysis1.metrics.muscleDefinition,
        after: analysis2.metrics.muscleDefinition,
        change: analysis2.metrics.muscleDefinition - analysis1.metrics.muscleDefinition,
      },
      {
        metric: 'Overall Health',
        before: analysis1.metrics.overallHealth,
        after: analysis2.metrics.overallHealth,
        change: analysis2.metrics.overallHealth - analysis1.metrics.overallHealth,
      },
    ];

    const improvements: string[] = [];
    metricsComparison.forEach(({ metric, change }) => {
      if (change > 5) {
        improvements.push(`${metric} improved by ${change.toFixed(1)}%`);
      }
    });

    const overallProgress = 
      (analysis2.comparisonScore - analysis1.comparisonScore) / analysis1.comparisonScore * 100;

    return {
      timeDifference: timeDiff,
      improvements,
      metricsComparison,
      overallProgress: Math.round(overallProgress),
    };
  }

  private async saveAnalysis(analysis: PhotoAnalysis): Promise<void> {
    try {
      const existing = await this.getAllAnalyses();
      const updated = [...existing, analysis];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  async getAllAnalyses(): Promise<PhotoAnalysis[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading analyses:', error);
      return [];
    }
  }

  async deleteAnalysis(id: string): Promise<void> {
    try {
      const analyses = await this.getAllAnalyses();
      const filtered = analyses.filter(a => a.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  }

  async getLatestAnalysis(): Promise<PhotoAnalysis | null> {
    const analyses = await this.getAllAnalyses();
    if (analyses.length === 0) return null;
    return analyses[analyses.length - 1];
  }

  async getAnalysisHistory(limit: number = 10): Promise<PhotoAnalysis[]> {
    const analyses = await this.getAllAnalyses();
    return analyses.slice(-limit).reverse();
  }
}

export default new AIPhotoAnalysisService();