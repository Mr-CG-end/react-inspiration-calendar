# API 设计文档

## 导出总览

```typescript
// 组件
export { Calendar } from './components/Calendar';

// 工具函数
export { getLunarInfo } from './utils/lunar';

// 类型
export type { CalendarProps, CalendarContent, LunarInfo } from './types';
```

> CalendarSVG 为内部实现，不作为公开 API 导出。

---

## 核心组件：`<Calendar />`

封装了日期处理、数据获取、样式渲染和显隐控制。

### Props 定义

```typescript
interface CalendarProps {
  /**
   * 显示的日期
   * 不传则默认使用今天的日期
   */
  date?: Date;

  /**
   * 自定义内容数据（静态方式）
   * 传入一条内容对象，或多条内容的数组
   * 传入数组时，按 date 字段自动匹配当前日期；无匹配则使用默认备用内容
   */
  content?: CalendarContent | CalendarContent[];

  /**
   * 自定义内容数据（异步方式）
   * 传入一个函数，接收当前日期，返回 Promise<CalendarContent>
   * 当 content 和 fetchContent 都传入时，content 优先
   * 注意：传入的 date 为本地日期（非 UTC），详见下方"日期约定"章节
   */
  fetchContent?: (date: Date) => Promise<CalendarContent>;

  /**
   * 日历样式主题
   * - 'classic'：白底黑字中式排版（默认）
   * - 'dark'：深色背景 + 金色衬线字体
   * - 'minimalist'：浅色极简排版，大留白
   */
  theme?: 'classic' | 'dark' | 'minimalist';

  /**
   * 是否显示日历
   * 默认 true；设为 false 时不渲染 DOM（返回 null）
   */
  visible?: boolean;

  /**
   * 自定义 CSS 类名，应用到最外层容器
   */
  className?: string;
}
```

### 类型定义

```typescript
/** 日历卡片的文字内容 */
interface CalendarContent {
  /** 关联日期，用于多条数据时按日期匹配（格式 'YYYY-MM-DD'，基于本地时区） */
  date?: string;
  /** 活动文字，如 "宜独处" */
  activity?: string;
  /** 引言正文 */
  quote: string;
  /** 引言作者 */
  author: string;
  /** 引言出处 */
  source: string;
}

/** 农历信息 */
interface LunarInfo {
  /** 星期，如 "星期一" */
  weekday: string;
  /** 公历月份中文，如 "三月" */
  monthInWords: string;
  /** 农历月份，如 "二月" */
  lunarMonth: string;
  /** 农历日，如 "初三" */
  lunarDay: string;
}
```

---

## 日期约定

组件内部统一使用**本地时区**处理日期：

- `CalendarContent.date` 字段的 `YYYY-MM-DD` 匹配基于本地日期（`getFullYear()-getMonth()-getDate()`），而非 UTC
- `fetchContent(date)` 传入的 `date` 参数是本地日期对象
- 开发者在 `fetchContent` 中拼接 API 路径时，应使用本地日期格式化，避免 `toISOString()` 导致的 UTC 偏移问题

---

## 异步数据行为契约

当使用 `fetchContent` 时，组件的行为如下：

| 状态             | 渲染行为                                                 |
| ---------------- | -------------------------------------------------------- |
| **加载中**       | 显示日历骨架 + 加载指示器（spinner），日期和农历正常显示 |
| **成功**         | 正常渲染内容                                             |
| **失败**         | 显示默认备用内容，不抛异常                               |
| **日期快速切换** | 忽略过期请求的结果（竞态处理），只渲染最新日期的数据     |

---

## 使用示例

### 最简使用

```tsx
import { Calendar } from 'react-inspiration-calendar';
import 'react-inspiration-calendar/style.css';

function App() {
  return <Calendar />;
}
```

### 传入单条自定义内容

```tsx
<Calendar
  content={{
    activity: '宜读书',
    quote: '书犹药也，善读之可以医愚。',
    author: '刘向',
    source: '《说苑》',
  }}
/>
```

### 传入多条内容（按日期匹配）

```tsx
const contents = [
  {
    date: '2025-06-15',
    activity: '宜读书',
    quote: '...',
    author: '...',
    source: '...',
  },
  {
    date: '2025-06-16',
    activity: '宜散步',
    quote: '...',
    author: '...',
    source: '...',
  },
];

// 组件会自动匹配当前日期对应的内容
<Calendar content={contents} />;
```

### 通过异步函数获取内容

```tsx
/** 辅助函数：将 Date 格式化为本地日期字符串 YYYY-MM-DD */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function getContent(date: Date): Promise<CalendarContent> {
  // ⚠️ 不要使用 date.toISOString()，它会按 UTC 截断，跨时区可能偏移一天
  const res = await fetch(`/api/calendar/${toLocalDateString(date)}`);
  return res.json();
}

<Calendar fetchContent={getContent} />;
```

### 指定日期 + 显隐控制

```tsx
<Calendar
  // ✅ 使用 new Date(year, monthIndex, day) 构造本地日期
  // ❌ 避免 new Date('2025-06-15')——字符串形式按 UTC 解析，跨时区可能偏移一天
  date={new Date(2025, 5, 15)}
  visible={showCalendar}
/>
```

---

## 工具函数：`getLunarInfo(date)`

独立导出，用户可单独使用。

```typescript
function getLunarInfo(date: Date): LunarInfo;
```
