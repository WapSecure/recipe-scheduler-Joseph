import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import EventsScreen from '../events';
import { useEvents } from '@/services/events';

jest.mock('@/services/events');

describe('EventsScreen', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event',
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      userId: 'user-1'
    }
  ];

  beforeEach(() => {
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      deleteEvent: jest.fn(),
    });
  });

  it('renders event list', () => {
    const { getByText } = render(<EventsScreen />);
    expect(getByText('Test Event')).toBeTruthy();
  });

  it('shows empty state when no events', () => {
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      deleteEvent: jest.fn(),
    });
    
    const { getByText } = render(<EventsScreen />);
    expect(getByText('No events scheduled yet')).toBeTruthy();
  });

  it('calls delete when swipe action is pressed', async () => {
    const mockDelete = jest.fn();
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      deleteEvent: mockDelete,
    });

    const { getByText } = render(<EventsScreen />);
    
    // Note: This is a simplified test - in reality we will need to simulate swipe
    fireEvent.press(getByText('Delete'));
    fireEvent.press(getByText('Delete')); // Confirm deletion
    
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});