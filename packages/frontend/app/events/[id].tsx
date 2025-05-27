import { useState, useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEvents } from '@/services/events';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, TextInput } from 'react-native-paper';
import { ErrorHandler } from '@/components/ErrorHandler';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { events, updateEvent, deleteEvent, error } = useEvents();
  const router = useRouter();
  
  const event = events.find(e => e.id === id);
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const [initialData, setInitialData] = useState({ title: '', eventTime: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setEventTime(new Date(event.eventTime));
      setInitialData({
        title: event.title,
        eventTime: new Date(event.eventTime)
      });
    }
  }, [event]);

  if (!event) return null;

  const hasChanges = 
    title !== initialData.title || 
    eventTime.getTime() !== initialData.eventTime.getTime();

  const handleSave = async () => {
    try {
      await updateEvent(event.id, { title, eventTime: eventTime.toISOString() });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          } 
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Event Details',
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
              setShowDatePicker(false);
              date && setEventTime(date);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={eventTime}
            mode="time"
            display="default"
            onChange={(_, date) => {
              setShowTimePicker(false);
              date && setEventTime(date);
            }}
          />
        )}

        <Button 
          mode="outlined" 
          onPress={() => setShowDatePicker(true)}
          style={styles.button}
        >
          Select Date
        </Button>

        <Button 
          mode="outlined" 
          onPress={() => setShowTimePicker(true)}
          style={styles.button}
        >
          Select Time
        </Button>

        <Button 
          mode="contained" 
          onPress={handleSave} 
          style={styles.button}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
        
        <Button mode="outlined" onPress={handleDelete} style={styles.button}>
          Delete Event
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
    marginTop: 8,
  },
});