/**
 * 图片详情屏幕
 * 显示单张图片的详细信息
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchImageById, 
  selectCurrentImage, 
  selectImagesLoading, 
  selectImagesError,
  setCurrentImage,
} from '../store/slices/imagesSlice';
import { selectGroups } from '../store/slices/groupsSlice';
import { NavigationParamList } from '../types';
import { formatDate, formatFileSize, calculateFitSize } from '../utils';
import LoadingSpinner from '../components/LoadingSpinner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ImageDetailScreenNavigationProp = NativeStackNavigationProp<NavigationParamList, 'ImageDetail'>;
type ImageDetailScreenRouteProp = RouteProp<NavigationParamList, 'ImageDetail'>;

interface Props {
  navigation: ImageDetailScreenNavigationProp;
  route: ImageDetailScreenRouteProp;
}

const ImageDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { imageId } = route.params;
  
  const dispatch = useAppDispatch();
  const currentImage = useAppSelector(selectCurrentImage);
  const isLoading = useAppSelector(selectImagesLoading);
  const error = useAppSelector(selectImagesError);
  const groups = useAppSelector(selectGroups);

  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 组件挂载时加载图片详情
  useEffect(() => {
    loadImageDetail();
  }, [imageId]);

  // 处理错误
  useEffect(() => {
    if (error) {
      Alert.alert('错误', error);
    }
  }, [error]);

  // 加载图片详情
  const loadImageDetail = async () => {
    try {
      await dispatch(fetchImageById(imageId)).unwrap();
    } catch (error) {
      console.log('加载图片详情失败:', error);
    }
  };

  // 获取图片所属的分组名称
  const getGroupNames = (groupIds: number[]): string[] => {
    return groupIds
      .map(id => groups.find(group => group.id === id)?.name)
      .filter(Boolean) as string[];
  };

  // 计算适应屏幕的图片尺寸
  const getImageDisplaySize = () => {
    if (!currentImage) return { width: screenWidth, height: 200 };
    
    const maxWidth = screenWidth - 40;
    const maxHeight = screenHeight * 0.4;
    
    return calculateFitSize(
      currentImage.width,
      currentImage.height,
      maxWidth,
      maxHeight
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="加载图片详情中..." />
      </View>
    );
  }

  if (!currentImage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>图片未找到</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadImageDetail}
        >
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageSize = getImageDisplaySize();
  const groupNames = getGroupNames(currentImage.groups);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 图片显示区域 */}
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          onPress={() => setImageModalVisible(true)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: currentImage.image }}
            style={[styles.image, imageSize]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 图片信息 */}
      <View style={styles.infoContainer}>
        {/* 基本信息 */}
        <View style={styles.section}>
          <Text style={styles.imageName}>{currentImage.name}</Text>
          {currentImage.description && (
            <Text style={styles.imageDescription}>{currentImage.description}</Text>
          )}
        </View>

        {/* 详细信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细信息</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>尺寸:</Text>
            <Text style={styles.detailValue}>
              {currentImage.width} × {currentImage.height} 像素
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>文件大小:</Text>
            <Text style={styles.detailValue}>
              {formatFileSize(currentImage.size)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>上传者:</Text>
            <Text style={styles.detailValue}>{currentImage.owner_username}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>上传时间:</Text>
            <Text style={styles.detailValue}>
              {formatDate(currentImage.uploaded_at)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>更新时间:</Text>
            <Text style={styles.detailValue}>
              {formatDate(currentImage.updated_at)}
            </Text>
          </View>
        </View>

        {/* 分组信息 */}
        {groupNames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>所属分组</Text>
            <View style={styles.groupsContainer}>
              {groupNames.map((groupName, index) => (
                <View key={index} style={styles.groupTag}>
                  <Text style={styles.groupTagText}>{groupName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setImageModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>查看大图</Text>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  image: {
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  imageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  imageDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  groupTagText: {
    color: '#1976d2',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ImageDetailScreen;
