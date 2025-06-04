/**
 * 图片网格组件
 * 用于显示图片列表的网格布局
 */

import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image as ImageType } from '../types';
import { formatDate, formatFileSize } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  images: ImageType[];
  onImagePress: (imageId: number) => void;
  numColumns?: number;
  showDetails?: boolean;
}

const ImageGridComponent: React.FC<Props> = ({
  images,
  onImagePress,
  numColumns = 2,
  showDetails = true,
}) => {
  const imageWidth = (screenWidth - 40 - (numColumns - 1) * 20) / numColumns; // 增加间距从10到20

  const renderImageItem = ({ item }: { item: ImageType }) => (
    <TouchableOpacity
      style={[styles.imageItem, { width: imageWidth }]}
      onPress={() => onImagePress(item.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={[styles.image, { width: imageWidth, height: imageWidth }]}
        resizeMode="cover"
      />
      {showDetails && (
        <View style={styles.imageInfo}>
          <Text style={styles.imageName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.imageDetails}>
            <Text style={styles.imageSize}>
              {formatFileSize(item.size)}
            </Text>
            <Text style={styles.imageDimensions}>
              {item.width}×{item.height}
            </Text>
          </View>
          <Text style={styles.imageDate}>
            {formatDate(item.uploaded_at)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>暂无图片</Text>
    </View>
  );

  return (
    <FlatList
      data={images}
      renderItem={renderImageItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyState}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20, // 增加行间距从15到20
  },
  imageItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3, // 保留 elevation 用于 Android
    marginBottom: 20, // 增加底部间距从15到20
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageInfo: {
    padding: 12,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  imageSize: {
    fontSize: 12,
    color: '#666',
  },
  imageDimensions: {
    fontSize: 12,
    color: '#666',
  },
  imageDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ImageGridComponent;
