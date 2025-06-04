/**
 * 分组状态管理
 * 处理图片分组相关状态
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GroupsState, Group, ApiError } from '../../types';
import { groupsApi } from '../../services/api';

// 初始状态
const initialState: GroupsState = {
  groups: [],
  isLoading: false,
  error: null,
};

// 异步action：获取分组列表
export const fetchGroups = createAsyncThunk<
  Group[],
  void,
  { rejectValue: string }
>(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupsApi.getGroups();
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 异步action：获取分组详情
export const fetchGroupById = createAsyncThunk<
  Group,
  number,
  { rejectValue: string }
>(
  'groups/fetchGroupById',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await groupsApi.getGroup(groupId);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message);
    }
  }
);

// 创建slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 处理获取分组列表
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '获取分组列表失败';
      });

    // 处理获取分组详情
    builder
      .addCase(fetchGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // 更新groups列表中的对应项
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        } else {
          // 如果不存在，添加到列表中
          state.groups.push(action.payload);
        }
        
        state.error = null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || '获取分组详情失败';
      });
  },
});

// 导出actions
export const { clearError } = groupsSlice.actions;

// 导出reducer
export default groupsSlice.reducer;

// 选择器
export const selectGroups = (state: { groups: GroupsState }) => state.groups.groups;
export const selectGroupsLoading = (state: { groups: GroupsState }) => state.groups.isLoading;
export const selectGroupsError = (state: { groups: GroupsState }) => state.groups.error;
export const selectGroupById = (state: { groups: GroupsState }, id: number) => 
  state.groups.groups.find(group => group.id === id);
