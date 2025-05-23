import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

type FABProps = {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function FAB({ onPress, icon = 'add' }: FABProps) {
  const tint = useThemeColor('tint');
  
  return (
    <TouchableOpacity 
      style={[styles.fab, { backgroundColor: tint }]}
      onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    right: 24,
    bottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});