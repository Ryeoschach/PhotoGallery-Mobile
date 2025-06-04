/**
 * 移动端类型定义
 * 基于共享类型定义，增加移动端特定的类型
 */

// 导入共享类型（实际项目中应该从shared模块导入）
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  images?: number[];
  is_staff: boolean;
}

export interface Image {
  id: number;
  name: string;
  description: string;
  image: string;
  width: number;
  height: number;
  size: number;
  groups: number[];
  owner: number;
  owner_username: string;
  uploaded_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ImagesState {
  images: Image[];
  currentImage: Image | null;
  isLoading: boolean;
  error: string | null;
}

export interface GroupsState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
}

// 移动端特定类型
export interface NavigationParamList {
  Login: undefined;
  Home: undefined;
  Gallery: undefined;
  ImageDetail: { imageId: number };
  Profile: undefined;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
