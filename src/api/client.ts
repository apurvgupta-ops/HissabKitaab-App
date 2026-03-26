/**
 * HissabKitaab — Axios HTTP client with JWT interceptor
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@hissabkitaab/accessToken';
const REFRESH_KEY = '@hissabkitaab/refreshToken';

// Change this to your backend URL
// Android emulator: http://10.0.2.2:4000
// Physical device / iOS sim: your LAN IP e.g. http://192.168.x.x:4000
// export const BASE_URL = 'http://10.0.2.2:4000';
export const BASE_URL = 'http://localhost:3000';

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject JWT
client.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_KEY);
      // Navigation reset is handled by the auth state listener
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY, REFRESH_KEY };
export default client;
