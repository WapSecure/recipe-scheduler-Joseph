import * as Notifications from 'expo-notifications';
import { Alert, FlatList, StyleSheet, Text } from 'react-native';
import { View } from '@/components/Themed';
import { useNotifications } from '@/services/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { ErrorHandler } from '@/components/ErrorHandler';
import { registerForPushNotifications } from '@/services/notifications';
import { Loading } from '@/components/Loading';
import { Button } from 'react-native-paper';

export default function NotificationsScreen() {
  const { notifications, loading, error, clearError } = useNotifications();

  const { isConnected } = useNetInfo();
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>();

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    };

    checkPermissions();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        const token = await registerForPushNotifications('test-user');
        console.log('Notification token after enabling:', token);
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      Alert.alert('Permission Error', 'Failed to enable notifications. Please try again.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorHandler error={error} onDismiss={clearError} />
        {permissionStatus !== 'granted' && (
          <Button
            onPress={handleEnableNotifications}
            mode="contained"
            style={styles.permissionButton}
          >
            Enable Notifications
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isConnected ? 'Your Notifications' : 'Offline Mode'}</Text>

      {permissionStatus !== 'granted' && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Notifications are disabled. Enable them to receive reminders.
          </Text>
          <Button
            onPress={handleEnableNotifications}
            mode="contained"
            style={styles.permissionButton}
          >
            Enable
          </Button>
        </View>
      )}

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
            {item.data?.url && <Text style={styles.notificationLink}>Event: {item.data.url}</Text>}
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
  permissionBanner: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionText: {
    color: '#856404',
    marginBottom: 12,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },

  notificationLink: {
    fontSize: 12,
    color: '#2f95dc',
    marginTop: 4,
  }
});
