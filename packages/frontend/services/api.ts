import axios from 'axios';
import { Event as RecipeEvent } from '../../backend/src/models/interfaces';
import { Platform, Alert } from 'react-native';

// Dynamic base URL configuration
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Platform-specific defaults
  return Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
    default: 'http://localhost:3000/api',
  });
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

// Enhanced request interceptor
api.interceptors.request.use(config => {
  console.log('Making request to:', config.url);
  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  response => {
    console.log('Response from:', response.config.url);
    return response;
  },
  error => {
    let errorMessage = 'Network error';
    
    if (error.response) {
      // Server responded with non-2xx status
      errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || 'Request setup error';
    }

    console.error('API Error:', errorMessage, error.config?.url);
    
    // Show user-friendly alert for network errors
    if (errorMessage.includes('Network') || errorMessage.includes('response')) {
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check your network connection.'
      );
    }

    return Promise.reject(error);
  }
);

// API methods with enhanced error handling
export const registerDeviceToken = async (userId: string, pushToken: string) => {
  try {
    const response = await api.post('/devices', { userId, pushToken });
    return response.data;
  } catch (error) {
    console.error('Failed to register device token:', error);
    throw error;
  }
};

export const getEvents = async (userId: string) => {
  try {
    const response = await api.get<RecipeEvent[]>('/events', { 
      params: { userId } 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
};

export const createEvent = async (event: Omit<RecipeEvent, 'id' | 'createdAt'>) => {
  try {
    const response = await api.post<RecipeEvent>('/events', event);
    return response.data;
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, updates: Partial<RecipeEvent>) => {
  try {
    const response = await api.patch<RecipeEvent>(`/events/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await api.delete(`/events/${id}`);
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
};

// Health check utility
export const checkApiHealth = async () => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};