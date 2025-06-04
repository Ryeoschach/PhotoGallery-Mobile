/**
 * Redux Store配置
 * 配置移动端的状态管理
 */

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import imagesSlice from './slices/imagesSlice';
import groupsSlice from './slices/groupsSlice';

// 配置store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    images: imagesSlice,
    groups: groupsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略Redux-persist的非序列化action
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 定义RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
