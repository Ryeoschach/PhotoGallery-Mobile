/**
 * Redux hooks
 * 提供类型安全的Redux hooks
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// 类型化的useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// 类型化的useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
