/**
 * 登录屏幕
 * 提供用户登录功能和增强的错误提示
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { isValidUsername } from '../utils';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../contexts/ToastContext';
import { 
  parseLoginError, 
  getErrorMessageType, 
  getRetryButtonText, 
  validateLoginInput,
  formatValidationErrors,
  type LoginError 
} from '../utils/errorHandling';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationError, setShowValidationError] = useState(false);

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const toast = useToast();
  
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // 清除错误信息当组件挂载时
  useEffect(() => {
    dispatch(clearError());
    setLoginError(null);
    setValidationErrors([]);
    setShowValidationError(false);
  }, [dispatch]);

  // 处理Redux错误状态
  useEffect(() => {
    if (error) {
      const parsedError = parseLoginError({ message: error });
      setLoginError(parsedError);
    } else {
      setLoginError(null);
    }
  }, [error]);

  // 输入变化时清除相关错误
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setShowValidationError(false);
    }
    if (loginError) {
      setLoginError(null);
      dispatch(clearError());
    }
  }, [username, password, validationErrors.length, loginError, dispatch]);

  // 处理登录
  const handleLogin = async () => {
    // 输入验证
    const validation = validateLoginInput(username, password);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowValidationError(true);
      
      // 显示输入验证错误的Toast提示
      toast.showWarning(formatValidationErrors(validation.errors), 4000);
      
      // 聚焦到第一个有错误的输入框
      if (validation.errors.some((err: string) => err.includes('用户名'))) {
        usernameInputRef.current?.focus();
      } else if (validation.errors.some((err: string) => err.includes('密码'))) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    // 清除之前的错误
    setLoginError(null);
    setValidationErrors([]);
    setShowValidationError(false);

    // 执行登录
    try {
      await dispatch(loginUser({ username: username.trim(), password })).unwrap();
      
      // 登录成功提示
      toast.showSuccess('登录成功！欢迎回来');
      
    } catch (error: any) {
      // 错误已经在Redux中处理，这里可以做额外的处理
      console.log('登录失败:', error);
      
      // 显示友好的错误提示
      const parsedError = parseLoginError(error);
      toast.showError(parsedError.message, 6000);
    }
  };

  // 重试登录
  const handleRetry = () => {
    setLoginError(null);
    dispatch(clearError());
    
    // 根据错误类型执行不同的重试策略
    if (loginError?.type === 'authentication') {
      // 认证错误，清空密码并聚焦
      setPassword('');
      passwordInputRef.current?.focus();
    } else {
      // 其他错误，重新尝试登录
      handleLogin();
    }
  };

  // 关闭错误提示
  const handleDismissError = () => {
    setLoginError(null);
    dispatch(clearError());
  };

  // 关闭验证错误提示
  const handleDismissValidationError = () => {
    setShowValidationError(false);
    setValidationErrors([]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>照片库</Text>
            <Text style={styles.subtitle}>登录您的账户</Text>
          </View>

          {/* 错误提示 */}
          {showValidationError && validationErrors.length > 0 && (
            <ErrorMessage
              message={formatValidationErrors(validationErrors)}
              type="info"
              visible={showValidationError}
              onDismiss={handleDismissValidationError}
              showRetryButton={false}
            />
          )}

          {loginError && (
            <ErrorMessage
              message={loginError.message}
              type={getErrorMessageType(loginError.type)}
              visible={!!loginError}
              onRetry={loginError.retryable ? handleRetry : undefined}
              onDismiss={handleDismissError}
              retryText={getRetryButtonText(loginError.type)}
              showRetryButton={loginError.retryable}
            />
          )}

          {/* 登录表单 */}
          <View style={styles.form}>
            {/* 用户名输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>用户名</Text>
              <TextInput
                ref={usernameInputRef}
                style={[
                  styles.input, 
                  validationErrors.some((err: string) => err.includes('用户名')) && styles.inputError
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="请输入用户名"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* 密码输入 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>密码</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[
                    styles.input, 
                    styles.passwordInput,
                    validationErrors.some((err: string) => err.includes('密码')) && styles.inputError
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="请输入密码"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? '隐藏' : '显示'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              使用您的网站账户登录
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    color: '#2196F3',
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default LoginScreen;
