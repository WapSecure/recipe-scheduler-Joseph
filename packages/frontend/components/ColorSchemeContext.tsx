import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorSchemeName, useColorScheme as RNUseColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorSchemeContextType = {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  isDark: boolean;
  isLight: boolean;
};

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export const ColorSchemeProvider = ({ children }: { children: React.ReactNode }) => {
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

  return (
    <ColorSchemeContext.Provider
      value={{
        colorScheme,
        setColorScheme,
        isDark: colorScheme === 'dark',
        isLight: colorScheme === 'light',
      }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};
