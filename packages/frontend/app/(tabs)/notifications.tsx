import { FlatList, StyleSheet, Text } from 'react-native';
import { View } from '@/components/Themed';
import { useNotifications } from '@/services/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Mock data for offline mode
const mockNotifications = [
  {
    title: 'Mock: Bake Cookies',
    body: 'Your session starts soon (offline)',
    timestamp: new Date().toISOString(),
  },
];

export default function NotificationsScreen() {
  const { notifications, addNotification } = useNotifications();
  const { isConnected } = useNetInfo();

  // this Listen for real notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      addNotification({
        title: notification.request.content.title || 'New Reminder',
        body: notification.request.content.body || '',
      });
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const getToken = async () => {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token:', token);
    };
    getToken();
  }, []);

  const displayData = isConnected ? notifications : [...notifications, ...mockNotifications];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isConnected ? 'Your Notifications' : 'Offline Mode (mock data)'}
      </Text>

      <FlatList
        data={displayData}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={styles.notificationTime}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  notificationTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
});
