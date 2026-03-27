/**
 * HissabKitaab — App Navigator
 * Bottom tab navigator with 3 tabs: Capture, Inbox, Settings
 * Stack navigator inside Capture tab for sub-screens
 */
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { fontSize, fontWeight } from '../theme/typography';

// Screens
import LoginScreen from '../screens/LoginScreen';
import CaptureScreen from '../features/capture/CaptureScreen';
import ReceiptResultScreen from '../features/capture/ReceiptResultScreen';
import InboxScreen from '../features/inbox/InboxScreen';
import AutomationAdapterScreen from '../features/automation/AutomationAdapterScreen';

// Auth
import { getToken } from '../api/auth';
import { TOKEN_KEY, REFRESH_KEY } from '../api/client';
import type { ReceiptUploadResponse } from '../api/uploads';

// -- Type definitions for navigation params --
export type CaptureStackParamList = {
  CaptureHome: undefined;
  ReceiptResult: { result: ReceiptUploadResponse };
};

// -- Navigators --
const Tab = createBottomTabNavigator();
const CaptureStack = createNativeStackNavigator<CaptureStackParamList>();

function CaptureStackNavigator() {
  return (
    <CaptureStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: fontWeight.semibold },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <CaptureStack.Screen
        name="CaptureHome"
        component={CaptureScreen}
        options={{ headerShown: false }}
      />
      <CaptureStack.Screen
        name="ReceiptResult"
        component={ReceiptResultScreen}
        options={{
          title: 'Receipt Details',
          headerBackTitle: 'Back',
        }}
      />
    </CaptureStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: fontWeight.semibold,
        },
      }}
    >
      <Tab.Screen
        name="Capture"
        component={CaptureStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="photo-camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="inbox" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AutomationAdapterScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="tune" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    (global as any).debugAuth = async () => {
      const accessToken = await AsyncStorage.getItem(TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      const user = await AsyncStorage.getItem('@hissabkitaab/user');

      console.log('Auth Debug', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken
          ? `${accessToken.slice(0, 12)}...`
          : null,
        refreshTokenPreview: refreshToken
          ? `${refreshToken.slice(0, 12)}...`
          : null,
        user,
      });
    };
  }, []);

  const checkAuth = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
  };

  // Show nothing while checking auth
  if (isLoggedIn === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      {isLoggedIn ? (
        <MainTabs />
      ) : (
        <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
}
