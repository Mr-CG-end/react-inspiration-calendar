import React, { useEffect, useState, useRef } from 'react';
import CalendarSVG from './CalendarSVG';
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils';
import { getLunarInfo } from '../utils/lunar';
import type { CalendarContent, CalendarProps } from '../types';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

const fallbackContent: CalendarContent = {
  activity: '日常',
  quote: '今天没有特别的安排，好好享受当下的宁静吧。',
  author: 'Coder Chen',
  source: 'Inspiration Calendar',
};

// 日期比较
const isSameLocalDate = (dateStr: string, targetDate: Date): boolean => {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  return formatLocalDate(parsed) === formatLocalDate(targetDate);
};

// 无日期处理
const getUndatedContentByDate = (items: CalendarContent[], date: Date): CalendarContent | null => {
  if (items.length === 0) return null;

  // 使用 UTC 绝对时间差来计算天数
  const utcCurrent = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcAnchor = Date.UTC(2026, 2, 26);
  const daysSinceAnchor = Math.floor((utcCurrent - utcAnchor) / 86_400_000);

  // 解决负数循环取模问题
  const index = ((daysSinceAnchor % items.length) + items.length) % items.length;
  return items[index];
};

// 总入口，静态内容解析
const resolveStaticContent = (
  // 索引访问类型
  content: CalendarProps['content'],
  date: Date,
): CalendarContent | null => {
  if (!content) return null;
  if (!Array.isArray(content)) return content;
  if (content.length === 0) return null;

  // 精确日期匹配优先
  const datedMatched = content.find((item) => isSameLocalDate(item.date || '', date));
  if (datedMatched) return datedMatched;

  // 无日期轮播
  const undatedContent = content.filter((item) => !item.date);
  return getUndatedContentByDate(undatedContent, date);
};

const Calendar: React.FC<CalendarProps> = ({
  date = new Date(),
  content,
  visible = true,
  className,
  fetchContent,
}) => {
  const rootClassName = ['w-full max-w-[24rem]', className].filter(Boolean).join(' ');
  // 用今日时间兜底
  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  // 格式化日期，无视具体时间
  const dateKey = formatLocalDate(safeDate);
  // 重建零点对象
  const normalizedDate = parseLocalDate(dateKey);

  const lunar = getLunarInfo(normalizedDate);
  const staticContent = resolveStaticContent(content, normalizedDate);
  const hasContentProp = content !== undefined;

  const [asyncState, setAsyncState] = useState<{
    status: AsyncStatus;
    content: CalendarContent | null;
  }>({
    status: 'idle',
    content: null,
  });
  const requestIdRef = useRef(0);

  const resolvedContent = hasContentProp
    ? (staticContent ?? fallbackContent)
    : (asyncState.content ?? fallbackContent);
  const isLoading = !hasContentProp && !!fetchContent && asyncState.status === 'loading';

  useEffect(() => {
    if (!visible) {
      setAsyncState({ status: 'idle', content: null });
      return;
    }

    if (hasContentProp) {
      setAsyncState({ status: 'idle', content: null });
      return;
    }

    if (!fetchContent) {
      setAsyncState({ status: 'idle', content: null });
      return;
    }

    const requestId = ++requestIdRef.current;
    setAsyncState({ status: 'loading', content: null });

    fetchContent(parseLocalDate(dateKey))
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setAsyncState({
          status: 'success',
          content: result ?? null,
        });
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setAsyncState({
          status: 'error',
          content: null,
        });
      });

    return () => {
      requestIdRef.current += 1;
    };
  }, [dateKey, hasContentProp, fetchContent, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className={rootClassName}>
      <CalendarSVG
        date={normalizedDate}
        lunar={lunar}
        content={resolvedContent}
        loading={isLoading}
      />
    </div>
  );
};

export default Calendar;
