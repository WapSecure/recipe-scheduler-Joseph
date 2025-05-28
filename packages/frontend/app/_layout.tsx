import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLoadFonts } from '@/components/FontLoader';
import { ThemeProvider } from '@/components/Themed';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setupNotificationChannel } from '@/utils/notifications';
import { useEffect } from 'react';


export default function RootLayout() {
  setupNotificationChannel();
  const { fontsLoaded, fontError } = useLoadFonts();
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

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerRight: () => <ThemeToggle />,
            headerTintColor: '#2f95dc',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});