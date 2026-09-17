import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurable base URL for REST API (Default to local Express backend)
// 10.0.2.2 maps to localhost in the Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
export const SOCKET_URL = 'http://10.0.2.2:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async config => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default apiClient;