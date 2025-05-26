import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/components/Themed';
import { setupNotificationChannel } from '@/utils/notifications';


export default function TabLayout() {
  setupNotificationChannel();
  const { theme } = useTheme();

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