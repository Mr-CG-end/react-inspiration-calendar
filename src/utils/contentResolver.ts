import type { CalendarContent, CalendarProps } from '../types';
import { formatLocalDate, parseLocalDate } from './dateUtils';

// 以此日为"第 0 天"，按天数差值对内容数组取模，保证同一日期每次都展示同一条。
const CONTENT_ROTATION_ANCHOR_UTC = Date.UTC(2026, 2, 26);

export function isSameLocalDate(dateStr: string, targetDate: Date): boolean {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;

  return formatLocalDate(parsed) === formatLocalDate(targetDate);
}

export function getUndatedContentByDate(
  items: CalendarContent[],
  date: Date,
): CalendarContent | null {
  if (items.length === 0) return null;

  const utcCurrent = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceAnchor = Math.floor((utcCurrent - CONTENT_ROTATION_ANCHOR_UTC) / 86_400_000);
  const index = ((daysSinceAnchor % items.length) + items.length) % items.length;

  return items[index];
}

export function resolveStaticContent(
  content: CalendarProps['content'],
  date: Date,
): CalendarContent | null {
  if (!content) return null;
  if (!Array.isArray(content)) return content;
  if (content.length === 0) return null;

  const datedMatched = content.find((item) => isSameLocalDate(item.date || '', date));
  if (datedMatched) return datedMatched;

  const undatedContent = content.filter((item) => !item.date);
  return getUndatedContentByDate(undatedContent, date);
}
