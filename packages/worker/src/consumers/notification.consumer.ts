import { Job } from 'bullmq';
import { Expo } from 'expo-server-sdk';
import { DeviceRepository } from '../../../backend/src/models/device.repository';
import { getDeviceRepository } from '../../../backend/src/config/database';

const expo = new Expo();
const deviceRepo: DeviceRepository = getDeviceRepository();

export const notificationWorker = async (job: Job) => {
  const { event } = job.data;
  
  try {
    const pushToken = await deviceRepo.getDeviceToken(event.userId);
    if (!pushToken) {
      console.warn(`No push token for user ${event.userId}`);
      return;
    }

    // For testing - log instead of sending real notifications
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log('Mock Notification:', {
        to: pushToken,
        title: `Reminder: ${event.title}`,
        body: `Starts at ${new Date(event.eventTime).toLocaleString()}`,
        data: { event }
      });
      return;
    }

    // Real Expo notification
    await expo.sendPushNotificationsAsync([{
      to: pushToken,
      sound: 'default',
      title: `Reminder: ${event.title}`,
      body: `Starts soon at ${new Date(event.eventTime).toLocaleString()}`,
      data: { event }
    }]);

    console.log(`Reminder sent for event ${event.id}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};