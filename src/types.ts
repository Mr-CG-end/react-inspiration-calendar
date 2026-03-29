/** 日历卡片的文字内容 */
export interface CalendarContent {
  date?: string;
  activity?: string;
  quote: string;
  author: string;
  source: string;
}

/** 农历信息 */
export interface LunarInfo {
  weekday: string;
  monthInWords: string;
  lunarMonth: string;
  lunarDay: string;
}

/** Calendar 组件 Props */
export interface CalendarProps {
  date?: Date;
  content?: CalendarContent | CalendarContent[];
  // 方便降级,就是使用结果的优先级
  fetchContent?: (date: Date) => Promise<CalendarContent | null | undefined>;
  theme?: 'classic' | 'dark' | 'minimalist';
  visible?: boolean;
  className?: string; // 自定义外层 className
}

/** 主题组件公共 Props（所有主题接收相同数据，仅视觉不同） */
export interface ThemeComponentProps {
  date: Date;
  lunar: LunarInfo;
  content: CalendarContent;
  loading: boolean;
}
