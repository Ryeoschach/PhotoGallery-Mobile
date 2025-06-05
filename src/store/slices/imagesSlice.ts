/**
 * 图片状态管理
 * 处理图片列表、详情等相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ImagesState, Image, ApiError } from '../../types';
import { imagesApi } from '../../services/api';

// 初始状态
const initialState: ImagesState = {
  images: [],
  allImages: [],
  userImages: [],
  currentImage: null,
  isLoading: false,
  error: null,
};

// 异步action：获取图片列表
export const fetchImages = createAsyncThunk<
  Image[],
  { mine?: boolean } | void,
  { rejectValue: string }
>(
  'images/fetchImages',
  async (params, { rejectWithValue }) => {
    try {
      const mine = params?.mine;
      const response = await imagesApi.getImages(mine);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 异步action：获取图片详情
export const fetchImageById = createAsyncThunk<
  Image,
  number,
  { rejectValue: string }
>(
  'images/fetchImageById',
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await imagesApi.getImage(imageId);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 创建slice
const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    },
    // 清除当前图片
    clearCurrentImage: (state) => {
      state.currentImage = null;
    },
    // 设置当前图片（从列表中选择）
    setCurrentImage: (state, action) => {
      const image = state.images.find(img => img.id === action.payload);
      if (image) {
        state.currentImage = image;
      }
    },
    // 切换显示模式（显示所有图片或用户图片）
    switchToAllImages: (state) => {
      if (state.allImages.length > 0) {
        state.images = state.allImages;
      }
    },
    switchToUserImages: (state) => {
      if (state.userImages.length > 0) {
        state.images = state.userImages;
      }
    },
  },
  extraReducers: (builder) => {
    // 处理获取图片列表
    builder
      .addCase(fetchImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload;
        
        // 根据请求参数更新相应的缓存
        const isMineRequest = action.meta.arg?.mine;
        if (isMineRequest) {
          state.userImages = action.payload;
        } else {
          state.allImages = action.payload;
        }
        
        state.error = null;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '获取图片列表失败';
      });

    // 处理获取图片详情
    builder
      .addCase(fetchImageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentImage = action.payload;
        
        // 同时更新所有相关列表中的对应项
        const updateImageInList = (list: Image[]) => {
          const index = list.findIndex(img => img.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateImageInList(state.images);
        updateImageInList(state.allImages);
        updateImageInList(state.userImages);
        
        state.error = null;
      })
      .addCase(fetchImageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '获取图片详情失败';
      });
  },
});

// 导出actions
export const { 
  clearError, 
  clearCurrentImage, 
  setCurrentImage, 
  switchToAllImages, 
  switchToUserImages 
} = imagesSlice.actions;

// 导出reducer
export default imagesSlice.reducer;

// 选择器
export const selectImages = (state: { images: ImagesState }) => state.images.images;
export const selectAllImages = (state: { images: ImagesState }) => state.images.allImages;
export const selectUserImages = (state: { images: ImagesState }) => state.images.userImages;
export const selectCurrentImage = (state: { images: ImagesState }) => state.images.currentImage;
export const selectImagesLoading = (state: { images: ImagesState }) => state.images.isLoading;
export const selectImagesError = (state: { images: ImagesState }) => state.images.error;
