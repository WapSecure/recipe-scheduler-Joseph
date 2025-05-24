import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';

type ErrorHandlerProps = {
  error: Error | null;
  onDismiss?: () => void;
};

export function ErrorHandler({ error, onDismiss }: ErrorHandlerProps) {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{error.message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#B71C1C',
    flex: 1,
  },
  dismissButton: {
    marginLeft: 16,
    padding: 8,
  },
  dismissText: {
    color: '#B71C1C',
    fontWeight: 'bold',
  },
});