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
  // 可传入任意样式，覆盖默认的自适应样式，响应式宽度，最大宽度24rem
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

当使用 `fetchContent` 时，组件针对网络请求及特殊场景的响应行为如下：

| 请求状态   | 渲染行为                                                 |
| ---------- | -------------------------------------------------------- |
| **加载中** | 显示日历骨架（带呼吸动画），原有的日期和农历信息正常显示 |
| **成功**   | 正常渲染接口返回的内容                                   |
| **失败**   | 降级显示默认的备用内容（不抛异常阻塞渲染）               |

**【并发请求控制（竞态处理）】**
当发生**日期快速切换**时：组件内部会基于闭包的请求 ID 进行校验，自动忽略过期的旧请求结果，确保仅渲染最后一次最新日期请求的数据，防止内容与日期对不上。

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

独立导出，用户可单独使用。基于 `lunar-javascript` 库，将公历日期转换为农历信息，并包含星期和公历月份的中文描述。

### 函数签名

```typescript
function getLunarInfo(date: Date): LunarInfo;
```

### 参数

| 参数   | 类型   | 说明                                                                                                       |
| ------ | ------ | ---------------------------------------------------------------------------------------------------------- |
| `date` | `Date` | 要查询的日期。传入无效日期时，自动降级为当天。内部会将时间归零（取本地日期的零点），避免时区偏移影响结果。 |

### 返回值

返回一个 `LunarInfo` 对象，字段如下：

| 字段           | 类型     | 示例值     | 说明                 |
| -------------- | -------- | ---------- | -------------------- |
| `monthInWords` | `string` | `'三月'`   | 公历月份的中文名称   |
| `weekday`      | `string` | `'星期六'` | 星期的中文名称       |
| `lunarMonth`   | `string` | `'二月'`   | 农历月份（含"月"字） |
| `lunarDay`     | `string` | `'初三'`   | 农历日期             |

### 注意事项

- **本地时区**：函数内部统一基于本地日期（`getFullYear/getMonth/getDate`）计算，不受 UTC 偏移影响。
- **结果缓存**：相同日期的计算结果会被缓存，重复调用无性能损耗。
- **无效日期兜底**：传入 `NaN`、非 `Date` 对象等无效值时，自动回退到当天日期，不抛异常。

### 使用示例

```typescript
import { getLunarInfo } from 'react-inspiration-calendar';

// 查询今天的农历信息
const info = getLunarInfo(new Date());
console.log(info.lunarMonth); // 例如：'二月'
console.log(info.lunarDay); // 例如：'初三'
console.log(info.weekday); // 例如：'星期六'
console.log(info.monthInWords); // 例如：'三月'

// 查询指定日期
// ✅ 推荐：使用 new Date(year, monthIndex, day) 构造本地日期
const specificDate = new Date(2025, 5, 15); // 2025 年 6 月 15 日
const specificInfo = getLunarInfo(specificDate);
console.log(`${specificInfo.lunarMonth}${specificInfo.lunarDay}`); // 例如：'五月廿一'
```

```tsx
// 在 React 组件中独立使用
import { getLunarInfo } from 'react-inspiration-calendar';

function LunarBadge({ date }: { date: Date }) {
  const { lunarMonth, lunarDay } = getLunarInfo(date);
  return (
    <span>
      {lunarMonth}
      {lunarDay}
    </span>
  );
}
```
