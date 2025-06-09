/**
 * 导航配置
 * 设置应用的导航结构和路由
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// 导入页面组件
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ImageDetailScreen from '../screens/ImageDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<NavigationParamList>();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  console.log('AppNavigator render - isAuthenticated:', isAuthenticated); // 新增日志

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // 未认证状态 - 显示登录页面
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              title: '登录',
              headerShown: false, // 登录页面隐藏header
            }}
          />
        ) : (
          // 已认证状态 - 显示主要页面
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: '照片库',
              }}
            />
            <Stack.Screen 
              name="Gallery" 
              component={GalleryScreen}
              options={{
                title: '图片画廊',
              }}
            />
            <Stack.Screen 
              name="ImageDetail" 
              component={ImageDetailScreen}
              options={{
                title: '图片详情',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                title: '个人资料',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
