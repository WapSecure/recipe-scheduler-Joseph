import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Real notification functions
export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

type NotificationTrigger =
  | { type: 'date'; date: Date }
  | { type: 'calendar'; repeats?: boolean; [key: string]: any }
  | { type: 'timeInterval'; seconds: number; repeats?: boolean };

function enforceTriggerType(trigger: NotificationTrigger): Notifications.NotificationTriggerInput {
  return trigger as Notifications.NotificationTriggerInput;
}

export async function schedulePushNotification(title: string, body: string, triggerDate: Date) {
  const trigger = enforceTriggerType({
    type: 'date',
    date: triggerDate,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger,
  });
}

// Mock hook for UI
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      title: 'Reminder: Bake Cookies',
      body: 'Your baking session starts in 15 minutes',
      timestamp: new Date().toISOString(),
    },
  ]);

  // This would be called when real notifications are received
  const addNotification = (notification: { title: string; body: string }) => {
    setNotifications((prev) => [
      {
        title: notification.title,
        body: notification.body,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return { notifications, addNotification };
};
