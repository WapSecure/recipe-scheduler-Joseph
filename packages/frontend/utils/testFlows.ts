import { Alert } from 'react-native';
import { schedulePushNotification } from '@/services/notifications';
export async function testNotificationFlow() {
    const testEvent = {
      title: 'Test Event',
      eventTime: new Date(Date.now() + 60000), // 1 minute from now
    };
  
    try {
      // Test event creation
      Alert.alert('Testing', 'Creating test event...');
      
      // Test notification scheduling
      await schedulePushNotification(
        `Reminder: ${testEvent.title}`,
        `Test notification`,
        new Date(Date.now() + 30000) // 30 seconds from now
      );
      
      Alert.alert('Success', 'Test flow completed! Check notifications.');
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', 'Test flow failed: ' + errorMessage);
    }
  }