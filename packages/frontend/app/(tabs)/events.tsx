import { Stack } from 'expo-router';
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
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';

type RootStackParamList = {
  'events/new': undefined;
  'events/[id]': { id: string };
  '(tabs)': undefined;
};

export default function EventsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { events = [], loading, error, hasMore, loadEvents, deleteEvent, refetch } = useEvents();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });

    return unsubscribe;
  }, [navigation, refetch]);

  const loadMoreEvents = useCallback(() => {
    if (!hasMore || loading) return;
    loadEvents(8, events.length);
  }, [hasMore, loading, loadEvents, events.length]);

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

  if (loading && events.length === 0) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorHandler error={error} />
        <Button onPress={refetch}>Retry</Button>
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
          data={events}
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Button mode="outlined" onPress={loadMoreEvents}>
                    Load More
                  </Button>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events scheduled yet</Text>
              <Button onPress={refetch}>Refresh</Button>
            </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
});
