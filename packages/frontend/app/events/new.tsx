import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { useEvents } from '@/services/events';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, TextInput } from 'react-native-paper';
import { ErrorHandler } from '@/components/ErrorHandler';

export default function NewEventScreen() {
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const { createEvent, error } = useEvents();
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const payload = {
        title,
        eventTime: eventTime.toISOString(),
        userId: 'test-user'
      };
      await createEvent(payload);
      router.replace({
        pathname: '/events',
        params: { refresh: Date.now() }
      });
    } catch (error) {
      let errorMessage = 'Failed to create event';
      
      if (error instanceof Error) {
        errorMessage = error.message.includes('must be in the future')
          ? 'Please select a future date and time for your event'
          : error.message;
      }
  
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'New Event',
        headerBackTitle: 'Back',
      }} />
      <View style={styles.container}>
        <ErrorHandler error={error} />
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        
        <DateTimePicker
          value={eventTime}
          mode="datetime"
          display="default"
          onChange={(_, date) => {
            if (date) {
              setEventTime(date);
            }
          }}
        />

        <Button 
          mode="contained" 
          onPress={handleCreate} 
          style={styles.button}
          disabled={!title.trim()}
        >
          Create Event
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});