import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/Themed';
import { setupNotificationChannel } from '@/utils/notifications';
import { useEffect } from 'react';


export default function TabLayout() {
  setupNotificationChannel();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url;
      if (url && typeof url === 'string') {
        router.push(url as any);
      }
    });
  
    return () => subscription.remove();
  }, []);

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#2f95dc',
      tabBarInactiveTintColor: theme === 'light' ? '#999' : '#888',
      tabBarStyle: {
        backgroundColor: theme === 'light' ? '#FFF' : '#121212',
        borderTopColor: theme === 'light' ? '#E0E0E0' : '#333',
      },
      headerStyle: {
        backgroundColor: theme === 'light' ? '#FFF' : '#121212',
      },
      headerTitleStyle: {
        color: theme === 'light' ? '#000' : '#FFF',
      },
      headerTintColor: '#2f95dc',
    }}>
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <MaterialIcons name="notifications" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}