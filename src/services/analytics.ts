import AsyncStorage from '@react-native-async-storage/async-storage';

export type AnalyticsEventName =
  | 'habit_added'
  | 'urge_logged'
  | 'achievement_unlocked'
  | 'screen_view'
  | 'session_start'
  | 'session_end';

export interface AnalyticsEvent {
  id: string;
  event: AnalyticsEventName;
  properties?: Record<string, any>;
  timestamp: string;
}

const STORAGE_KEY = 'analytics_events';
const MAX_EVENTS = 100; // keep last 100 events

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  private async loadEvents() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      this.events = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load analytics:', error);
      this.events = [];
    }
  }

  private async saveEvents() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.events.slice(-MAX_EVENTS)));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  private createEvent(event: AnalyticsEventName, properties?: Record<string, any>): AnalyticsEvent {
    return {
      id: `${event}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      event,
      properties,
      timestamp: new Date().toISOString(),
    };
  }

  async logEvent(event: AnalyticsEventName, properties?: Record<string, any>) {
    const analyticsEvent = this.createEvent(event, properties);
    this.events.push(analyticsEvent);
    console.log('📊 Analytics Event:', analyticsEvent);
    await this.saveEvents();
  }

  // ------------- Specific Event Methods -------------
  trackHabitAdded(habitType: string) {
    this.logEvent('habit_added', { habitType });
  }

  trackUrgeLogged(habitId: string, intensity: number, overcome: boolean) {
    this.logEvent('urge_logged', { habitId, intensity, overcome });
  }

  trackAchievementUnlocked(achievementId: string) {
    this.logEvent('achievement_unlocked', { achievementId });
  }

  trackScreenView(screenName: string) {
    this.logEvent('screen_view', { screenName });
  }

  startSession(userId?: string) {
    this.logEvent('session_start', { userId });
  }

  endSession(userId?: string) {
    this.logEvent('session_end', { userId });
  }

  // ------------- Utility Methods -------------
  async getEvents(): Promise<AnalyticsEvent[]> {
    await this.loadEvents();
    return this.events;
  }

  async clearEvents() {
    this.events = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('🧹 Analytics cleared.');
  }

  async exportEvents() {
    const events = await this.getEvents();
    return JSON.stringify(events, null, 2);
  }
}

export const analytics = new AnalyticsService();
