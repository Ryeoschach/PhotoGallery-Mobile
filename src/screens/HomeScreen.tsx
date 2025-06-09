/**
 * 主页屏幕
 * 显示照片库的主要import { 
  fetchImages, 
  selectImages, 
  selectImagesLoading, 
  selectImagesError,
  switchToUserImages,
  switchToAllImages,
} from '../store/slices/imagesSlice'; */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectUser, 
  selectIsAuthenticated,
  logoutUser,
} from '../store/slices/authSlice';
import { 
  fetchImages, 
  selectImages, 
  selectImagesLoading, 
  selectImagesError,
  switchToUserImages,
  switchToAllImages,
} from '../store/slices/imagesSlice';
import { 
  fetchGroups, 
  selectGroups, 
  selectGroupsLoading 
} from '../store/slices/groupsSlice';
import { NavigationParamList } from '../types';
import ImageGridComponent from '../components/ImageGrid';
import LoadingSpinner from '../components/LoadingSpinner';

type HomeScreenNavigationProp = NativeStackNavigationProp<NavigationParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const images = useAppSelector(selectImages);
  const imagesLoading = useAppSelector(selectImagesLoading);
  const imagesError = useAppSelector(selectImagesError);
  const groups = useAppSelector(selectGroups);
  const groupsLoading = useAppSelector(selectGroupsLoading);

  const scrollViewRef = useRef<ScrollView>(null);

  // 组件挂载时加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, dispatch]);

  // 处理错误
  useEffect(() => {
    if (imagesError) {
      Alert.alert('错误', imagesError);
    }
  }, [imagesError]);

  // 加载数据
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchImages()).unwrap(), // 加载所有图片
        dispatch(fetchImages({ mine: true })).unwrap(), // 加载用户图片
        dispatch(fetchGroups()).unwrap(),
      ]);
      // 默认显示所有图片
      dispatch(switchToAllImages());
    } catch (error) {
      console.log('加载数据失败:', error);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadData();
  };

  // 处理登出
  const handleLogout = () => {
    console.log('HomeScreen handleLogout triggered');
    console.log('Dispatching logoutUser directly from HomeScreen');
    dispatch(logoutUser())
      .then(() => {
        console.log('HomeScreen logoutUser dispatch completed successfully');
      })
      .catch((error) => {
        console.error('HomeScreen logout failed:', error);
        Alert.alert('登出失败', '操作无法完成，请稍后再试。');
      });
  };

  // 导航到图片详情
  const handleImagePress = (imageId: number) => {
    navigation.navigate('ImageDetail', { imageId });
  };

  // 导航到画廊
  const handleViewAllImages = () => {
    navigation.navigate('Gallery');
  };

  // 导航到个人资料
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  // 设置导航头部
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleProfile} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>个人资料</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.logoutText]}>登出</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未登录</Text>
      </View>
    );
  }

  const recentImages = images.slice(0, 6); // 显示最近的6张图片
  const isLoading = imagesLoading || groupsLoading;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={['#2196F3']}
        />
      }
    >
      {/* 欢迎区域 */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          欢迎回来, {user?.first_name || user?.username}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          您的照片库中共有 {images.length} 张图片
        </Text>
      </View>

      {/* 快速操作区域 */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>快速操作</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => dispatch(switchToAllImages())}
          >
            <Text style={styles.quickActionText}>查看所有图片</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => dispatch(switchToUserImages())}
          >
            <Text style={styles.quickActionText}>我的图片</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 分组信息 */}
      {groups.length > 0 && (
        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>图片分组</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.groupsList}>
              {groups.map((group) => (
                <TouchableOpacity key={group.id} style={styles.groupItem}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 最近图片 */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近图片</Text>
          {images.length > 6 && (
            <TouchableOpacity onPress={handleViewAllImages}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : recentImages.length > 0 ? (
          <ImageGridComponent
            images={recentImages}
            onImagePress={handleImagePress}
            numColumns={2}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>还没有图片</Text>
            <Text style={styles.emptyStateSubtext}>
              上传一些图片来开始使用照片库吧！
            </Text>
          </View>
        )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutText: {
    color: '#ffcdd2',
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
  },
  quickActionsSection: {
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  groupsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  groupsList: {
    flexDirection: 'row',
  },
  groupItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginRight: 15,
    width: 150,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
  },
  recentSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#2196F3',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
