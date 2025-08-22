import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configure the default notification channel for Android
async function configureNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
}

// Request permission to send notifications
async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// Schedule a test notification (for onboarding demo)
async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You're all set! 🎉",
      body: 'You\'ll receive reminders for your tasks here.',
      data: { type: 'onboarding' },
    },
    trigger: { seconds: 2 },
  });
}

// Get the push notification token (for sending to your backend)
async function getPushToken() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Set this in app.json
    });
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export default {
  configureNotifications,
  requestPermissions,
  scheduleTestNotification,
  getPushToken,
};
