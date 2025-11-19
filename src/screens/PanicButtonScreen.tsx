import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SIZES, DARK_COLORS } from '../utils/theme';
import { useThemeStore } from '../store/themeStore';
import { notificationService } from '../services/notifications';

export const PanicButtonScreen = () => {
  const colors = useThemeStore((state) => state.colors) || DARK_COLORS;
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isBreathing, setIsBreathing] = useState(false);
  const [counter, setCounter] = useState(4);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isBreathing) {
      const interval = setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            setBreathingPhase((phase) => {
              if (phase === 'inhale') return 'hold';
              if (phase === 'hold') return 'exhale';
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBreathing]);

  useEffect(() => {
    if (isBreathing) {
      const duration = 4000;
      if (breathingPhase === 'inhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.5, duration, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.8, duration, useNativeDriver: true }),
        ]).start();
      } else if (breathingPhase === 'exhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.3, duration, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [breathingPhase, isBreathing]);

  const startBreathing = () => {
    setIsBreathing(true);
    Vibration.vibrate(100);
    notificationService.sendImmediateSupport();
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathingPhase('inhale');
    setCounter(4);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.3);
  };

  const emergencyContacts = [
    { icon: 'phone-in-talk', name: 'Crisis Hotline', number: '988', description: '24/7 Support' },
    { icon: 'account-heart', name: 'Accountability Partner', number: 'Add Contact', description: 'Your trusted friend' },
    { icon: 'account-tie', name: 'Therapist', number: 'Add Contact', description: 'Professional help' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#0F0F0F' ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Feather name="alert-circle" size={32} color="#FFF" style={{ marginBottom: 8 }} />
        <Text style={styles.headerTitle}>Emergency Support</Text>
        <Text style={styles.headerSubtitle}>You’re not alone. Take a deep breath.</Text>
      </LinearGradient>

      {/* Breathing Exercise */}
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.circleGradient}
          >
            <Text style={styles.breathingText}>
              {isBreathing ? breathingPhase.toUpperCase() : 'TAP TO START'}
            </Text>
            {isBreathing && <Text style={styles.counterText}>{counter}</Text>}
          </LinearGradient>
        </Animated.View>

        <TouchableOpacity
          style={styles.breathingButton}
          onPress={isBreathing ? stopBreathing : startBreathing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isBreathing ? ['#FF5252', '#E53935'] : ['#00E676', '#00C853']}
            style={styles.buttonGradient}
          >
            <Feather
              name={isBreathing ? 'pause-circle' : 'play-circle'}
              size={22}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>
              {isBreathing ? 'Stop Exercise' : 'Start Breathing'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      {isBreathing && (
        <View style={[styles.instructions, { backgroundColor: colors.card }]}>
          <Text style={[styles.instructionText, { color: colors.text }]}>
            {breathingPhase === 'inhale' && '🌬️ Breathe in slowly through your nose'}
            {breathingPhase === 'hold' && '⏸️ Hold your breath'}
            {breathingPhase === 'exhale' && '😮‍💨 Breathe out slowly through your mouth'}
          </Text>
        </View>
      )}

      {/* Emergency Contacts */}
      <View style={styles.contactsSection}>
        <Text style={[styles.contactsTitle, { color: colors.text }]}>Need to Talk?</Text>

        {emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.contactCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={contact.icon as any}
              size={24}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
              <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                {contact.description}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Message */}
      <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
        <Feather name="heart" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
        <Text style={[styles.messageText, { color: colors.text }]}>
          This urge will pass. You’ve overcome this before — and you can do it again.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  breathingContainer: { alignItems: 'center', marginVertical: 30 },
  breathingCircle: { width: 200, height: 200, borderRadius: 100, marginBottom: 30 },
  circleGradient: {
    flex: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  counterText: { fontSize: 50, fontWeight: '700', color: '#FFF' },

  breathingButton: {
    width: '75%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFF' },

  instructions: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  contactsSection: { paddingHorizontal: 20, marginBottom: 24 },
  contactsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600' },
  contactDescription: { fontSize: 13 },
  messageCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  messageText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
