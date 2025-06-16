/**
 * 错误处理工具函数
 * 用于处理和分类不同类型的登录错误
 */

export interface LoginError {
  type: 'network' | 'validation' | 'authentication' | 'server' | 'unknown';
  message: string;
  originalError?: any;
  retryable: boolean;
}

/**
 * 解析登录错误并返回用户友好的错误信息
 */
export const parseLoginError = (error: any): LoginError => {
  // 网络错误
  if (!error.status && error.message?.includes('网络')) {
    return {
      type: 'network',
      message: '网络连接失败，请检查网络设置后重试',
      originalError: error,
      retryable: true,
    };
  }

  // 根据HTTP状态码分类
  switch (error.status) {
    case 400:
      return {
        type: 'validation',
        message: '用户名或密码格式不正确，请检查输入',
        originalError: error,
        retryable: false,
      };

    case 401:
      return {
        type: 'authentication',
        message: '用户名或密码错误，请重新输入',
        originalError: error,
        retryable: false,
      };

    case 403:
      return {
        type: 'authentication',
        message: '账户被禁用或权限不足，请联系管理员',
        originalError: error,
        retryable: false,
      };

    case 429:
      return {
        type: 'server',
        message: '登录尝试过于频繁，请稍后再试',
        originalError: error,
        retryable: true,
      };

    case 500:
    case 502:
    case 503:
      return {
        type: 'server',
        message: '服务器临时不可用，请稍后重试',
        originalError: error,
        retryable: true,
      };

    default:
      // 检查具体错误消息
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('用户名')) {
        return {
          type: 'validation',
          message: '用户名不存在，请检查用户名是否正确',
          originalError: error,
          retryable: false,
        };
      }
      
      if (errorMessage.includes('密码')) {
        return {
          type: 'authentication',
          message: '密码错误，请重新输入正确的密码',
          originalError: error,
          retryable: false,
        };
      }
      
      if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
        return {
          type: 'network',
          message: '连接超时，请检查网络后重试',
          originalError: error,
          retryable: true,
        };
      }

      return {
        type: 'unknown',
        message: '登录失败，请稍后重试',
        originalError: error,
        retryable: true,
      };
  }
};

/**
 * 获取错误类型对应的提示类型
 */
export const getErrorMessageType = (errorType: LoginError['type']): 'error' | 'warning' | 'info' => {
  switch (errorType) {
    case 'network':
      return 'warning';
    case 'validation':
      return 'info';
    case 'authentication':
    case 'server':
    case 'unknown':
    default:
      return 'error';
  }
};

/**
 * 获取重试建议文本
 */
export const getRetryButtonText = (errorType: LoginError['type']): string => {
  switch (errorType) {
    case 'network':
      return '重新连接';
    case 'server':
      return '重试';
    case 'authentication':
      return '重新输入';
    default:
      return '重试';
  }
};

/**
 * 输入验证函数
 */
export const validateLoginInput = (username: string, password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 用户名验证
  if (!username.trim()) {
    errors.push('请输入用户名');
  } else if (username.trim().length < 3) {
    errors.push('用户名至少需要3个字符');
  } else if (username.trim().length > 30) {
    errors.push('用户名不能超过30个字符');
  }

  // 密码验证
  if (!password.trim()) {
    errors.push('请输入密码');
  } else if (password.length < 6) {
    errors.push('密码至少需要6个字符');
  } else if (password.length > 128) {
    errors.push('密码不能超过128个字符');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 格式化多个错误信息
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};
