import StorageService from './StorageService';

export type AnalyticsEventName =
  | 'habit_created'
  | 'urge_logged'
  | 'achievement_unlocked'
  | 'screen_view'
  | 'panic_button_pressed'
  | 'session_start'
  | 'session_end';

interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  timestamp: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly STORAGE_KEY = 'analytics_events';
  private initialized = false;

  // Initialize on startup
  async init(): Promise<void> {
    if (this.initialized) return;
    const stored = await StorageService.load<AnalyticsEvent[]>(this.STORAGE_KEY);
    this.events = stored || [];
    this.initialized = true;
  }

  private createEvent(name: AnalyticsEventName, properties?: Record<string, any>): AnalyticsEvent {
    return {
      id: `${name}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      timestamp: new Date().toISOString(),
      properties,
    };
  }

  private async save(): Promise<void> {
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
    await StorageService.save(this.STORAGE_KEY, this.events);
  }

  // General event tracker
  async trackEvent(name: AnalyticsEventName, properties?: Record<string, any>): Promise<void> {
    const event = this.createEvent(name, properties);
    this.events.push(event);
    console.log('📊 Analytics Event:', event);
    await this.save();
  }

  // Specialized trackers
  async trackHabitCreated(habitType: string): Promise<void> {
    await this.trackEvent('habit_created', { habitType });
  }

  async trackUrgeLogged(habitId: string, intensity: number, overcome: boolean): Promise<void> {
    await this.trackEvent('urge_logged', { habitId, intensity, overcome });
  }

  async trackAchievementUnlocked(achievementId: string): Promise<void> {
    await this.trackEvent('achievement_unlocked', { achievementId });
  }

  async trackScreenView(screenName: string): Promise<void> {
    await this.trackEvent('screen_view', { screenName });
  }

  async trackPanicButtonPressed(): Promise<void> {
    await this.trackEvent('panic_button_pressed');
  }

  async trackSessionStart(userId?: string): Promise<void> {
    await this.trackEvent('session_start', { userId });
  }

  async trackSessionEnd(userId?: string): Promise<void> {
    await this.trackEvent('session_end', { userId });
  }

  // Data access
  async getEvents(): Promise<AnalyticsEvent[]> {
    if (!this.initialized) await this.init();
    return this.events;
  }

  async clearEvents(): Promise<void> {
    this.events = [];
    await StorageService.remove(this.STORAGE_KEY);
    console.log('🧹 Analytics cleared.');
  }

  // Insights generator
  async getInsights() {
    if (!this.initialized) await this.init();
    const totalEvents = this.events.length;
    const urgesLogged = this.events.filter(e => e.name === 'urge_logged').length;
    const urgesOvercome = this.events.filter(
      e => e.name === 'urge_logged' && e.properties?.overcome
    ).length;
    const successRate = urgesLogged > 0 ? Math.round((urgesOvercome / urgesLogged) * 100) : 0;

    return {
      totalEvents,
      urgesLogged,
      urgesOvercome,
      successRate,
      mostActiveDay: this.getMostActiveDay(),
      peakTime: this.getPeakTime(),
    };
  }

  private getMostActiveDay(): string {
    const dayCounts: Record<string, number> = {};
    this.events.forEach(event => {
      const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    return Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }

  private getPeakTime(): string {
    const hourCounts: Record<number, number> = {};
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return peakHour ? `${peakHour}:00` : 'N/A';
  }
}

export default new AnalyticsService();
