import { NativeModules, Platform } from 'react-native';

interface AppUsage {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // milliseconds
  lastUsed: number;
}

class ScreenTimeService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('Screen time monitoring only available on Android');
      return false;
    }

    try {
      // Request usage stats permission
      // This would need native Android implementation
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async getAppUsage(startTime: number, endTime: number): Promise<AppUsage[]> {
    if (Platform.OS !== 'android') {
      // Return mock data for iOS/testing
      return this.getMockData();
    }

    try {
      // This would call native Android module
      // const usageStats = await NativeModules.UsageStatsModule.getUsageStats(startTime, endTime);
      // return usageStats;
      
      return this.getMockData();
    } catch (error) {
      console.error('Error getting app usage:', error);
      return [];
    }
  }

  private getMockData(): AppUsage[] {
    return [
      {
        packageName: 'com.chrome.browser',
        appName: 'Chrome',
        totalTimeInForeground: 3600000, // 1 hour
        lastUsed: Date.now(),
      },
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        totalTimeInForeground: 2700000, // 45 min
        lastUsed: Date.now() - 1000000,
      },
      {
        packageName: 'com.twitter.android',
        appName: 'Twitter',
        totalTimeInForeground: 1800000, // 30 min
        lastUsed: Date.now() - 2000000,
      },
    ];
  }

  async getTodayUsage(): Promise<AppUsage[]> {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    
    return this.getAppUsage(startOfDay, now);
  }

  async getWeeklyUsage(): Promise<Record<string, AppUsage[]>> {
    const weekly: Record<string, AppUsage[]> = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString();
      
      const startOfDay = new Date(date).setHours(0, 0, 0, 0);
      const endOfDay = new Date(date).setHours(23, 59, 59, 999);
      
      weekly[dayKey] = await this.getAppUsage(startOfDay, endOfDay);
    }
    
    return weekly;
  }

  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  isTriggerApp(packageName: string): boolean {
    const triggerApps = [
      'browser',
      'chrome',
      'firefox',
      'safari',
      'reddit',
      'twitter',
      'instagram',
      'tiktok',
      'youtube',
    ];
    
    return triggerApps.some(trigger => 
      packageName.toLowerCase().includes(trigger)
    );
  }
}

export default new ScreenTimeService();