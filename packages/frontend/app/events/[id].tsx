import { useState, useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEvents } from '@/services/events';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, TextInput } from 'react-native-paper';
import { ErrorHandler } from '@/components/ErrorHandler';
import { Loading } from '@/components/Loading';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { events, updateEvent, deleteEvent, error, loading } = useEvents();
  const router = useRouter();
  
  const event = events.find(e => e.id === id);
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const [initialized, setInitialized] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (event && !initialized) {
      setTitle(event.title);
      setEventTime(new Date(event.eventTime));
      setInitialized(true);
    }
  }, [event]);

  if (loading || !initialized) return <Loading />;
  if (!event) return null;

  const hasChanges = title !== event.title || eventTime.toISOString() !== new Date(event.eventTime).toISOString();

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