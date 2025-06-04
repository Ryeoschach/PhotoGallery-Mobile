/**
 * 加载指示器组件
 * 显示加载状态的旋转指示器
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

interface Props {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<Props> = ({
  text = '加载中...',
  size = 'large',
  color = '#2196F3',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingSpinner;
