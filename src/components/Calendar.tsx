import React from 'react';
import CalendarSVG from './CalendarSVG';
import { formatLocalDate } from '../utils/dateUtils';
import { getLunarInfo } from '../utils/lunar';
import type { CalendarContent, CalendarProps } from '../types';

const fallbackContent: CalendarContent = {
  activity: '日常',
  quote: '今天没有特别的安排，好好享受当下的宁静吧。',
  author: '辰同学',
  source: 'Inspiration Calendar',
};

const resolveContent = (content: CalendarProps['content'], date: Date): CalendarContent => {
  if (!content) {
    return fallbackContent;
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      return fallbackContent;
    }

    const targetDate = formatLocalDate(date);
    const matched = content.find((item) => item.date === targetDate);
    if (matched) {
      return matched;
    }

    const undatedContent = content.filter((item) => !item.date);
    if (undatedContent.length > 0) {
      // 使用 UTC 绝对时间差来计算天数，看不懂，但很有用
      const utcCurrent = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      const utcAnchor = Date.UTC(2026, 2, 26);
      const daysSinceAnchor = Math.floor((utcCurrent - utcAnchor) / 86_400_000);
      // 解决复数循环，可以往回查日期，非常安全嘞
      const index =
        ((daysSinceAnchor % undatedContent.length) + undatedContent.length) % undatedContent.length;

      return undatedContent[index];
    }

    return fallbackContent;
  }

  return content;
};

const Calendar: React.FC<CalendarProps> = ({
  date = new Date(),
  content,
  visible = true,
  className,
}) => {
  if (!visible) {
    return null;
  }

  const lunar = getLunarInfo(date);
  const resolvedContent = resolveContent(content, date);

  return (
    <div className={className}>
      <CalendarSVG date={date} lunar={lunar} content={resolvedContent} />
    </div>
  );
};

export default Calendar;
