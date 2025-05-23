import React, { createContext, useContext, useState } from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#2f95dc',
    card: '#F8F8F8',
    border: '#E0E0E0',
    notification: '#FF3B30',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: '#2f95dc',
    card: '#1E1E1E',
    border: '#333333',
    notification: '#FF3B30',
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const Text = (props: DefaultText['props']) => {
  const { theme } = useTheme();
  return <DefaultText {...props} style={[{ color: Colors[theme].text }, props.style]} />;
};

export const View = (props: DefaultView['props']) => {
  const { theme } = useTheme();
  return <DefaultView {...props} style={[{ backgroundColor: Colors[theme].background }, props.style]} />;
};

export const useThemeColor = (colorName: keyof typeof Colors.light) => {
  const { theme } = useTheme();
  return Colors[theme][colorName];
};