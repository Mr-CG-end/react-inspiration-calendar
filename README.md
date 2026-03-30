<div align="center">

# react-inspiration-calendar

一个可发布的 React 日历卡片组件，支持真实农历、自定义内容和三种内置主题。

[![npm version](https://img.shields.io/npm/v/@ort-fe/react-inspiration-calendar)](https://www.npmjs.com/package/@ort-fe/react-inspiration-calendar)
[![license](https://img.shields.io/npm/l/@ort-fe/react-inspiration-calendar)](./LICENSE)

<img src="https://raw.githubusercontent.com/yuanjingteam/react-inspiration-calendar/main/docs/assets/classic.png" width="30%" alt="Classic Theme" />
&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/yuanjingteam/react-inspiration-calendar/main/docs/assets/dark.png" width="30%" alt="Dark Theme" />
&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/yuanjingteam/react-inspiration-calendar/main/docs/assets/minimalist.png" width="30%" alt="Minimalist Theme" />

</div>

## 功能特性

- 支持 `classic`、`dark`、`minimalist` 三种主题
- 支持单条内容、按日期匹配的内容数组、异步 `fetchContent`
- 基于 `lunar-javascript` 提供真实农历信息
- 统一按本地日期处理，避免 `UTC` 带来的日期偏移
- 产物包含 `ESM + CJS + TypeScript` 类型声明
- 样式独立输出，通过 `style.css` 引入

## 安装

```bash
# 使用 pnpm 安装
pnpm add @ort-fe/react-inspiration-calendar
# 或使用 npm 安装
npm install @ort-fe/react-inspiration-calendar
```

> 本组件依赖 `react` 和 `react-dom`（peerDependencies，支持 v18/v19），如果项目中已安装则无需重复安装。

## 基础使用

```tsx
import { Calendar } from '@ort-fe/react-inspiration-calendar';
import '@ort-fe/react-inspiration-calendar/style.css';

export default function App() {
  return <Calendar />;
}
```

## 使用示例

### 传入单条静态内容

```tsx
import { Calendar, type CalendarContent } from '@ort-fe/react-inspiration-calendar';

const content: CalendarContent = {
  activity: '宜读书',
  quote: '书犹药也，善读之可以医愚。',
  author: '刘向',
  source: '说苑',
};

export default function App() {
  return <Calendar content={content} />;
}
```

### 传入内容数组并按日期匹配

```tsx
import { Calendar, type CalendarContent } from '@ort-fe/react-inspiration-calendar';

const contents: CalendarContent[] = [
  {
    date: '2025-06-15',
    activity: '宜读书',
    quote: '书山有路勤为径。',
    author: '韩愈',
    source: '劝学解',
  },
  {
    date: '2025-06-16',
    activity: '宜散步',
    quote: '行到水穷处，坐看云起时。',
    author: '王维',
    source: '终南别业',
  },
];

export default function App() {
  return <Calendar date={new Date(2025, 5, 16)} content={contents} />;
}
```

### 通过 `fetchContent` 异步获取内容

```tsx
import { Calendar, type CalendarContent } from '@ort-fe/react-inspiration-calendar';

const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fetchContent = async (date: Date): Promise<CalendarContent | null> => {
  const res = await fetch(`/api/calendar/${toLocalDateString(date)}`);
  if (!res.ok) return null;
  return res.json();
};

export default function App() {
  return <Calendar fetchContent={fetchContent} />;
}
```

> 当传入了 `content` 属性时（即使值为空数组），`fetchContent` 将不会被调用。仅在未传 `content` 时，组件才会通过 `fetchContent` 异步获取内容。

## 主题

```tsx
<Calendar theme="classic" />
<Calendar theme="dark" />
<Calendar theme="minimalist" />
```

| 主题值       | 说明                             |
| ------------ | -------------------------------- |
| `classic`    | 默认主题，白底黑字，中式衬线排版 |
| `dark`       | 深色背景，金色强调色             |
| `minimalist` | 浅色极简风格，大留白布局         |

### 字体增强

如果希望获得更精致的视觉效果，可以引入以下 Google Fonts：

```html
<!-- Dark 主题推荐 -->
<link
  href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
<!-- Minimalist 主题推荐 -->
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

组件会优先使用这些字体，无需修改任何代码。

## Props

### `CalendarProps`

| 参数           | 类型                                                            | 默认值       | 说明                                                            |
| -------------- | --------------------------------------------------------------- | ------------ | --------------------------------------------------------------- |
| `date`         | `Date`                                                          | `new Date()` | 当前展示日期。建议使用 `new Date(year, monthIndex, day)` 构造。 |
| `content`      | `CalendarContent \| CalendarContent[]`                          | -            | 静态内容。传数组时会根据 `date` 字段匹配当前日期。              |
| `fetchContent` | `(date: Date) => Promise<CalendarContent \| null \| undefined>` | -            | 异步获取内容。仅在未传 `content` 属性时生效。                   |
| `theme`        | `'classic' \| 'dark' \| 'minimalist'`                           | `'classic'`  | 切换卡片视觉主题。                                              |
| `visible`      | `boolean`                                                       | `true`       | 控制组件显隐。为 `false` 时直接返回 `null`。                    |
| `className`    | `string`                                                        | -            | 追加到最外层容器的自定义类名。                                  |

### `CalendarContent`

| 字段       | 类型     | 必填 | 说明                                                      |
| ---------- | -------- | ---- | --------------------------------------------------------- |
| `date`     | `string` | 否   | 内容对应日期，格式为 `YYYY-MM-DD`。传内容数组时用于匹配。 |
| `activity` | `string` | 否   | 日期主标题，如“宜读书”。                                  |
| `quote`    | `string` | 是   | 主体文案。                                                |
| `author`   | `string` | 是   | 文案作者。                                                |
| `source`   | `string` | 是   | 文案来源。                                                |

### `LunarInfo`

由 `getLunarInfo(date)` 返回，包含以下字段：

| 字段           | 类型     | 说明                    |
| -------------- | -------- | ----------------------- |
| `weekday`      | `string` | 星期文本，如 `星期一`   |
| `monthInWords` | `string` | 公历月份中文，如 `三月` |
| `lunarMonth`   | `string` | 农历月份，如 `二月`     |
| `lunarDay`     | `string` | 农历日期，如 `初三`     |

## 日期处理约定

组件内部统一按本地日期处理。

- 推荐：`new Date(2025, 5, 15)`
- 不推荐：`new Date('2025-06-15')`
- 不推荐直接使用 `date.toISOString()` 拼接每日内容接口

这样可以避免 `UTC` 转换导致的前后一天偏移问题。

## 工具函数

除了组件本身，还导出了 `getLunarInfo`：

```tsx
import { getLunarInfo } from '@ort-fe/react-inspiration-calendar';

const info = getLunarInfo(new Date());
console.log(info.lunarMonth, info.lunarDay, info.weekday);
```

## 导出路径

| 路径                                           | 说明           |
| ---------------------------------------------- | -------------- |
| `@ort-fe/react-inspiration-calendar`           | 组件与类型导出 |
| `@ort-fe/react-inspiration-calendar/style.css` | 组件样式文件   |
