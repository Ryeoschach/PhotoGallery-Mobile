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
  
  // 处理 aria-hidden 相关的无障碍性问题
  // 这个函数会在 DOM 加载完成后运行
  const handleAriaHiddenIssues = () => {
    if (typeof document !== 'undefined') {
      // 创建一个 MutationObserver 来监听 DOM 变化
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
            const target = mutation.target as HTMLElement;
            if (target.getAttribute('aria-hidden') === 'true') {
              // 检查是否有聚焦的子元素
              const focusedElement = target.querySelector(':focus');
              if (focusedElement) {
                // 移除焦点或者移除 aria-hidden 属性
                (focusedElement as HTMLElement).blur();
              }
            }
          }
        });
      });
      
      // 开始观察
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
        subtree: true
      });
      
      // 定期检查和修复现有的 aria-hidden 问题
      const fixAriaHiddenIssues = () => {
        const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
        elementsWithAriaHidden.forEach((element) => {
          const focusedChild = element.querySelector(':focus');
          if (focusedChild) {
            (focusedChild as HTMLElement).blur();
          }
        });
      };
      
      // 每秒检查一次
      setInterval(fixAriaHiddenIssues, 1000);
    }
  };
  
  // 当 DOM 准备好时执行
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleAriaHiddenIssues);
    } else {
      handleAriaHiddenIssues();
    }
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
