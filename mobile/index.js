import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

// Register the root component
if (Platform.OS === 'web') {
  // For web, use the standard registration
  registerRootComponent(App);
} else {
  // For native platforms
  const appName = 'Focura';
  
  // Register the app
  AppRegistry.registerComponent(appName, () => App);
  
  // For web, we need to manually run the application
  if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    if (rootTag) {
      AppRegistry.runApplication(appName, { rootTag });
    }
  }
}
