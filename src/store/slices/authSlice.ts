/**
 * 认证状态管理
 * 处理用户登录、登出和认证状态
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthTokens, LoginCredentials, ApiError } from '../../types';
import { authApi } from '../../services/api';

// 初始状态
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 异步action：用户登录
export const loginUser = createAsyncThunk<
  { tokens: AuthTokens; user: User },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // 执行登录
      const loginResponse = await authApi.login(credentials);
      
      // 获取用户信息
      const userResponse = await authApi.getCurrentUser();
      
      return {
        tokens: loginResponse.data,
        user: userResponse.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 异步action：获取当前用户信息
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 异步action：检查认证状态
export const checkAuthStatus = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const hasToken = await authApi.hasValidToken();
      if (!hasToken) {
        return null;
      }
      
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error) {
      // Token无效，清除存储
      await authApi.logout();
      return null;
    }
  }
);

// 异步action：用户登出
export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    await authApi.logout();
  }
);

// 创建slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    },
    // 清除认证状态（用于登出）
    clearAuth: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 处理登录
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '登录失败';
        state.isAuthenticated = false;
      });

    // 处理获取当前用户
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '获取用户信息失败';
      });

    // 处理检查认证状态
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // 处理登出
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

// 导出actions
export const { clearError, clearAuth } = authSlice.actions;

// 导出reducer
export default authSlice.reducer;

// 选择器
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
