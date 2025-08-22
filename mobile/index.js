import { registerRootComponent } from 'expo';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import App from './App';

// Only configure notifications on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

function AppWrapper() {
  const navigationRef = useRef();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Handle notification taps when the app is in the background or closed
    if (Platform.OS !== 'web') {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        // Navigate based on notification data if needed
        // navigationRef.current?.navigate(data.screen, data.params);
      });
    }

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <App />
    </NavigationContainer>
  );
}

// Register the root component
registerRootComponent(AppWrapper);
