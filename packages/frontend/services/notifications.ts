import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerDeviceToken } from './api';
import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';

interface AppNotification {
  title: string;
  body: string;
  timestamp: string;
}

export async function registerForPushNotifications(userId: string) {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications not supported on simulators');
      return null;
    }

    // Get projectId from Expo config
    const projectId = Constants.expoConfig?.extra?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found in app config');
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Push notifications need to be enabled in settings');
      return null;
    }

    // Get and register token
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    await registerDeviceToken(userId, token);
    console.log('Registered push token:', token);
    return token;
  } catch (error) {
    console.error('Failed to register push notifications:', error);
    Alert.alert(
      'Notification error',
      'Could not set up push notifications. Please try again later.'
    );
    return null;
  }
}

export async function schedulePushNotification(title: string, body: string, triggerDate: Date) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        type: 'date',
        date: triggerDate,
      } as Notifications.NotificationTriggerInput,
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const addNotification = (notification: { title: string; body: string }) => {
    try {
      setNotifications((prev) => [
        {
          title: notification.title,
          body: notification.body,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add notification'));
    }
  };

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
          addNotification({
            title: notification.request.content.title || 'Reminder',
            body: notification.request.content.body || '',
          });
        });

        // Configure notification handler
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        return () => subscription.remove();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Notification setup failed'));
      } finally {
        setLoading(false);
      }
    };

    const cleanup = setupNotifications();
    return () => {
      cleanup.then((fn) => fn?.()).catch(console.error);
    };
  }, []);

  const clearError = () => setError(null);

  return {
    notifications,
    addNotification,
    loading,
    error,
    clearError,
  };
};
