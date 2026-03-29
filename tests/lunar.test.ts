import { describe, expect, it } from 'vitest';

import { getLunarInfo } from '../src/utils/lunar.ts';

const cases = [
  {
    name: '2024 年春节前一天',
    date: new Date(2024, 1, 9),
    expected: {
      monthInWords: '\u4e8c\u6708',
      weekday: '\u661f\u671f\u4e94',
      lunarMonth: '\u814a\u6708',
      lunarDay: '\u4e09\u5341',
    },
  },
  {
    name: '2024 年春节当天',
    date: new Date(2024, 1, 10),
    expected: {
      monthInWords: '\u4e8c\u6708',
      weekday: '\u661f\u671f\u516d',
      lunarMonth: '\u6b63\u6708',
      lunarDay: '\u521d\u4e00',
    },
  },
  {
    name: '2024 年春节后一天',
    date: new Date(2024, 1, 11),
    expected: {
      monthInWords: '\u4e8c\u6708',
      weekday: '\u661f\u671f\u65e5',
      lunarMonth: '\u6b63\u6708',
      lunarDay: '\u521d\u4e8c',
    },
  },
  {
    name: '2024 年中秋节',
    date: new Date(2024, 8, 17),
    expected: {
      monthInWords: '\u4e5d\u6708',
      weekday: '\u661f\u671f\u4e8c',
      lunarMonth: '\u516b\u6708',
      lunarDay: '\u5341\u4e94',
    },
  },
  {
    name: '闰月初一',
    date: new Date(2020, 4, 23),
    expected: {
      monthInWords: '\u4e94\u6708',
      weekday: '\u661f\u671f\u516d',
      lunarMonth: '\u95f0\u56db\u6708',
      lunarDay: '\u521d\u4e00',
    },
  },
  {
    name: '普通日期样例',
    date: new Date(2026, 2, 28),
    expected: {
      monthInWords: '\u4e09\u6708',
      weekday: '\u661f\u671f\u516d',
      lunarMonth: '\u4e8c\u6708',
      lunarDay: '\u521d\u5341',
    },
  },
  {
    name: '公历年末边界',
    date: new Date(2024, 11, 31),
    expected: {
      monthInWords: '\u5341\u4e8c\u6708',
      weekday: '\u661f\u671f\u4e8c',
      lunarMonth: '\u814a\u6708',
      lunarDay: '\u521d\u4e00',
    },
  },
  {
    name: '公历新年边界',
    date: new Date(2025, 0, 1),
    expected: {
      monthInWords: '\u4e00\u6708',
      weekday: '\u661f\u671f\u4e09',
      lunarMonth: '\u814a\u6708',
      lunarDay: '\u521d\u4e8c',
    },
  },
];

describe('getLunarInfo', () => {
  it.each(cases)('能返回正确的农历信息：$name', ({ date, expected }) => {
    expect(getLunarInfo(date)).toEqual(expected);
  });

  it('同一本地自然日的不同时刻应返回相同结果', () => {
    const early = getLunarInfo(new Date(2026, 2, 28, 0, 1, 0));
    const late = getLunarInfo(new Date(2026, 2, 28, 23, 59, 59));

    expect(early).toEqual(late);
  });

  it('输入无效日期时应回退到今天', () => {
    const todayInfo = getLunarInfo(new Date());
    const invalidDateInfo = getLunarInfo(new Date(Number.NaN));

    expect(invalidDateInfo).toEqual(todayInfo);
  });
});
