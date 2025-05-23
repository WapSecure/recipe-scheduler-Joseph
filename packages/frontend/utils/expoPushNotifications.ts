import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function verifyExpoCompatibility() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  
  // Test notification with type assertion
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expo Go Test',
      body: 'Push notifications are working!',
    },
    trigger: { 
      seconds: 1 
    } as Notifications.NotificationTriggerInput,
  });
}