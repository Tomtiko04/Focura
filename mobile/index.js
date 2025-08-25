import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

// Register the root component
if (Platform.OS === 'web') {
  // For web, use the standard registration
  registerRootComponent(App);
} else {
  // For native platforms, use AppRegistry
  AppRegistry.registerComponent('main', () => App);
  
  // For web, we also need to register the web version
  if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root');
    if (rootTag) {
      AppRegistry.runApplication('main', { rootTag });
    }
  }
}
