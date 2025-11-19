import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);
    };

    setupNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('🔔 User tapped notification:', response.notification.request.content);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const scheduleDailyReminder = async (hour: number = 9, minute: number = 0) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Stay Strong 💪',
          body: "Check your progress and log your habit for the day.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { hour, minute, repeats: true },
      });

      console.log(`📅 Daily reminder set for ${hour}:${minute}`);
    } catch (err) {
      console.error('Error scheduling notification:', err);
    }
  };

  return { expoPushToken, notification, scheduleDailyReminder };
};

async function registerForPushNotificationsAsync() {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('❌ Failed to get push token: Permission not granted');
    return;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // optional but recommended
    });
    token = tokenResponse.data;
    console.log('✅ Expo Push Token:', token);
  } catch (err) {
    console.error('Error getting Expo push token:', err);
  }

  return token;
}
