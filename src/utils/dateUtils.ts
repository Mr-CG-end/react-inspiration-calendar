/**
 * 解析本地日期字符串（YYYY-MM-DD），避免 new Date('YYYY-MM-DD') 的 UTC 时区陷阱。
 * @param dateStr 格式为 YYYY-MM-DD 的日期字符串
 * @returns 代表本地该日零点的 Date 对象，如果解析失败返回当前时间
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date();
  }
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS 的 Date 月份从 0 开始
    const day = parseInt(parts[2], 10);
    
    // 拦截 NaN 的情况
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // 使用数字参数形式，引擎会强制按本地时区生成时间
      return new Date(year, month, day);
    }
  }
  
  // 格式不对兜底返回当前本地时间
  return new Date();
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
