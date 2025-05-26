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
      console.error('Project ID not found in app config');
      throw new Error('Project configuration error');
    }

    // Check permissions
    let { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
        },
      });
      finalStatus = status;
    }

    // If still not granted, show appropriate message
    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      Alert.alert(
        'Permission Required', 
        'Please enable notifications in your device settings to receive reminders.'
      );
      return null;
    }

    // Get push token
    console.log('Getting push token...');
    const token = (await Notifications.getExpoPushTokenAsync({ 
      projectId,
      devicePushToken: await Notifications.getDevicePushTokenAsync()
    })).data;

    if (!token) {
      throw new Error('Failed to get push token');
    }

    console.log('Registering device token with backend...');
    await registerDeviceToken(userId, token);
    console.log('Push token registered successfully');
    return token;
  } catch (error) {
    console.error('Push notification registration failed:', error);
    Alert.alert(
      'Notification Setup', 
      'We encountered an issue setting up notifications. ' +
      'Please ensure you have an active internet connection and try again.'
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
