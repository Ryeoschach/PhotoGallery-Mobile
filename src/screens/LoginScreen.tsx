/**
 * 登录屏幕
 * 提供用户登录功能
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { isValidUsername } from '../utils';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // 清除错误信息当组件挂载时
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 显示错误信息
  useEffect(() => {
    if (error) {
      Alert.alert('登录失败', error);
    }
  }, [error]);

  // 处理登录
  const handleLogin = async () => {
    // 验证输入
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }

    if (!password.trim()) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码长度至少6位');
      return;
    }

    // 执行登录
    try {
      await dispatch(loginUser({ username: username.trim(), password })).unwrap();
    } catch (error) {
      // 错误已经在Redux中处理
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>照片库</Text>
          <Text style={styles.subtitle}>登录您的账户</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.form}>
          {/* 用户名输入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>用户名</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="请输入用户名"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* 密码输入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>密码</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="请输入密码"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
