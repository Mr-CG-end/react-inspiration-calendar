import React, { useEffect, useState, useRef } from 'react';
import { themeRegistry } from './themes';
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils';
import { getLunarInfo } from '../utils/lunar';
import { resolveStaticContent } from '../utils/contentResolver';
import type { CalendarContent, CalendarProps } from '../types';
import styles from '../styles/base.module.css';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

const fallbackContent: CalendarContent = {
  activity: '日常',
  quote: '今天没有特别的安排，好好享受当下的宁静吧。',
  author: 'Coder Chen',
  source: 'Inspiration Calendar',
};

const Calendar: React.FC<CalendarProps> = ({
  date = new Date(),
  content,
  visible = true,
  className,
  fetchContent,
  theme = 'classic',
}) => {
  const rootClassName = [styles.wrapper, className].filter(Boolean).join(' ');
  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const dateKey = formatLocalDate(safeDate);
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

  // 从注册表中取出对应主题组件，非法 theme 值降级到 classic
  const ThemeComponent = themeRegistry[theme] ?? themeRegistry.classic;

  return (
    <div className={rootClassName}>
      <ThemeComponent
        date={normalizedDate}
        lunar={lunar}
        content={resolvedContent}
        loading={isLoading}
      />
    </div>
  );
};

export default Calendar;
