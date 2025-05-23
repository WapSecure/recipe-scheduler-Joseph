import { useState, useEffect } from 'react';
import { ColorSchemeName, useColorScheme as RNUseColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const systemScheme = RNUseColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemScheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorScheme(savedTheme);
      } else {
        setColorScheme(systemScheme);
      }
      setIsMounted(true);
    };
    loadTheme();
  }, [systemScheme]);

  useEffect(() => {
    if (!isMounted) return;
    AsyncStorage.setItem('theme', colorScheme || 'light');
  }, [colorScheme, isMounted]);

  return {
    colorScheme,
    setColorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
}