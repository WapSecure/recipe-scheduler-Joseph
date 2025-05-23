import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';

// This screen just redirects to the events list
export default function TabIndex() {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Optional: If we want to set some header options
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide header if needed
    });
  }, [navigation]);

  return <Redirect href="/events" />;
}

