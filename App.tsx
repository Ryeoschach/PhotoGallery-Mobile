/**
 * 移动端照片库应用主入口
 * 集成Redux状态管理和导航系统
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppDispatch } from './src/store/hooks';
import { checkAuthStatus } from './src/store/slices/authSlice';

// 应用初始化组件
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 应用启动时检查认证状态
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <AppNavigator />;
};

// 主应用组件
export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppInitializer />
    </Provider>
  );
}
