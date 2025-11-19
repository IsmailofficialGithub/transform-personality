import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { useHabitStore } from '../../store/habitStore';
import AIPhotoAnalysisService, { PhotoAnalysis } from '../../services/AIPhotoAnalysisService';

const { width } = Dimensions.get('window');

interface AIPhotoAnalysisScreenProps {
  onBack: () => void;
}

export const AIPhotoAnalysisScreen = ({ onBack }: AIPhotoAnalysisScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const habits = useHabitStore((state) => state.habits);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<PhotoAnalysis[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadPreviousAnalyses();
  }, []);

  useEffect(() => {
    if (analysis) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysis]);

  const loadPreviousAnalyses = async () => {
    const history = await AIPhotoAnalysisService.getAnalysisHistory(5);
    setPreviousAnalyses(history);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery permission.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
      analyzePhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permission.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
      analyzePhoto(result.assets[0].uri);
    }
  };

  const analyzePhoto = async (photoUri: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const daysClean = habits.reduce((sum, h) => {
        const now = new Date();
        const quit = new Date(h.quitDate);
        const days = Math.floor((now.getTime() - quit.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      const habitType = habits[0]?.type || 'pornography';

      const result = await AIPhotoAnalysisService.analyzePhoto(
        photoUri,
        daysClean,
        habitType
      );

      setAnalysis(result);
      await loadPreviousAnalyses();
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getStageColor = (stage: string): string[] => {
    switch (stage) {
      case 'early': return ['#FF9800', '#F57C00'];
      case 'progress': return ['#2196F3', '#1976D2'];
      case 'advanced': return ['#9C27B0', '#7B1FA2'];
      case 'mastery': return ['#FFD700', '#FFA500'];
      default: return ['#667EEA', '#764BA2'];
    }
  };

  const getStageLabel = (stage: string): string => {
    switch (stage) {
      case 'early': return 'Early Stage';
      case 'progress': return 'Making Progress';
      case 'advanced': return 'Advanced';
      case 'mastery': return 'Mastery Achieved';
      default: return 'Unknown';
    }
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: textColor }]}>AI Analysis</Text>
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumText}>PRO</Text>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Section */}
        {!selectedPhoto && !isAnalyzing && (
          <View style={[styles.uploadSection, { backgroundColor: cardBg }]}>
            <Text style={styles.uploadEmoji}>🤖</Text>
            <Text style={[styles.uploadTitle, { color: textColor }]}>
              AI-Powered Body Analysis
            </Text>
            <Text style={[styles.uploadDescription, { color: subText }]}>
              Upload a photo and let our AI analyze your transformation progress
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePhotoOptions}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.uploadButtonGradient}
              >
                <Text style={styles.uploadButtonText}>📸 Upload Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={[styles.featureText, { color: subText }]}>
                  Body composition analysis
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={[styles.featureText, { color: subText }]}>
                  Skin quality assessment
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={[styles.featureText, { color: subText }]}>
                  Personalized recommendations
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={[styles.featureText, { color: subText }]}>
                  Progress tracking over time
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <View style={[styles.analyzingSection, { backgroundColor: cardBg }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.analyzingText, { color: textColor }]}>
              Analyzing your photo...
            </Text>
            <Text style={[styles.analyzingSubtext, { color: subText }]}>
              This may take a few seconds
            </Text>
          </View>
        )}

        {/* Analysis Results */}
        {analysis && !isAnalyzing && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Photo Preview */}
            <View style={[styles.photoPreview, { backgroundColor: cardBg }]}>
              <Image
                source={{ uri: selectedPhoto! }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.stageBadge}>
                <LinearGradient
                  colors={getStageColor(analysis.transformationStage)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.stageBadgeGradient}
                >
                  <Text style={styles.stageBadgeText}>
                    {getStageLabel(analysis.transformationStage)}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Overall Score */}
            <View style={[styles.scoreCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.scoreLabel, { color: subText }]}>
                Transformation Score
              </Text>
              <Text style={[styles.scoreValue, { color: colors.primary }]}>
                {analysis.comparisonScore}/100
              </Text>
              <View style={[styles.scoreBar, { backgroundColor: colors.border }]}>
                <LinearGradient
                  colors={colors.gradientPurple}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.scoreFill, { width: `${analysis.comparisonScore}%` }]}
                />
              </View>
            </View>

            {/* Metrics */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                📊 Body Metrics
              </Text>

              {Object.entries(analysis.metrics).map(([key, value]) => (
                <View key={key} style={[styles.metricCard, { backgroundColor: cardBg }]}>
                  <View style={styles.metricHeader}>
                    <Text style={[styles.metricName, { color: textColor }]}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {typeof value === 'number' ? `${Math.round(value)}%` : value}
                    </Text>
                  </View>
                  <View style={[styles.metricBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.metricFill,
                        {
                          width: `${typeof value === 'number' ? value : 0}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Improvements */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                🌟 Detected Improvements
              </Text>
              {analysis.improvements.map((improvement, index) => (
                <View key={index} style={[styles.improvementCard, { backgroundColor: cardBg }]}>
                  <Text style={styles.improvementBullet}>✓</Text>
                  <Text style={[styles.improvementText, { color: textColor }]}>
                    {improvement}
                  </Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                💡 AI Recommendations
              </Text>
              {analysis.recommendations.map((rec, index) => (
                <View key={index} style={[styles.recommendationCard, { backgroundColor: cardBg }]}>
                  <View style={styles.recNumber}>
                    <Text style={styles.recNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.recommendationText, { color: textColor }]}>
                    {rec}
                  </Text>
                </View>
              ))}
            </View>

            {/* New Analysis Button */}
            <TouchableOpacity
              style={styles.newAnalysisButton}
              onPress={() => {
                setSelectedPhoto(null);
                setAnalysis(null);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newAnalysisGradient}
              >
                <Text style={styles.newAnalysisText}>Analyze Another Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Previous Analyses */}
        {previousAnalyses.length > 0 && !isAnalyzing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📈 Previous Analyses
            </Text>
            {previousAnalyses.map((prev) => (
              <TouchableOpacity
                key={prev.id}
                style={[styles.historyCard, { backgroundColor: cardBg }]}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: prev.photoUri }}
                  style={styles.historyImage}
                  resizeMode="cover"
                />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: textColor }]}>
                    {new Date(prev.timestamp).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.historyDays, { color: subText }]}>
                    Day {prev.daysClean}
                  </Text>
                  <Text style={[styles.historyScore, { color: colors.primary }]}>
                    Score: {prev.comparisonScore}/100
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
},
title: {
fontSize: 20,
fontWeight: '700',
},
premiumBadge: {
marginLeft: 8,
borderRadius: 8,
overflow: 'hidden',
},
premiumGradient: {
paddingHorizontal: 8,
paddingVertical: 4,
},
premiumText: {
fontSize: 10,
fontWeight: '700',
color: '#FFF',
},
placeholder: {
width: 60,
},
scrollContent: {
paddingBottom: 100,
},
uploadSection: {
marginHorizontal: SIZES.padding,
borderRadius: 16,
padding: 24,
alignItems: 'center',
marginBottom: 20,
},
uploadEmoji: {
fontSize: 64,
marginBottom: 16,
},
uploadTitle: {
fontSize: 22,
fontWeight: '700',
marginBottom: 8,
textAlign: 'center',
},
uploadDescription: {
fontSize: 14,
textAlign: 'center',
lineHeight: 20,
marginBottom: 24,
},
uploadButton: {
width: '100%',
borderRadius: 12,
overflow: 'hidden',
marginBottom: 24,
},
uploadButtonGradient: {
padding: 16,
alignItems: 'center',
},
uploadButtonText: {
fontSize: 16,
fontWeight: '700',
color: '#FFF',
},
features: {
width: '100%',
},
featureItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},
featureIcon: {
fontSize: 16,
color: '#00E676',
marginRight: 12,
fontWeight: '700',
},
featureText: {
flex: 1,
fontSize: 14,
lineHeight: 20,
},
analyzingSection: {
marginHorizontal: SIZES.padding,
borderRadius: 16,
padding: 48,
alignItems: 'center',
marginBottom: 20,
},
analyzingText: {
fontSize: 18,
fontWeight: '700',
marginTop: 16,
},
analyzingSubtext: {
fontSize: 14,
marginTop: 8,
},
photoPreview: {
marginHorizontal: SIZES.padding,
borderRadius: 16,
overflow: 'hidden',
marginBottom: 20,
position: 'relative',
},
previewImage: {
width: '100%',
height: width * 1.2,
},
stageBadge: {
position: 'absolute',
top: 16,
right: 16,
borderRadius: 12,
overflow: 'hidden',
},
stageBadgeGradient: {
paddingHorizontal: 16,
paddingVertical: 8,
},
stageBadgeText: {
fontSize: 12,
fontWeight: '700',
color: '#FFF',
},
scoreCard: {
marginHorizontal: SIZES.padding,
borderRadius: 12,
padding: 20,
alignItems: 'center',
marginBottom: 20,
},
scoreLabel: {
fontSize: 14,
marginBottom: 8,
},
scoreValue: {
fontSize: 48,
fontWeight: '700',
marginBottom: 16,
},
scoreBar: {
width: '100%',
height: 12,
borderRadius: 6,
overflow: 'hidden',
},
scoreFill: {
height: '100%',
},
section: {
marginHorizontal: SIZES.padding,
marginBottom: 20,
},
sectionTitle: {
fontSize: 18,
fontWeight: '700',
marginBottom: 12,
},
metricCard: {
borderRadius: 12,
padding: 16,
marginBottom: 12,
},
metricHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 12,
},
metricName: {
fontSize: 14,
fontWeight: '600',
textTransform: 'capitalize',
},
metricValue: {
fontSize: 18,
fontWeight: '700',
},
metricBar: {
height: 8,
borderRadius: 4,
overflow: 'hidden',
},
metricFill: {
height: '100%',
},
improvementCard: {
flexDirection: 'row',
alignItems: 'flex-start',
borderRadius: 12,
padding: 16,
marginBottom: 8,
},
improvementBullet: {
fontSize: 16,
color: '#00E676',
marginRight: 12,
fontWeight: '700',
},
improvementText: {
flex: 1,
fontSize: 14,
lineHeight: 20,
},
recommendationCard: {
flexDirection: 'row',
alignItems: 'flex-start',
borderRadius: 12,
padding: 16,
marginBottom: 8,
},
recNumber: {
width: 28,
height: 28,
borderRadius: 14,
backgroundColor: '#6C5CE7',
justifyContent: 'center',
alignItems: 'center',
marginRight: 12,
},
recNumberText: {
fontSize: 12,
fontWeight: '700',
color: '#FFF',
},
recommendationText: {
flex: 1,
fontSize: 14,
lineHeight: 20,
},
newAnalysisButton: {
marginHorizontal: SIZES.padding,
borderRadius: 12,
overflow: 'hidden',
marginTop: 20,
marginBottom: 20,
},
newAnalysisGradient: {
padding: 16,
alignItems: 'center',
},
newAnalysisText: {
fontSize: 16,
fontWeight: '700',
color: '#FFF',
},
historyCard: {
flexDirection: 'row',
borderRadius: 12,
padding: 12,
marginBottom: 12,
},
historyImage: {
width: 80,
height: 80,
borderRadius: 8,
marginRight: 12,
},
historyInfo: {
flex: 1,
justifyContent: 'center',
},
historyDate: {
fontSize: 14,
fontWeight: '700',
marginBottom: 4,
},
historyDays: {
fontSize: 12,
marginBottom: 4,
},
historyScore: {
fontSize: 14,
fontWeight: '700',
},
});