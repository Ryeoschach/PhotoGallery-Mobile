/**
 * 个人资料屏幕
 * 显示用户信息和账户设置
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectUser, 
  logoutUser,
} from '../store/slices/authSlice';
import { selectAllImages, selectUserImages } from '../store/slices/imagesSlice';
import { NavigationParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<NavigationParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const allImages = useAppSelector(selectAllImages);
  const userImages = useAppSelector(selectUserImages);

  // 获取用户的图片数量 - 使用缓存的用户图片数据或从所有图片中筛选
  const userImageCount = userImages.length > 0 
    ? userImages.length 
    : allImages.filter(image => image.owner === user?.id).length;

  // 总图片数量 - 使用缓存的所有图片数据
  const totalImageCount = allImages.length;

  // 处理登出
  const handleLogout = () => {
    Alert.alert(
      '确认登出',
      '您确定要登出吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  // 导航到我的图片
  const handleViewMyImages = () => {
    navigation.navigate('Gallery');
    // 这里应该设置过滤为仅显示我的图片，但由于导航参数限制，暂时导航到画廊页面
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>用户信息加载失败</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.first_name || user.username).charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user.username
            }
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.is_staff && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>管理员</Text>
            </View>
          )}
        </View>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>统计信息</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userImageCount}</Text>
            <Text style={styles.statLabel}>我的图片</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalImageCount}</Text>
            <Text style={styles.statLabel}>总图片数</Text>
          </View>
        </View>
      </View>

      {/* 账户详情 */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>账户详情</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>用户名</Text>
          <Text style={styles.detailValue}>{user.username}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>邮箱</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>
        
        {user.first_name && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>名字</Text>
            <Text style={styles.detailValue}>{user.first_name}</Text>
          </View>
        )}
        
        {user.last_name && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>姓氏</Text>
            <Text style={styles.detailValue}>{user.last_name}</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>账户类型</Text>
          <Text style={styles.detailValue}>
            {user.is_staff ? '管理员账户' : '普通用户'}
          </Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>操作</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleViewMyImages}
        >
          <Text style={styles.actionButtonText}>查看我的图片</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            退出登录
          </Text>
        </TouchableOpacity>
      </View>

      {/* 底部间距 */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  staffBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staffBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  logoutButtonText: {
    color: '#fff',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
