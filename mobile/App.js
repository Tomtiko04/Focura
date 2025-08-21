import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { getTheme } from './src/theme';
import useThemeStore from './src/store/themeStore';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import DecideScreen from './src/screens/DecideScreen';
import TasksScreen from './src/screens/TasksScreen';
import AddTypedTaskScreen from './src/screens/AddTypedTaskScreen';
import SnapTaskScreen from './src/screens/SnapTaskScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import useAuthStore from './src/store/authStore';
import TabNavigator from './src/navigation/TabNavigator';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SnapReviewScreen from './src/screens/SnapReviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const token = useAuthStore((s) => s.token);
  const systemScheme = useColorScheme();
  const selectedTheme = useThemeStore((s) => s.selectedTheme); // 'system' | 'light' | 'dark' | 'teal' | 'rose'
  const effectiveKey = selectedTheme === 'system' ? (systemScheme || 'light') : selectedTheme;
  const theme = getTheme(effectiveKey);

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style={effectiveKey === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Decide" component={DecideScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SnapReview" component={SnapReviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
