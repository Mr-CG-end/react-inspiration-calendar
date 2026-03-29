import { Solar } from 'lunar-javascript';
import type { LunarInfo } from '../types';
import { formatLocalDate, parseLocalDate } from './dateUtils.ts';

const GREGORIAN_MONTHS_CN = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

const WEEKDAYS_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const lunarInfoCache = new Map<string, LunarInfo>();

function normalizeLocalDate(date: Date): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return new Date();
  }

  const dateKey = formatLocalDate(date);
  return parseLocalDate(dateKey);
}

export function getLunarInfo(date: Date): LunarInfo {
  const normalizedDate = normalizeLocalDate(date);
  const cacheKey = formatLocalDate(normalizedDate);
  const cached = lunarInfoCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const solar = Solar.fromYmd(
    normalizedDate.getFullYear(),
    // 0-11
    normalizedDate.getMonth() + 1,
    normalizedDate.getDate(),
  );
  // 转换为农历
  const lunar = solar.getLunar();

  const result: LunarInfo = {
    monthInWords: GREGORIAN_MONTHS_CN[normalizedDate.getMonth()],
    weekday: WEEKDAYS_CN[normalizedDate.getDay()],
    lunarMonth: `${lunar.getMonthInChinese()}月`,
    lunarDay: lunar.getDayInChinese(),
  };

  lunarInfoCache.set(cacheKey, result);
  return result;
}
