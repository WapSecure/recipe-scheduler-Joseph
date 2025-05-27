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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { createEvent, error } = useEvents();
  const router = useRouter();

  const isValid = title.trim().length > 0;

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
      console.error('Full error:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to create event'
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
        
        {showDatePicker && (
          <DateTimePicker
            value={eventTime}
            mode="date"
            display="default"
            onChange={(_, date) => {
              if (date) {
                setEventTime(date);
                setShowDatePicker(false);
                setShowTimePicker(true);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={eventTime}
            mode="time"
            display="default"
            onChange={(_, date) => {
              if (date) {
                setEventTime(date);
                setShowTimePicker(false);
              }
            }}
          />
        )}

        <Button 
          mode="outlined" 
          onPress={() => setShowDatePicker(true)}
          style={styles.button}
        >
          {eventTime.toLocaleDateString()} {eventTime.toLocaleTimeString()}
        </Button>

        <Button 
          mode="contained" 
          onPress={handleCreate} 
          style={styles.button}
          disabled={!isValid}
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