
/**
 * 简化的农历数据助手。
 * 注意：在生产环境中，请使用 lunar-javascript 等库。
 * 本演示仅为展示美观，提供了固定日期的映射。
 */

const MONTHS_CN = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WEEKDAYS_CN = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

export const getLunarInfo = (date: Date) => {
  const month = date.getMonth();
  const weekday = date.getDay();

  // 为美观起见，我们在此模拟特定的农历日期字符串
  // 在实际应用中，请使用：solar.getLunar()
  return {
    monthInWords: MONTHS_CN[month],
    weekday: WEEKDAYS_CN[weekday],
    lunarMonth: "腊月", // 模拟数据
    lunarDay: "初三",   // 模拟数据
  };
};