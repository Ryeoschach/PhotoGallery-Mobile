/**
 * 画廊屏幕
 * 显示所有图片的网格视图
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchImages, 
  selectImages, 
  selectImagesLoading, 
  selectImagesError 
} from '../store/slices/imagesSlice';
import { NavigationParamList } from '../types';
import ImageGridComponent from '../components/ImageGrid';
import LoadingSpinner from '../components/LoadingSpinner';

type GalleryScreenNavigationProp = NativeStackNavigationProp<NavigationParamList, 'Gallery'>;

interface Props {
  navigation: GalleryScreenNavigationProp;
}

const GalleryScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const images = useAppSelector(selectImages);
  const isLoading = useAppSelector(selectImagesLoading);
  const error = useAppSelector(selectImagesError);

  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');

  // 组件挂载时加载数据
  useEffect(() => {
    loadImages();
  }, [filterMode]);

  // 处理错误
  useEffect(() => {
    if (error) {
      Alert.alert('错误', error);
    }
  }, [error]);

  // 加载图片
  const loadImages = async () => {
    try {
      const params = filterMode === 'mine' ? { mine: true } : undefined;
      await dispatch(fetchImages(params)).unwrap();
    } catch (error) {
      console.log('加载图片失败:', error);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadImages();
  };

  // 导航到图片详情
  const handleImagePress = (imageId: number) => {
    navigation.navigate('ImageDetail', { imageId });
  };

  // 切换过滤模式
  const toggleFilterMode = () => {
    setFilterMode(filterMode === 'all' ? 'mine' : 'all');
  };

  // 设置导航头部
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleFilterMode} style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {filterMode === 'all' ? '我的图片' : '所有图片'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, filterMode]);

  if (isLoading && images.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="加载图片中..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          共 {images.length} 张图片
          {filterMode === 'mine' && ' (我的图片)'}
        </Text>
      </View>

      {/* 图片网格 */}
      <ImageGridComponent
        images={images}
        onImagePress={handleImagePress}
        numColumns={2}
        showDetails={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterButton: {
    marginRight: 15,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default GalleryScreen;
