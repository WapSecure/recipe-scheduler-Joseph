import { Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useEvents } from '@/services/events';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { FAB } from '@/components/FAB';
import { Loading } from '@/components/Loading';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorHandler } from '@/components/ErrorHandler';
import { useEffect } from 'react';

type RootStackParamList = {
  'events/new': undefined;
  'events/[id]': { id: string };
  '(tabs)': undefined;
};

export default function EventsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { events, loading, error, deleteEvent, refetch } = useEvents();
  const router = useRouter();

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation]);



  const renderRightActions = (id: string) => (
    <RectButton
      style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
      onPress={() =>
        Alert.alert('Delete Event', 'Are you sure?', [
          { text: 'Cancel' },
          { text: 'Delete', onPress: () => deleteEvent(id) },
        ])
      }
    >
      <Text style={styles.deleteText}>Delete</Text>
    </RectButton>
  );

  if (loading) return <Loading />;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Events',
          headerRight: () => <ThemeToggle />,
        }} 
      />
      <View style={styles.container}>
        <ErrorHandler error={error} />
        <FlatList
          ListEmptyComponent={<Text style={styles.emptyText}>No events scheduled yet</Text>}
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <Link href={`/events/${item.id}`} asChild>
                <Pressable style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventTime}>
                    {new Date(item.eventTime).toLocaleString()}
                  </Text>
                </Pressable>
              </Link>
            </Swipeable>
          )}
        />
        <FAB onPress={() => navigation.navigate('events/new')} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    marginBottom: 8,
    borderRadius: 8,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});