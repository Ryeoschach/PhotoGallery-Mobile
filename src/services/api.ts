/**
 * 移动端API服务层
 * 使用axios进行HTTP请求，适配后端API
 */

import axios, { AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { 
  User, 
  Image, 
  Group, 
  AuthTokens, 
  LoginCredentials, 
  ApiResponse, 
  ApiError 
} from '../types';

// API基础配置
const BASE_URL = 'http://127.0.0.1:8000'; // 开发环境，实际部署时需要修改
const API_PREFIX = '/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token存储key
const TOKEN_KEY = 'auth_tokens';

// 安全存储工具函数
const secureStorage = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        // Web环境下使用localStorage
        return localStorage.getItem(key);
      } else {
        // 移动环境下使用SecureStore
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.log('获取存储项失败:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.log('设置存储项失败:', error);
    }
  },
  
  deleteItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.log('删除存储项失败:', error);
    }
  }
};

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const tokens = await secureStorage.getItem(TOKEN_KEY);
      if (tokens) {
        const parsedTokens: AuthTokens = JSON.parse(tokens);
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${parsedTokens.access}`;
      }
    } catch (error) {
      console.log('获取token失败:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      
      try {
        const tokens = await secureStorage.getItem(TOKEN_KEY);
        if (tokens) {
          const parsedTokens: AuthTokens = JSON.parse(tokens);
          const refreshResponse = await axios.post(`${BASE_URL}${API_PREFIX}/token/refresh/`, {
            refresh: parsedTokens.refresh
          });
          
          const newTokens: AuthTokens = {
            access: refreshResponse.data.access,
            refresh: parsedTokens.refresh
          };
          
          await secureStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 刷新token失败，清除存储的token
        await secureStorage.deleteItem(TOKEN_KEY);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 工具函数：处理API响应
const handleApiResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  return {
    data: response.data,
    status: response.status,
  };
};

// 工具函数：处理API错误
const handleApiError = (error: AxiosError): ApiError => {
  console.log('API错误详情:', {
    response: error.response?.data,
    status: error.response?.status,
    message: error.message,
    code: error.code,
  });

  if (error.response) {
    const responseData = error.response.data as any;
    
    // 处理Django REST framework的标准错误格式
    let message = '请求失败';
    
    if (responseData?.detail) {
      message = responseData.detail;
    } else if (responseData?.non_field_errors) {
      message = Array.isArray(responseData.non_field_errors) 
        ? responseData.non_field_errors.join(', ')
        : responseData.non_field_errors;
    } else if (responseData?.username) {
      message = `用户名: ${Array.isArray(responseData.username) 
        ? responseData.username.join(', ') 
        : responseData.username}`;
    } else if (responseData?.password) {
      message = `密码: ${Array.isArray(responseData.password) 
        ? responseData.password.join(', ') 
        : responseData.password}`;
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (typeof responseData === 'string') {
      message = responseData;
    }

    return {
      message,
      status: error.response.status,
      code: responseData?.code,
    };
  } else if (error.request) {
    return {
      message: '网络连接失败，请检查网络设置',
      code: 'NETWORK_ERROR',
    };
  } else {
    return {
      message: error.message || '未知错误',
      code: 'UNKNOWN_ERROR',
    };
  }
};

// 认证API
export const authApi = {
  // 用户登录
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> => {
    try {
      const response = await apiClient.post<AuthTokens>('/token/', credentials);
      // 登录成功后保存token
      await secureStorage.setItem(TOKEN_KEY, JSON.stringify(response.data));
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<User>('/me/');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 用户登出
  logout: async (): Promise<void> => {
    console.log('authApi.logout called'); // 新增日志
    try {
      await secureStorage.deleteItem(TOKEN_KEY);
      console.log('Token deleted successfully'); // 新增日志
    } catch (error) {
      console.log('登出时清除token失败:', error);
    }
  },

  // 检查是否有有效token
  hasValidToken: async (): Promise<boolean> => {
    try {
      const tokens = await secureStorage.getItem(TOKEN_KEY);
      return !!tokens;
    } catch (error) {
      return false;
    }
  },
};

// 图片API
export const imagesApi = {
  // 获取图片列表
  getImages: async (mine?: boolean): Promise<ApiResponse<Image[]>> => {
    try {
      const params = mine ? { mine: 'true' } : {};
      const response = await apiClient.get<Image[]>('/images/', { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 获取特定图片详情
  getImage: async (id: number): Promise<ApiResponse<Image>> => {
    try {
      const response = await apiClient.get<Image>(`/images/${id}/`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// 分组API
export const groupsApi = {
  // 获取分组列表
  getGroups: async (): Promise<ApiResponse<Group[]>> => {
    try {
      const response = await apiClient.get<Group[]>('/groups/');
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // 获取特定分组详情
  getGroup: async (id: number): Promise<ApiResponse<Group>> => {
    try {
      const response = await apiClient.get<Group>(`/groups/${id}/`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};

// 导出API客户端实例（用于扩展）
export { apiClient };

// 默认导出所有API
export default {
  auth: authApi,
  images: imagesApi,
  groups: groupsApi,
};
