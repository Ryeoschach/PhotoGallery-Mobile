import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// 抑制 React Native Web 的警告和无障碍性警告
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      // 过滤掉 React Native Web 的弃用警告
      const deprecatedWarnings = [
        'pointerEvents is deprecated',
        'props.pointerEvents is deprecated',
        'shadowColor is deprecated',
        'shadowOffset is deprecated', 
        'shadowOpacity is deprecated',
        'shadowRadius is deprecated',
        'props.shadow',
        'style.shadow'
      ];
      
      if (deprecatedWarnings.some(warning => args[0].includes(warning))) {
        return; // 忽略这些特定的警告
      }
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      // 过滤掉 aria-hidden 无障碍性警告
      const ariaWarnings = [
        'Blocked aria-hidden on an element because its descendant retained focus',
        'aria-hidden on a focused element',
        'WAI-ARIA specification'
      ];
      
      if (ariaWarnings.some(warning => args[0].includes(warning))) {
        return; // 忽略这些特定的错误
      }
    }
    originalError.apply(console, args);
  };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
