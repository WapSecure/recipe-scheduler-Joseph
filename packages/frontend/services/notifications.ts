import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerDeviceToken } from './api';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface AppNotification {
  title: string;
  body: string;
  timestamp: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

export async function registerForPushNotifications(userId: string) {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications not supported on simulators');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const projectId = Constants.expoConfig?.extra?.projectId;
    if (!projectId) {
      console.warn('Project ID not found in app config - using fallback');
      throw new Error('Notification configuration incomplete');
    }

    let { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

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
      return tokenData.data;
    }
  } catch (error) {
    console.error('Push notification setup error:', error);
    return null;
  }
}

export async function schedulePushNotification(
  title: string,
  body: string,
  triggerDate: Date,
  eventId?: string
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: {
          url: eventId ? `/events/${eventId}` : '/events',
        },
      },
      trigger: {
        type: 'date',
        date: triggerDate,
      } as Notifications.NotificationTriggerInput,
    });
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    throw error;
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const addNotification = useCallback(
    (notification: { title?: string | null; body?: string | null; data?: any }) => {
      setNotifications((prev) => [
        {
          title: notification.title || 'Reminder',
          body: notification.body || '',
          timestamp: new Date().toISOString(),
          data: notification.data,
        },
        ...prev,
      ]);
    },
    []
  );

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Load initial notifications
        const presented = await Notifications.getPresentedNotificationsAsync();
        const initialNotifications = presented.map((n) => ({
          title: n.request.content.title || 'Reminder',
          body: n.request.content.body || '',
          timestamp: new Date().toISOString(),
          data: n.request.content.data,
        }));
        setNotifications(initialNotifications);

        // Setup listener for new notifications
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
          addNotification({
            title: notification.request.content.title,
            body: notification.request.content.body,
            data: notification.request.content.data,
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

    setupNotifications();
  }, [addNotification]);

  const clearError = () => setError(null);

  return {
    notifications,
    loading,
    error,
    clearError,
  };
};
