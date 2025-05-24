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
      await createEvent({ title, eventTime: eventTime.toISOString() });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
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
          onChange={(_, date) => date && setEventTime(date)}
        />

        <Button mode="contained" onPress={handleCreate} style={styles.button}>
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