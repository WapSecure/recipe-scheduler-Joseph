import { FlatList, StyleSheet, Text } from 'react-native';
import { View } from '@/components/Themed';
import { useNotifications } from '@/services/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { ErrorHandler } from '@/components/ErrorHandler';
import { registerForPushNotifications } from '@/services/notifications';
import { Loading } from '@/components/Loading';

export default function NotificationsScreen() {
  const { 
    notifications, 
    loading, 
    error,
    clearError 
  } = useNotifications();
  
  const { isConnected } = useNetInfo();

  useEffect(() => {
    const registerToken = async () => {
      try {
        const token = await registerForPushNotifications('test-user');
        console.log('Push Token:', token);
      } catch (err) {
        console.error('Failed to register push notifications:', err);
      }
    };

    registerToken();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorHandler error={error} onDismiss={clearError} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isConnected ? 'Your Notifications' : 'Offline Mode'}
      </Text>

      <FlatList
        data={notifications}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isConnected ? 'No notifications yet' : 'Cannot load notifications offline'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={styles.notificationTime}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
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