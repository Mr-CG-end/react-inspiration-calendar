/**
 * 解析本地日期字符串（YYYY-MM-DD），避免 new Date('YYYY-MM-DD') 的 UTC 时区陷阱。
 * @param dateStr 格式为 YYYY-MM-DD 的日期字符串
 * @returns 代表本地该日零点的 Date 对象，如果解析失败返回 null
 */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return null;
  }

  // 只接受严格的 YYYY-MM-DD，避免 parseInt 吞掉脏字符或宽松位数。
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS 的 Date 月份从 0 开始
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month, day);
      // 防止 JS 引擎将 2月30日 自动纠转为 3月2日
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }

  return null;
}

/**
 * 将本地 Date 对象格式化为 YYYY-MM-DD 字符串
 * @param date Date 对象
 * @returns YYYY-MM-DD 格式的字符串
 */
export function formatLocalDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
