/**
 * Toast 通知组件
 * 用于显示简短的非阻塞式消息提示
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration?: number;
  position?: 'top' | 'bottom';
  onHide?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  duration = 4000,
  position = 'top',
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: '✓',
          textColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          icon: '✕',
          textColor: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: '⚠',
          textColor: '#fff',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#2196F3',
          icon: 'ℹ',
          textColor: '#fff',
        };
    }
  };

  const config = getToastConfig();

  const showToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 自动隐藏
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.icon, { color: config.textColor }]}>
        {config.icon}
      </Text>
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={hideToast}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.closeText, { color: config.textColor }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    maxWidth: screenWidth - 32,
  },
  topPosition: {
    top: 50,
  },
  bottomPosition: {
    bottom: 50,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Toast;
