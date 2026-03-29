// 声明 lunar-javascript 库的类型

declare module 'lunar-javascript' {
  export interface LunarDateLike {
    getMonthInChinese(): string;
    getDayInChinese(): string;
  }

  export interface SolarDateLike {
    getLunar(): LunarDateLike;
  }

  export const Solar: {
    fromYmd(year: number, month: number, day: number): SolarDateLike;
  };
}
