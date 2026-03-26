/**
 * HissabKitaab — Auth API functions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { TOKEN_KEY, REFRESH_KEY } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  preferredCurrency: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Login with email and password.
 * Stores tokens in AsyncStorage on success.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await client.post<{ success: boolean; data: AuthResponse }>(
    '/auth/login',
    { email, password },
  );

  const { tokens, user } = data.data;
  await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  await AsyncStorage.setItem('@hissabkitaab/user', JSON.stringify(user));

  return data.data;
}

/**
 * Clear all auth tokens and user data.
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
  await AsyncStorage.removeItem('@hissabkitaab/user');
}

/**
 * Get the stored access token (or null if not logged in).
 */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Get the stored user profile (or null if not logged in).
 */
export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem('@hissabkitaab/user');
  if (!raw) {return null;}
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
