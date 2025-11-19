import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface ScheduledNotification {
  id: string;
  type: string;
  scheduledTime: Date;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async init() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Get push token (for remote notifications if needed)
      if (Device.isDevice) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        this.expoPushToken = token;
        console.log('Push token:', token);
      }

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C5CE7',
        });

        // Streak notifications channel
        await Notifications.setNotificationChannelAsync('streaks', {
          name: 'Streak Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00E676',
        });

        // Motivational channel
        await Notifications.setNotificationChannelAsync('motivation', {
          name: 'Motivational Messages',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#FFD700',
        });
      }

      // Set up listeners
      this.setupListeners();

      console.log('✅ Notification Service initialized');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  setupListeners() {
    // Listener for when notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
      }
    );

    // Listener for when user interacts with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        // Handle navigation based on notification data
        this.handleNotificationTap(response.notification.request.content.data);
      }
    );
  }

  handleNotificationTap(data: any) {
    // TODO: Implement navigation based on notification type
    console.log('Handle notification tap:', data);
  }

  // 🎯 DAILY CHECK-IN REMINDER
  async scheduleDailyCheckIn(hour: number = 20, minute: number = 0) {
    await this.cancelNotificationsByType('daily-checkin');

    const trigger: Notifications.NotificationTriggerInput = {
      hour,
      minute,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Daily Check-in',
        body: 'How are you feeling today? Log your progress!',
        data: { type: 'daily-checkin', screen: 'logUrge' },
        sound: true,
      },
      trigger,
    });

    await this.saveScheduledNotification(id, 'daily-checkin');
    console.log('✅ Daily check-in scheduled');
  }

  // 🔥 STREAK BREAKING WARNING
  async scheduleStreakWarning(habitName: string, lastCheckInDate: Date) {
    await this.cancelNotificationsByType('streak-warning');

    // Warn if no check-in after 18 hours
    const warningTime = new Date(lastCheckInDate.getTime() + 18 * 60 * 60 * 1000);

    if (warningTime > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Streak at Risk!',
          body: `Your ${habitName} streak is about to break! Check in now.`,
          data: { type: 'streak-warning', screen: 'dashboard' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { date: warningTime },
      });

      await this.saveScheduledNotification(id, 'streak-warning');
      console.log('✅ Streak warning scheduled');
    }
  }

  // 📸 SELFIE UPLOAD REMINDER
  async scheduleWeeklySelfieReminder() {
    await this.cancelNotificationsByType('selfie-reminder');

    // Every Sunday at 10 AM
    const trigger: Notifications.NotificationTriggerInput = {
      weekday: 1, // Sunday
      hour: 10,
      minute: 0,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📸 Progress Photo Time!',
        body: 'Take your weekly progress photo and track your transformation!',
        data: { type: 'selfie-reminder', screen: 'selfies' },
        sound: true,
      },
      trigger,
    });

    await this.saveScheduledNotification(id, 'selfie-reminder');
    console.log('✅ Weekly selfie reminder scheduled');
  }

  // 💪 MOTIVATIONAL MESSAGES
  async scheduleMotivationalNotifications() {
    await this.cancelNotificationsByType('motivational');

    const messages = [
      {
        hour: 8,
        minute: 0,
        title: '🌅 Good Morning!',
        body: 'Today is a new opportunity to stay strong!',
      },
      {
        hour: 12,
        minute: 0,
        title: '💪 Midday Check',
        body: 'You\'re doing great! Keep pushing forward.',
      },
      {
        hour: 18,
        minute: 0,
        title: '🌟 Evening Motivation',
        body: 'Another day closer to your goals. Proud of you!',
      },
      {
        hour: 22,
        minute: 0,
        title: '🌙 Bedtime Reminder',
        body: 'Reflect on today\'s wins. Tomorrow is a fresh start!',
      },
    ];

    for (const msg of messages) {
      const trigger: Notifications.NotificationTriggerInput = {
        hour: msg.hour,
        minute: msg.minute,
        repeats: true,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          data: { type: 'motivational', screen: 'dashboard' },
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger,
      });

      await this.saveScheduledNotification(id, 'motivational');
    }

    console.log('✅ Motivational notifications scheduled');
  }

  // 🏆 ACHIEVEMENT UNLOCKED
  async sendAchievementNotification(title: string, description: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 ${title}`,
        body: description,
        data: { type: 'achievement', screen: 'achievements' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  // 🎮 GAME INVITATION
  async sendGameInvitation() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎮 Feeling Urges?',
        body: 'Try a game to distract and refocus your mind!',
        data: { type: 'game-invitation', screen: 'games' },
        sound: true,
      },
      trigger: null,
    });
  }

  // 📊 WEEKLY REPORT
  async scheduleWeeklyReport() {
    await this.cancelNotificationsByType('weekly-report');

    // Every Monday at 9 AM
    const trigger: Notifications.NotificationTriggerInput = {
      weekday: 2, // Monday
      hour: 9,
      minute: 0,
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Your Weekly Report',
        body: 'Check out your progress from last week!',
        data: { type: 'weekly-report', screen: 'stats' },
        sound: true,
      },
      trigger,
    });

    await this.saveScheduledNotification(id, 'weekly-report');
    console.log('✅ Weekly report scheduled');
  }

  // 🚨 URGE DETECTED (Based on patterns)
  async sendUrgeWarning(triggerType: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Urge Warning',
        body: `You often feel urges around this time. Stay strong!`,
        data: { type: 'urge-warning', screen: 'panic', trigger: triggerType },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });
  }

  // 🎯 MILESTONE CELEBRATION
  async sendMilestoneNotification(days: number, habitName: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Milestone Achieved!',
        body: `${days} days clean from ${habitName}! You're amazing!`,
        data: { type: 'milestone', screen: 'achievements', days },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  // 💡 TIP OF THE DAY
  async scheduleDailyTips() {
    await this.cancelNotificationsByType('daily-tip');

    const tips = [
      'Take 5 deep breaths when you feel an urge coming.',
      'Exercise releases natural dopamine. Try a quick workout!',
      'Stay hydrated. Dehydration can trigger cravings.',
      'Connect with someone you trust when struggling.',
      'Remember why you started this journey.',
    ];

    // Random tip each day at 7 AM
    const trigger: Notifications.NotificationTriggerInput = {
      hour: 7,
      minute: 0,
      repeats: true,
    };

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 Daily Tip',
        body: randomTip,
        data: { type: 'daily-tip', screen: 'dashboard' },
        sound: false,
      },
      trigger,
    });

    await this.saveScheduledNotification(id, 'daily-tip');
    console.log('✅ Daily tips scheduled');
  }

  // 🛠️ UTILITY METHODS

  async cancelNotificationsByType(type: string) {
    const stored = await AsyncStorage.getItem('scheduled_notifications');
    if (!stored) return;

    const notifications: ScheduledNotification[] = JSON.parse(stored);
    const toCancel = notifications.filter(n => n.type === type);

    for (const notif of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notif.id);
    }

    const remaining = notifications.filter(n => n.type !== type);
    await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(remaining));
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem('scheduled_notifications');
    console.log('✅ All notifications cancelled');
  }

  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  private async saveScheduledNotification(id: string, type: string) {
    const stored = await AsyncStorage.getItem('scheduled_notifications');
    const notifications: ScheduledNotification[] = stored ? JSON.parse(stored) : [];

    notifications.push({
      id,
      type,
      scheduledTime: new Date(),
    });

    await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
  }

  async enableNotifications(types: string[]) {
    for (const type of types) {
      switch (type) {
        case 'daily-checkin':
          await this.scheduleDailyCheckIn();
          break;
        case 'motivational':
          await this.scheduleMotivationalNotifications();
          break;
        case 'selfie-reminder':
          await this.scheduleWeeklySelfieReminder();
          break;
        case 'weekly-report':
          await this.scheduleWeeklyReport();
          break;
        case 'daily-tip':
          await this.scheduleDailyTips();
          break;
      }
    }
  }

  async disableNotifications(types: string[]) {
    for (const type of types) {
      await this.cancelNotificationsByType(type);
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();