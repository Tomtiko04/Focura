import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Polyfills for web
if (typeof window !== 'undefined') {
  // Add global process variable for web
  if (typeof process === 'undefined') {
    global.process = require('process');
  } else {
    const bProcess = require('process');
    for (const p in bProcess) {
      if (!process[p]) {
        process[p] = bProcess[p];
      }
    }
  }

  // Add Buffer polyfill
  if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer').Buffer;
  }

  // Add crypto polyfill
  if (typeof crypto === 'undefined') {
    global.crypto = require('crypto-browserify');
  }
}

// Register the root component
if (Platform.OS === 'web') {
  registerRootComponent(App);
} else {
  const appName = 'Focura';
  AppRegistry.registerComponent(appName, () => App);
  
  if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    if (rootTag) {
      AppRegistry.runApplication(appName, { rootTag });
    }
  }
}
