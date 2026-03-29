import React from 'react';
import { ThemeComponentProps } from '../../types';
import ClassicCalendar from './ClassicCalendar';
import DarkCalendar from './DarkCalendar';
import MinimalistCalendar from './MinimalistCalendar';

export type ThemeName = 'classic' | 'dark' | 'minimalist';

/**
 * 主题注册表：theme 字符串 → 对应的主题组件
 * 新增主题时只需在此处注册，Calendar.tsx 无需改动
 */
export const themeRegistry: Record<ThemeName, React.FC<ThemeComponentProps>> = {
  classic: ClassicCalendar,
  dark: DarkCalendar,
  minimalist: MinimalistCalendar,
};
