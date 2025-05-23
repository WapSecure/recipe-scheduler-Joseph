import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './Themed';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Pressable 
      onPress={toggleTheme} 
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.5 : 1 }
      ]}
    >
      <MaterialIcons 
        name={theme === 'light' ? 'dark-mode' : 'light-mode'} 
        size={24} 
        color={theme === 'light' ? '#000' : '#FFF'} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
  },
});