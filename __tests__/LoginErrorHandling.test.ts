/**
 * 登录错误处理测试用例
 * 验证各种登录错误场景的处理
 */

import { parseLoginError, validateLoginInput, formatValidationErrors } from '../src/utils/errorHandling';

// 测试错误解析功能
describe('Login Error Handling', () => {
  
  // 测试网络错误解析
  test('应该正确解析网络错误', () => {
    const networkError = {
      message: '网络连接失败，请检查网络设置',
      code: 'NETWORK_ERROR'
    };
    
    const result = parseLoginError(networkError);
    
    expect(result.type).toBe('network');
    expect(result.message).toBe('网络连接失败，请检查网络设置后重试');
    expect(result.retryable).toBe(true);
  });

  // 测试认证错误解析
  test('应该正确解析认证错误', () => {
    const authError = {
      status: 401,
      message: '用户名或密码错误'
    };
    
    const result = parseLoginError(authError);
    
    expect(result.type).toBe('authentication');
    expect(result.message).toBe('用户名或密码错误，请重新输入');
    expect(result.retryable).toBe(false);
  });

  // 测试服务器错误解析
  test('应该正确解析服务器错误', () => {
    const serverError = {
      status: 500,
      message: '内部服务器错误'
    };
    
    const result = parseLoginError(serverError);
    
    expect(result.type).toBe('server');
    expect(result.message).toBe('服务器临时不可用，请稍后重试');
    expect(result.retryable).toBe(true);
  });

  // 测试输入验证
  test('应该正确验证用户名和密码', () => {
    // 测试空输入
    const emptyResult = validateLoginInput('', '');
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.errors).toContain('请输入用户名');
    expect(emptyResult.errors).toContain('请输入密码');

    // 测试用户名太短
    const shortUsernameResult = validateLoginInput('ab', 'password123');
    expect(shortUsernameResult.isValid).toBe(false);
    expect(shortUsernameResult.errors).toContain('用户名至少需要3个字符');

    // 测试密码太短
    const shortPasswordResult = validateLoginInput('username', '123');
    expect(shortPasswordResult.isValid).toBe(false);
    expect(shortPasswordResult.errors).toContain('密码至少需要6个字符');

    // 测试有效输入
    const validResult = validateLoginInput('username', 'password123');
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
  });

  // 测试错误消息格式化
  test('应该正确格式化多个错误消息', () => {
    const errors = ['请输入用户名', '密码至少需要6个字符'];
    const formatted = formatValidationErrors(errors);
    
    expect(formatted).toBe('1. 请输入用户名\n2. 密码至少需要6个字符');
  });

  // 测试单个错误消息格式化
  test('应该正确格式化单个错误消息', () => {
    const errors = ['请输入用户名'];
    const formatted = formatValidationErrors(errors);
    
    expect(formatted).toBe('请输入用户名');
  });

  // 测试空错误数组
  test('应该处理空错误数组', () => {
    const formatted = formatValidationErrors([]);
    expect(formatted).toBe('');
  });
});

// 测试错误类型映射
describe('Error Type Mapping', () => {
  test('应该正确映射错误类型到消息类型', () => {
    const { getErrorMessageType } = require('../src/utils/errorHandling');
    
    expect(getErrorMessageType('network')).toBe('warning');
    expect(getErrorMessageType('validation')).toBe('info');
    expect(getErrorMessageType('authentication')).toBe('error');
    expect(getErrorMessageType('server')).toBe('error');
    expect(getErrorMessageType('unknown')).toBe('error');
  });

  test('应该返回正确的重试按钮文本', () => {
    const { getRetryButtonText } = require('../src/utils/errorHandling');
    
    expect(getRetryButtonText('network')).toBe('重新连接');
    expect(getRetryButtonText('server')).toBe('重试');
    expect(getRetryButtonText('authentication')).toBe('重新输入');
    expect(getRetryButtonText('unknown')).toBe('重试');
  });
});

// 模拟登录场景测试
describe('Login Scenarios', () => {
  // 模拟成功登录
  test('成功登录场景', async () => {
    // 这里可以添加集成测试
    // 模拟API调用、Redux状态更新等
    const mockCredentials = {
      username: 'testuser',
      password: 'password123'
    };

    // 验证输入
    const validation = validateLoginInput(mockCredentials.username, mockCredentials.password);
    expect(validation.isValid).toBe(true);
  });

  // 模拟各种失败场景
  test('输入验证失败场景', () => {
    const invalidCredentials = [
      { username: '', password: '' },
      { username: 'ab', password: 'password123' },
      { username: 'username', password: '123' },
    ];

    invalidCredentials.forEach(creds => {
      const validation = validateLoginInput(creds.username, creds.password);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

export default describe;
