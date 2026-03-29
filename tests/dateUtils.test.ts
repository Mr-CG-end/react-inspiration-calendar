import { describe, expect, it } from 'vitest';

import { formatLocalDate, parseLocalDate } from '../src/utils/dateUtils.ts';

describe('parseLocalDate', () => {
  it('能将 YYYY-MM-DD 字符串解析为本地零点的 Date', () => {
    const result = parseLocalDate('2025-03-29');
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(29);
    expect(result?.getHours()).toBe(0);
    expect(result?.getMinutes()).toBe(0);
    expect(result?.getSeconds()).toBe(0);
  });

  it('会拒绝不可能存在的日期', () => {
    expect(parseLocalDate('2025-02-29')).toBeNull();
    expect(parseLocalDate('2025-13-01')).toBeNull();
    expect(parseLocalDate('')).toBeNull();
  });

  it('格式不规范会返回null', () => {
    expect(parseLocalDate('2025-03-29abc')).toBeNull();
    expect(parseLocalDate('2025-03-2')).toBeNull();
  });
});

describe('formatLocalDate', () => {
  it('能将本地 Date 格式化为 YYYY-MM-DD', () => {
    const result = formatLocalDate(new Date(2025, 2, 9, 22, 45, 0));
    expect(result).toBe('2025-03-09');
  });

  it('遇到非 Date 类型输入返回空字符串', () => {
    expect(formatLocalDate(null as unknown as Date)).toBe('');
    expect(formatLocalDate(undefined as unknown as Date)).toBe('');
    expect(formatLocalDate('2025-03-09' as unknown as Date)).toBe('');
    expect(formatLocalDate(123 as unknown as Date)).toBe('');
    expect(formatLocalDate([] as unknown as Date)).toBe('');
    expect(formatLocalDate({} as unknown as Date)).toBe('');
  });

  it('遇到无效 Date 时会返回空字符串', () => {
    expect(formatLocalDate(new Date(Number.NaN))).toBe('');
  });
});
