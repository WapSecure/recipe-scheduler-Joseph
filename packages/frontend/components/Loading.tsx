import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColor } from './Themed';

export function Loading() {
  const tint = useThemeColor('tint');
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});