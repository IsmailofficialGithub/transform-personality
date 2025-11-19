import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface ZenGardenGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface DrawPath {
  id: number;
  path: string;
  color: string;
}

export const ZenGardenGame = ({ onComplete, onBack }: ZenGardenGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedColor, setSelectedColor] = useState('#667EEA');
  const [strokesCount, setStrokesCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const pathIdRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M ${locationX} ${locationY}`);
        setIsDrawing(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          setPaths(prev => [
            ...prev,
            { id: pathIdRef.current++, path: currentPath, color: selectedColor }
          ]);
          setCurrentPath('');
          setStrokesCount(prev => prev + 1);
        }
        setIsDrawing(false);
      },
    })
  ).current;

  const colorPalette = [
    { color: '#667EEA', name: 'Purple' },
    { color: '#00E676', name: 'Green' },
    { color: '#2196F3', name: 'Blue' },
    { color: '#FF9800', name: 'Orange' },
    { color: '#E91E63', name: 'Pink' },
    { color: '#FFFFFF', name: 'White' },
  ];

  const clearCanvas = () => {
    Alert.alert(
      'Clear Garden?',
      'This will erase your current creation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            setStrokesCount(0);
          },
        },
      ]
    );
  };

  const saveAndComplete = () => {
    const score = strokesCount * 10 + Math.floor(timeSpent / 10) * 5;
    
    Alert.alert(
      '🌸 Zen Session Complete',
      `Time Spent: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s\nStrokes: ${strokesCount}\n\nScore: ${score}`,
      [
        {
          text: 'Continue',
          onPress: () => {
            setPaths([]);
            setStrokesCount(0);
            startTimeRef.current = Date.now();
          },
        },
        {
          text: 'Finish',
          onPress: () => onComplete(score),
        },
      ]
    );
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';
  const canvasBg = isDark ? '#1A1A1A' : '#F5F5F5';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: textColor }]}>Zen Garden</Text>
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
        <TouchableOpacity onPress={saveAndComplete} style={styles.doneButton}>
          <Text style={[styles.doneText, { color: '#00E676' }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Time</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {strokesCount}
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Strokes</Text>
        </View>
      </View>

      {/* Canvas */}
      <View style={[styles.canvas, { backgroundColor: canvasBg }]} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {/* Grid pattern */}
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <Path
                d={`M 0 ${(i + 1) * 50} L ${width} ${(i + 1) * 50}`}
                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
              />
              <Path
                d={`M ${(i + 1) * 50} 0 L ${(i + 1) * 50} ${height}`}
                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
              />
            </React.Fragment>
          ))}

          {/* Drawn paths */}
          {paths.map((p) => (
            <Path
              key={p.id}
              d={p.path}
              stroke={p.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Current path */}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={selectedColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>

        {paths.length === 0 && !isDrawing && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: subText }]}>
              🌸 Draw to create your zen garden
            </Text>
          </View>
        )}
      </View>

      {/* Color Palette */}
      <View style={[styles.paletteContainer, { backgroundColor: cardBg }]}>
        <Text style={[styles.paletteLabel, { color: textColor }]}>
          Colors
        </Text>
        <View style={styles.palette}>
          {colorPalette.map((item) => (
            <TouchableOpacity
              key={item.color}
              style={[
                styles.colorButton,
                { backgroundColor: item.color },
                selectedColor === item.color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(item.color)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearCanvas}
          activeOpacity={0.7}
        >
          <Text style={[styles.clearText, { color: '#FF5252' }]}>
            🗑️ Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.infoText, { color: subText }]}>
          💡 Draw slow, flowing patterns to achieve mindfulness and relaxation
        </Text>
      </View>
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
    marginBottom: 16,
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
  doneButton: {
    padding: 8,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  canvas: {
    flex: 1,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  emptyState: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  paletteContainer: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paletteLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  palette: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#6C5CE7',
    borderWidth: 3,
  },
  clearButton: {
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: SIZES.padding,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});