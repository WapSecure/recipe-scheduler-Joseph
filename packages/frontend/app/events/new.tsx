import { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { useEvents } from '@/services/events';
import { Button, TextInput } from 'react-native-paper';
import { ErrorHandler } from '@/components/ErrorHandler';
import { DateTimePickerModal } from '@/components/DateTimePickerModal';

export default function NewEventScreen() {
  const [title, setTitle] = useState<string>('');
  const [eventTime, setEventTime] = useState<Date>(new Date());
  const { createEvent, error } = useEvents();
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const router = useRouter();

  const handleCreate = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Title is required');
        return;
      }

      if (new Date(eventTime) <= new Date()) {
        Alert.alert('Invalid Date', 'Please select a future date and time');
        return;
      }

      await createEvent({
        title,
        eventTime: eventTime.toISOString(),
        userId: 'test-user',
      });
      router.replace('/events');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create event');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Event',
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <ErrorHandler error={error} />
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />

        <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.input}>
          {eventTime.toLocaleString()}
        </Button>

        <DateTimePickerModal
          visible={showPicker}
          value={eventTime}
          onChange={(date) => setEventTime(date)}
          onClose={() => setShowPicker(false)}
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
