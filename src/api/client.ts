import axios from 'axios';

// Configurable base URL for REST API (Default to local Express backend)
export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // 10.0.2.2 maps to localhost in Android Emulator

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
