import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, Linking, useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from 'styled-components/native';
import { getTheme } from './src/theme';
import useThemeStore from './src/store/themeStore';
import useAuthStore, { initAuthFromStorage } from './src/store/authStore';

// Import your screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TabNavigator from './src/navigation/TabNavigator';
import DecideScreen from './src/screens/DecideScreen';
import TasksScreen from './src/screens/TasksScreen';
import AddTypedTaskScreen from './src/screens/AddTypedTaskScreen';
import SnapTaskScreen from './src/screens/SnapTaskScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SnapReviewScreen from './src/screens/SnapReviewScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

// Configure notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Configure deep linking
const linking = {
  prefixes: [
    'focura://',
    'https://focura.app',
    Platform.OS === 'web' ? window.location.origin : '',
  ].filter(Boolean),
  config: {
    screens: {
      Verify: 'verify',
      ResetPassword: 'reset-password',
    },
  },
};

export default function App() {
  const token = useAuthStore((s) => s.token);
  const systemScheme = useColorScheme();
  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  const effectiveKey = selectedTheme === 'system' ? (systemScheme || 'light') : selectedTheme;
  const theme = getTheme(effectiveKey);

  useEffect(() => {
    // Initialize auth from storage
    initAuthFromStorage();

    // Handle deep links when the app is opened from a link
    const handleDeepLink = (event) => {
      console.log('Deep link:', event.url);
      // Handle deep link here if needed
    };

    // Listen for deep links
    const subscription = Platform.OS !== 'web' 
      ? Linking.addEventListener('url', handleDeepLink)
      : null;

    // Get initial URL if app was opened from a link
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer 
        linking={linking}
        fallback={null}
        theme={{
          dark: effectiveKey === 'dark',
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.notification,
          },
        }}
      >
        <StatusBar style={effectiveKey === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
          }}
          initialRouteName="Splash"
        >
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Decide" component={DecideScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SnapReview" component={SnapReviewScreen} />
          <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Verify Email' }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
