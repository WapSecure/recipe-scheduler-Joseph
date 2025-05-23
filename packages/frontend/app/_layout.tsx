import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLoadFonts } from '@/components/FontLoader';
import { ThemeProvider } from '@/components/Themed';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useLoadFonts();

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