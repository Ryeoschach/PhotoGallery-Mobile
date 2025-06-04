/**
 * 工具函数
 * 提供通用的工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化日期
 * @param dateString ISO日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1天前';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
};

/**
 * 获取图片纵横比
 * @param width 图片宽度
 * @param height 图片高度
 * @returns 纵横比
 */
export const getAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * 计算适应容器的图片尺寸
 * @param imageWidth 原图宽度
 * @param imageHeight 原图高度
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns 适应容器的图片尺寸
 */
export const calculateFitSize = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } => {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  let width, height;
  
  if (imageAspectRatio > containerAspectRatio) {
    // 图片更宽，以容器宽度为准
    width = containerWidth;
    height = containerWidth / imageAspectRatio;
  } else {
    // 图片更高，以容器高度为准
    height = containerHeight;
    width = containerHeight * imageAspectRatio;
  }
  
  return { width, height };
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 生成随机ID
 * @returns 随机ID字符串
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证用户名格式
 * @param username 用户名
 * @returns 是否为有效用户名格式
 */
export const isValidUsername = (username: string): boolean => {
  // 用户名应为3-20个字符，只包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * 安全地获取嵌套对象属性
 * @param obj 对象
 * @param path 属性路径，用点分隔
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export const safeGet = (obj: any, path: string, defaultValue: any = undefined): any => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
};
