import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface Resource {
  id: string;
  title: string;
  description: string;
  phone?: string;
  url?: string;
  icon: string;
  color: string[];
  isEmergency: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 for 24/7 crisis support',
    phone: '741741',
    icon: '💬',
    color: ['#667EEA', '#764BA2'],
    isEmergency: true,
  },
  {
    id: '2',
    title: 'National Suicide Prevention Lifeline',
    description: 'Call 988 for free, confidential support',
    phone: '988',
    icon: '📞',
    color: ['#FF5252', '#D32F2F'],
    isEmergency: true,
  },
  {
    id: '3',
    title: 'SAMHSA National Helpline',
    description: '1-800-662-4357 for substance abuse support',
    phone: '1-800-662-4357',
    icon: '🆘',
    color: ['#FF9800', '#F57C00'],
    isEmergency: true,
  },
  {
    id: '4',
    title: 'Recovery.org',
    description: 'Online resources and support groups',
    url: 'https://www.recovery.org',
    icon: '🌐',
    color: ['#00E676', '#00C853'],
    isEmergency: false,
  },
];

export const EmergencyResources = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Emergency Resources</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Immediate help when you need it most
          </Text>
        </View>

        {/* Emergency Notice */}
        <View style={[styles.emergencyNotice, { backgroundColor: '#FF525220' }]}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={[styles.emergencyText, { color: textColor }]}>
            If you're in immediate danger, call 911 or your local emergency services.
          </Text>
        </View>

        {/* Resources */}
        {RESOURCES.map((resource) => (
          <TouchableOpacity
            key={resource.id}
            style={[styles.resourceCard, { backgroundColor: cardBg }]}
            onPress={() => {
              if (resource.phone) {
                handleCall(resource.phone);
              } else if (resource.url) {
                handleOpenURL(resource.url);
              }
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={resource.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resourceIcon}
            >
              <Text style={styles.resourceIconText}>{resource.icon}</Text>
            </LinearGradient>
            
            <View style={styles.resourceInfo}>
              <View style={styles.resourceHeader}>
                <Text style={[styles.resourceTitle, { color: textColor }]}>
                  {resource.title}
                </Text>
                {resource.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.resourceDesc, { color: subText }]}>
                {resource.description}
              </Text>
              {resource.phone && (
                <Text style={[styles.resourcePhone, { color: colors.primary }]}>
                  {resource.phone}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Safety Planning */}
        <View style={[styles.safetyCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.safetyTitle, { color: textColor }]}>
            Safety Planning
          </Text>
          <Text style={[styles.safetyText, { color: subText }]}>
            • Identify triggers and warning signs{'\n'}
            • Create a list of coping strategies{'\n'}
            • Have emergency contacts ready{'\n'}
            • Remove access to harmful content{'\n'}
            • Reach out to trusted friends or family
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  emergencyNotice: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  emergencyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  resourceCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceIconText: {
    fontSize: 32,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  emergencyBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emergencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  resourceDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  resourcePhone: {
    fontSize: 18,
    fontWeight: '700',
  },
  safetyCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  safetyText: {
    fontSize: 14,
    lineHeight: 24,
  },
});

