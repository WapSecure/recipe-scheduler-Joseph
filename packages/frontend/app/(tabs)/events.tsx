import { Stack } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
import { useEffect, useState } from 'react';
import { Button } from 'react-native-paper';

type RootStackParamList = {
  'events/new': undefined;
  'events/[id]': { id: string };
  '(tabs)': undefined;
};

export default function EventsScreen() {
  console.log('Rendering EventsScreen');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
  });

  const { events, loading, error, deleteEvent, loadEvents, hasMore } = useEvents();

  console.log('Current state:', { loading, error, hasMore, events });

  useEffect(() => {
    console.log('Initial load');
    loadEvents(pagination.limit, 0).catch((e) => {
      console.error('Initial load failed:', e);
    });
  }, []);

  const loadMoreEvents = () => {
    console.log('Attempting to load more');
    if (!hasMore || loading) return;

    const newOffset = pagination.offset + pagination.limit;
    console.log('Loading more with offset:', newOffset);
    setPagination((prev) => ({ ...prev, offset: newOffset }));
    loadEvents(pagination.limit, newOffset).catch((e) => {
      console.error('Load more failed:', e);
    });
  };

  if (loading && pagination.offset === 0) {
    console.log('Showing loading state');
    return <Loading />;
  }

  if (error) {
    console.log('Showing error state');
    return (
      <View style={styles.container}>
        <ErrorHandler error={error} />
        <Button onPress={() => loadEvents(pagination.limit, 0)}>Retry</Button>
      </View>
    );
  }

  useEffect(() => {
    loadEvents(pagination.limit, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents(pagination.limit, 0);
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

  if (events.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <Text>No events found</Text>
        <Button onPress={() => loadEvents(pagination.limit, 0)}>Refresh</Button>
      </View>
    );
  }

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
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && pagination.offset > 0 ? <ActivityIndicator size="small" /> : null
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <Link href={`/events/${item.id}`} asChild>
                <Pressable style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventTime}>{new Date(item.eventTime).toLocaleString()}</Text>
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
