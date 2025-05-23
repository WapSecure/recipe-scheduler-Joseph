import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { useEvents } from '@/services/events';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, TextInput } from 'react-native-paper';

export default function NewEventScreen() {
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const { createEvent } = useEvents();
  const router = useRouter();

  const handleCreate = () => {
    createEvent({ title, eventTime: eventTime.toISOString() });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'New Event',
        headerBackTitle: 'Back',
      }} />
      <View style={styles.container}>
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