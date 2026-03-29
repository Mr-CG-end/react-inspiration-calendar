import { describe, expect, it } from 'vitest';

import type { CalendarContent } from '../src/types';
import {
  getUndatedContentByDate,
  isSameLocalDate,
  resolveStaticContent,
} from '../src/utils/contentResolver';

function createContent(quote: string, overrides: Partial<CalendarContent> = {}): CalendarContent {
  return {
    quote,
    author: `${quote} 作者`,
    source: `${quote} 来源`,
    ...overrides,
  };
}

describe('isSameLocalDate', () => {
  it('能匹配同一本地自然日', () => {
    expect(isSameLocalDate('2026-03-28', new Date(2026, 2, 28, 23, 59, 59))).toBe(true);
  });

  it('遇到非法日期字符串时返回 false', () => {
    expect(isSameLocalDate('2026-03-28abc', new Date(2026, 2, 28))).toBe(false);
  });
});

describe('getUndatedContentByDate', () => {
  const items = [createContent('A'), createContent('B'), createContent('C')];

  it('会随着日期按天轮播无日期内容，在锚点日返回第一条无日期内容', () => {
    expect(getUndatedContentByDate(items, new Date(2026, 2, 26))?.quote).toBe('A');
    expect(getUndatedContentByDate(items, new Date(2026, 2, 27))?.quote).toBe('B');
    expect(getUndatedContentByDate(items, new Date(2026, 2, 28))?.quote).toBe('C');
  });

  it('在锚点前的日期也能正确循环到末尾', () => {
    expect(getUndatedContentByDate(items, new Date(2026, 2, 25))?.quote).toBe('C');
  });

  it('空数组时返回 null', () => {
    expect(getUndatedContentByDate([], new Date(2026, 2, 26))).toBeNull();
  });
});

describe('resolveStaticContent', () => {
  it('content 为空时返回 null', () => {
    expect(resolveStaticContent(undefined, new Date(2026, 2, 28))).toBeNull();
    expect(resolveStaticContent([], new Date(2026, 2, 28))).toBeNull();
  });

  it('单个内容对象时直接返回该对象', () => {
    const single = createContent('单条内容');

    expect(resolveStaticContent(single, new Date(2026, 2, 28))).toEqual(single);
  });

  it('会优先返回精确日期匹配项', () => {
    const dated = createContent('日期命中', { date: '2026-03-28' });
    const undated = createContent('轮播内容');

    expect(resolveStaticContent([undated, dated], new Date(2026, 2, 28))?.quote).toBe('日期命中');
  });

  it('遇到无效日期项时会忽略并回退到无日期内容', () => {
    const invalidDated = createContent('无效日期内容', { date: '2026-03-28abc' });
    const undated = createContent('回退内容');

    expect(resolveStaticContent([invalidDated, undated], new Date(2026, 2, 28))?.quote).toBe(
      '回退内容',
    );
  });

  it('没有精确匹配时会按无日期内容轮播', () => {
    const items = [createContent('A'), createContent('B')];

    expect(resolveStaticContent(items, new Date(2026, 2, 26))?.quote).toBe('A');
    expect(resolveStaticContent(items, new Date(2026, 2, 27))?.quote).toBe('B');
  });
});
