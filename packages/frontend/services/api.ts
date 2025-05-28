import axios from 'axios';
import { Event as RecipeEvent } from '../../backend/src/models/interfaces';
import { Platform, Alert } from 'react-native';

const getApiBaseUrl = () => {
  // For production/published builds, use the Ngrok URL
  if (!__DEV__) {
    return 'https://7d8b-197-210-29-130.ngrok-free.app/api';
  }

  // For development (emulator/local device)
  return Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'https://7d8b-197-210-29-130.ngrok-free.app/api',
    default: 'http://localhost:3000/api',
  });
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

// Enhanced request interceptor
api.interceptors.request.use((config) => {
  console.log('Making request to:', config.url);
  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url);
    return response;
  },
  (error) => {
    let errorMessage = 'Something went wrong';
    let showAlert = false;
    let alertTitle = 'Error';

    if (error.response) {
      const responseData = error.response.data;

      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.errors) {
        errorMessage = (responseData.errors as Array<{ message: string }>)
          .map((e) => e.message)
          .join('\n');
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }

      if (
        errorMessage.toLowerCase().includes('future') ||
        errorMessage.toLowerCase().includes('date') ||
        errorMessage.toLowerCase().includes('time')
      ) {
        errorMessage = 'Please select a future date and time';
      }

      showAlert = true;
    } else if (error.request) {
      errorMessage = 'No response from server - please check your connection';
      alertTitle = 'Connection Error';
      showAlert = true;
    } else {
      errorMessage = error.message || 'Failed to process request';
    }

    console.error('API Error:', errorMessage, error.config?.url);

    const apiError = new Error(errorMessage);

    if (showAlert) {
      Alert.alert(alertTitle, errorMessage, [{ text: 'OK' }]);
    }

    return Promise.reject(apiError);
  }
);

export const registerDeviceToken = async (userId: string, pushToken: string) => {
  try {
    const response = await api.post('/devices', { userId, pushToken });
    return response.data;
  } catch (error) {
    console.error('Failed to register device token:', error);
    throw error;
  }
};

export const getEvents = async (userId: string, limit = 8, offset = 0) => {
  try {
    const res = await api.get<{
      data: RecipeEvent[];
      pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
      };
    }>('/events', { params: { userId, limit, offset } });

    return res.data;
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
