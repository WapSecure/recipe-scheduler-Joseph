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

    // Ensure notification channel is set up (Android)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Get projectId - handle cases where it might be missing
    const projectId = Constants.expoConfig?.extra?.projectId;
    if (!projectId) {
      console.warn('Project ID not found in app config - using fallback');
      // You can use a fallback project ID here if needed
      throw new Error('Notification configuration incomplete');
    }

    // Check current permissions
    let { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Handle denied permissions
    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get push token
    console.log('Getting push token...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.projectId,
    });

    if (!tokenData.data) {
      throw new Error('Failed to get push token');
    }

    console.log('Registering device token with backend...');
    try {
      await registerDeviceToken(userId, tokenData.data);
      console.log('Push token registered successfully');
      return tokenData.data;
    } catch (registrationError) {
      console.error('Failed to register token with backend:', registrationError);
      // Still return the token even if backend registration fails
      return tokenData.data;
    }
  } catch (error) {
    console.error('Push notification setup error:', error);
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
