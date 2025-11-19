import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTimeService from '../../services/ScreenTimeService';
import { SIZES } from '../../utils/theme';

export const ScreenTimeScreen = () => {
  const [usage, setUsage] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const hasPermission = await ScreenTimeService.requestPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant usage access to track screen time'
      );
      return;
    }

    const data = await ScreenTimeService.getTodayUsage();
    setUsage(data);
    
    const total = data.reduce((sum, app) => sum + app.totalTimeInForeground, 0);
    setTotalTime(total);
  };

  const getTriggerApps = () => {
    return usage.filter(app => ScreenTimeService.isTriggerApp(app.packageName));
  };

  const triggerApps = getTriggerApps();
  const triggerTime = triggerApps.reduce((sum, app) => sum + app.totalTimeInForeground, 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📱 Screen Time</Text>
        <Text style={styles.headerSubtitle}>Monitor your app usage</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Time */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Screen Time Today</Text>
          <Text style={styles.totalValue}>
            {ScreenTimeService.formatTime(totalTime)}
          </Text>
        </View>

        {/* Trigger Apps Alert */}
        {triggerApps.length > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Trigger Apps Detected</Text>
              <Text style={styles.alertText}>
                You've spent {ScreenTimeService.formatTime(triggerTime)} on potentially
                triggering apps today
              </Text>
            </View>
          </View>
        )}

        {/* App List */}
        <View style={styles.appsSection}>
          <Text style={styles.sectionTitle}>App Usage Breakdown</Text>
          
          {usage.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No data available</Text>
              <Text style={styles.emptySubtext}>
                Grant permission to track screen time
              </Text>
            </View>
          ) : (
            usage
              .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
              .map((app, index) => {
                const isTrigger = ScreenTimeService.isTriggerApp(app.packageName);
                const percentage = (app.totalTimeInForeground / totalTime) * 100;
                
                return (
                  <View key={index} style={styles.appCard}>
                    <View style={styles.appHeader}>
                      <Text style={styles.appIcon}>📱</Text>
                      <View style={styles.appInfo}>
                        <View style={styles.appNameRow}>
                          <Text style={styles.appName}>{app.appName}</Text>
                          {isTrigger && (
                            <View style={styles.triggerBadge}>
                              <Text style={styles.triggerText}>⚠️ Trigger</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.appTime}>
                          {ScreenTimeService.formatTime(app.totalTimeInForeground)}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${percentage}%`,
                            backgroundColor: isTrigger ? '#FF5252' : '#6C5CE7',
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
                  </View>
                );
              })
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips to Reduce Screen Time</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Set app time limits</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Use grayscale mode to reduce appeal</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Remove trigger apps from home screen</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Use the panic button when tempted</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    padding: 20,
  },
  totalCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  alertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  appsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  appCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  triggerBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  triggerText: {
    fontSize: 10,
    color: '#FF5252',
    fontWeight: '600',
  },
  appTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  percentage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    color: '#6C5CE7',
    marginRight: 12,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
});