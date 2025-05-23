import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../Themed';

jest.mock('../Themed');

describe('ThemeToggle', () => {
  it('toggles theme when pressed', () => {
    const mockToggle = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggle,
    });

    const { getByTestId } = render(<ThemeToggle />);
    fireEvent.press(getByTestId('theme-toggle'));
    expect(mockToggle).toHaveBeenCalled();
  });

  it('shows correct icon for dark mode', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      toggleTheme: jest.fn(),
    });

    const { getByTestId } = render(<ThemeToggle />);
    expect(getByTestId('theme-icon').props.name).toBe('light-mode');
  });
});
