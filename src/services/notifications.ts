import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ✅ Configure how notifications behave when received
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.log('⚠️ Notification handler not supported in Expo Go:', error);
}

class NotificationService {
  private motivationalQuotes = [
    "You're stronger than your urges! 💪",
    'Every day clean is a victory! 🏆',
    'Your future self will thank you! 🌟',
    "Stay strong, you've got this! 🔥",
    'Progress, not perfection! ⭐',
  ];

  /** ✅ Request permission and configure Android channel */
  private async ensurePermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('📱 Notifications only work on physical devices.');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('🚫 Notification permission not granted.');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      return true;
    } catch (error) {
      console.log('⚠️ Notification permission error:', error);
      return false;
    }
  }

  /** ✅ Schedule daily motivational notification (9 AM) */
  async scheduleMotivationalNotification() {
    const hasPermission = await this.ensurePermission();
    if (!hasPermission) return;

    const randomQuote =
      this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Daily Motivation',
        body: randomQuote,
        sound: true,
      },
      trigger: { hour: 9, minute: 0, repeats: true },
    });

    console.log('✅ Motivational notification scheduled for 9 AM.');
  }

  /** ✅ Schedule nightly urge check-in (9 PM) */
  async scheduleUrgeCheckIn() {
    const hasPermission = await this.ensurePermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💭 How are you feeling?',
        body: 'Log your progress and track your journey.',
        sound: true,
      },
      trigger: { hour: 21, minute: 0, repeats: true },
    });

    console.log('✅ Urge check-in scheduled for 9 PM.');
  }

  /** ✅ Send immediate motivational/support message */
  async sendImmediateSupport() {
    const hasPermission = await this.ensurePermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛡️ Stay Strong!',
        body: 'Take a deep breath — you can overcome this moment.',
        sound: true,
      },
      trigger: null, // immediate
    });

    console.log('✅ Immediate support notification sent.');
  }

  /** ✅ Cancel all scheduled notifications */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🧹 All notifications canceled.');
    } catch (error) {
      console.log('⚠️ Failed to cancel notifications:', error);
    }
  }

  /** 🧩 Optional: debug helper to list scheduled notifications */
  async listAllNotifications() {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📅 Scheduled notifications:', all);
  }
}

export const notificationService = new NotificationService();
