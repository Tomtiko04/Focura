import { registerRootComponent } from 'expo';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import App from './App';
import { Linking } from 'react-native';

// Configure notifications behavior when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AppWrapper() {
  const navigationRef = useRef();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Handle notification taps when the app is in the background or closed
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Navigate based on notification data if needed
      // navigationRef.current?.navigate(data.screen, data.params);
    });

    // Handle deep links when the app is opened from a link
    const handleDeepLink = ({ url }) => {
      if (url) {
        // The NavigationContainer will handle the actual navigation
        // This ensures deep links work when the app is opened from a cold start
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check if the app was opened from a deep link when it was completely closed
    Linking.getInitialURL().then(url => {
      if (url) {
        // The NavigationContainer will handle the navigation
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <App />
    </NavigationContainer>
  );
}

registerRootComponent(AppWrapper);
