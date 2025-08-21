import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Handle incoming deep links
export const handleDeepLink = async (url, navigation) => {
  if (!url) return;

  try {
    const { path, queryParams } = Linking.parse(url);
    
    // Handle different deep link paths
    switch (path) {
      case 'verify':
        if (queryParams?.token) {
          navigation.navigate('Verify', { token: queryParams.token });
        }
        break;
      case 'reset-password':
        if (queryParams?.token) {
          navigation.navigate('ResetPassword', { token: queryParams.token });
        }
        break;
      // Add more deep link handlers as needed
      default:
        console.log('Unhandled deep link:', path);
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
    Alert.alert('Error', 'Could not open the link. Please try again.');
  }
};

// Register push token with your backend
export const registerForPushNotificationsAsync = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    // TODO: Send the token to your backend
    // await api.post('/device/register', { token });
    
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// Schedule a test notification
export const scheduleTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Welcome to Focura!',
        body: 'This is a test notification. You can turn these off in settings.',
        data: { url: 'focura://test' },
      },
      trigger: { seconds: 2 },
    });
  } catch (error) {
    console.error('Error scheduling test notification:', error);
  }
};
