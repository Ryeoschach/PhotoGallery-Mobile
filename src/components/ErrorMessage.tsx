/**
 * 错误消息组件
 * 用于显示友好的错误提示信息
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  visible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  showRetryButton?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  visible,
  onRetry,
  onDismiss,
  retryText = '重试',
  showRetryButton = false,
}) => {
  const fadeAnim = new Animated.Value(visible ? 1 : 0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const getIconForType = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getColorForType = () => {
    switch (type) {
      case 'error':
        return {
          background: '#ffebee',
          border: '#f44336',
          text: '#c62828',
        };
      case 'warning':
        return {
          background: '#fff3e0',
          border: '#ff9800',
          text: '#e65100',
        };
      case 'info':
        return {
          background: '#e3f2fd',
          border: '#2196f3',
          text: '#1565c0',
        };
      default:
        return {
          background: '#ffebee',
          border: '#f44336',
          text: '#c62828',
        };
    }
  };

  const colors = getColorForType();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIconForType()}</Text>
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {showRetryButton && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: colors.border }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: colors.text }]}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  retryButton: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorMessage;
