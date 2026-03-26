# 架构设计文档

## 目录结构

```
react-inspiration-calendar/
├── src/                          # 库的源码
│   ├── index.ts                  # 统一导出入口（只导出 Calendar + 工具 + 类型）
│   ├── components/
│   │   ├── Calendar.tsx          # 主组件（数据管理 + 调度）
│   │   ├── CalendarSVG.tsx       # SVG 渲染（内部组件，不对外导出）
│   │   └── themes/
│   │       ├── ClassicCalendar.tsx   # classic 主题渲染
│   │       ├── DarkCalendar.tsx      # dark 主题渲染
│   │       ├── MinimalistCalendar.tsx # minimalist 主题渲染
│   │       └── index.ts             # 主题注册表
│   ├── utils/
│   │   └── lunar.ts              # 真实农历计算（基于 lunar-javascript）
│   ├── styles/
│   │   ├── base.module.css       # 公共基础样式
│   │   ├── classic.module.css    # classic 主题样式
│   │   ├── dark.module.css       # dark 主题样式
│   │   └── minimalist.module.css # minimalist 主题样式
│   └── types.ts                  # 所有类型定义
├── demo/                         # 本地演示应用（不发布到 npm）
│   ├── index.html
│   ├── main.tsx
│   └── DemoApp.tsx
├── dist/                         # 构建产物（git ignore）
├── docs/                         # 项目文档
├── package.json
├── vite.config.ts                # Library Mode 构建配置（仅用于 pnpm build）
├── vite.demo.config.ts           # Demo 开发服务器配置（以 demo/index.html 为入口）
├── tsconfig.json                 # 库的 TS 配置
└── tsconfig.demo.json            # 演示应用的 TS 配置（可选）
```

---

## 模块职责

### `Calendar.tsx` — 主组件

职责：接收所有 Props，处理数据获取逻辑（含竞态处理：忽略过期请求结果），选择并渲染对应主题组件。

```
Props 输入 → 日期处理 → 内容解析（按 date 匹配 / 异步获取）→ 农历计算 → 主题选择 → 渲染
```

**不做的事**：不负责具体的 UI 渲染，只做"调度"。

### `themes/ClassicCalendar.tsx` — 主题组件

职责：接收标准化的数据，负责具体的 SVG 渲染。所有主题统一使用 SVG（viewBox 600×900）进行渲染，不使用 DOM 方案。

**来源**：从现有的 `CalendarSVG.tsx` 改造而来。

### `themes/index.ts` — 主题注册表（P3 实现）

职责：维护主题名称到组件的映射，便于扩展。

> **注意**：P1/P2 阶段暂硬编码 classic 主题渲染，不引入注册表。注册表在 P3 统一实现。

```typescript
const themes = {
  classic: ClassicCalendar,
  dark: DarkCalendar,
  minimalist: MinimalistCalendar,
};
```

### `utils/lunar.ts` — 农历工具

职责：封装 `lunar-javascript` 库，对外提供 `getLunarInfo(date)` 接口。

---

## 模块边界与放置规则

本节用于约束项目代码应该放在哪里，以及不同模块之间允许怎样的依赖关系。

这些规则既适用于人工开发，也适用于 AI 修改代码时的默认约束。

### 放置规则

#### `src/index.ts`

- 作为唯一公共导出入口
- 只导出面向使用方的组件、工具函数和类型
- 不导出内部实现细节，如主题注册表内部工具、演示代码、临时辅助函数

#### `src/components/`

- 放可复用的 React 组件
- 允许包含“容器组件”和“纯展示组件”
- 不放与 npm 包无关的 demo 页面逻辑
- 组件内部尽量不直接耦合构建配置、外部 API 实现细节或调试代码

#### `src/components/themes/`

- 放主题渲染组件和主题注册表
- 每个主题组件只负责视觉渲染和少量展示层转换
- 不在主题组件中处理异步请求、竞态控制、导出管理

#### `src/utils/`

- 放纯函数、日期处理、格式化、数据转换等可复用工具
- 默认不依赖 React
- 优先保持无副作用、可单测

#### `src/styles/`

- 放库内部拥有的样式文件
- 公共样式放 `base.module.css`
- 主题专属样式放各自的 `*.module.css`
- 不放宿主应用特定样式，不依赖宿主项目的 Tailwind 配置

#### `src/types.ts`

- 放公共类型、跨模块共享的接口和对外暴露的类型定义
- 若后续类型显著增多，可拆为 `src/types/` 目录；拆分后仍应保持公共类型入口清晰
- 仅被单个文件使用、且明显属于局部实现细节的类型，可保留在文件内，不必机械集中

#### `demo/`

- 只放本地演示应用相关代码
- 可以依赖库代码
- 不能反向被 `src/` 中的库代码依赖

### 依赖方向

默认依赖方向如下：

```text
demo ───────► src/index.ts
                │
                ├──► components/
                │       └──► components/themes/
                ├──► utils/
                ├──► styles/
                └──► types.ts
```

进一步约束：

- `src/index.ts` 可以依赖 `components/`、`utils/`、`types.ts`，但不依赖 `demo/`
- `components/` 可以依赖 `utils/`、`styles/`、`types.ts`
- `components/themes/` 可以依赖 `styles/`、`types.ts`，必要时可依赖少量展示层工具，但不反向依赖主组件
- `utils/` 不依赖 `components/`、`demo/`
- `styles/` 不作为逻辑依赖目标，只提供样式资源
- `demo/` 可以依赖任何库公开入口，但库代码不能依赖 `demo/`

禁止的依赖包括：

- 从 `src/` 反向导入 `demo/`
- 组件与工具函数之间的循环依赖
- 主题组件反向依赖主组件实现细节
- 公开 API 直接暴露仅供内部使用的文件路径

### 文件拆分规则

以下情况应优先考虑拆文件，而不是继续堆在同一个模块里：

- 一个文件同时承担“数据获取 + 状态编排 + 视觉渲染”三类职责
- 一个组件内包含两个以上可独立理解的渲染区块
- 一个工具文件开始混入 React、DOM 或样式依赖
- 类型定义已经影响可读性，开始淹没主体逻辑
- 为复用而出现复制粘贴

### 目录与命名约定

- 组件文件使用 `PascalCase.tsx`
- 工具文件使用 `camelCase.ts`
- 样式文件使用 `*.module.css`
- 主题组件命名与主题名一致，如 `ClassicCalendar.tsx`
- 避免创建含糊目录，如 `helpers/`、`common/`、`misc/`；只有当职责明确时才新增目录

### 代码风格约定

- 函数统一优先使用箭头函数，包括 React 组件、工具函数和本地辅助函数
- 如无明确收益，不新增 `function foo() {}` 形式的函数声明，避免同一项目内风格混用
- 导出的函数应保持实现方式一致，优先采用 `const foo = () => {}` 或 `const foo = (): ReturnType => {}`
- 若第三方 API、函数提升或递归场景确实更适合函数声明，可作为例外，但应尽量缩小范围并保持说明清晰

### 文档同步规则

出现以下变更时，应同步更新本文档：

- 新增或删除顶层目录
- 新增新的模块层级，如 `hooks/`、`types/`
- 调整公共导出策略
- 调整主题实现的组织方式
- 修改构建产物、入口文件或 demo 与库的关系

若只是局部实现调整，且未改变结构边界，则不必更新架构文档。

---

## 数据流

```
用户 Props
  │
  ├── date? ──────────────────────────────► getLunarInfo(date) → LunarInfo
  │                                                │
  ├── content? ──► 直接使用                         │
  │       或                                        │
  ├── fetchContent? ──► 异步调用 → CalendarContent  │
  │       或                                        │
  ├── (都没传) ──► 使用默认备用内容                  │
  │                                                │
  └── theme? ──► 查找主题注册表 → 对应主题组件       │
                        │                           │
                        ▼                           ▼
                 ThemeComponent({ date, lunar, content })
                        │
                        ▼
                   渲染日历卡片
```

---

## 样式方案

### 选型：CSS Modules

- 每个主题一个 `.module.css` 文件
- 构建时自动生成唯一类名，不污染宿主应用
- Vite 原生支持，无需额外配置

### 从 Tailwind 迁移（P3 阶段执行）

当前代码中的 Tailwind 类名将被替换为 CSS Modules：

```
Tailwind:     className="min-h-screen bg-stone-100 flex"
CSS Modules:  className={styles.container}
```

SVG 内部的样式保持内联（SVG 元素不受 CSS Modules 限制）。

---

## 主题扩展机制

新增主题只需 3 步：

1. 在 `src/components/themes/` 下新建 `NewTheme.tsx` 组件
2. 新建 `src/styles/newtheme.module.css` 样式文件
3. 在 `src/components/themes/index.ts` 注册表中添加映射

主题组件统一接收相同的 Props 接口：

```typescript
interface ThemeComponentProps {
  date: Date;
  lunar: LunarInfo;
  content: CalendarContent; // 已解析好的单条内容
  className?: string;
}
```

---

## 构建产物

| 文件 | 格式 | 用途 |
|------|------|------|
| `dist/*.es.js` | ESModule | 现代打包工具使用（`import`） |
| `dist/*.cjs` | CommonJS | Node.js / 旧版工具使用（`require`） |
| `dist/style.css` | CSS | 组件样式（用户需手动 `import` 引入） |
| `dist/index.d.ts` | TypeScript 声明 | 类型提示支持 |

> 不提供 UMD 格式。现代 React 项目均使用打包工具，UMD 无实际需求。
>
> **重要**：`package.json` 的 `exports` 字段必须显式声明 `"./style.css"` 子路径导出，否则 `import 'react-inspiration-calendar/style.css'` 会被打包工具拒绝。

---

## 依赖关系

| 依赖 | 类型 | 说明 |
|------|------|------|
| `react` | peerDependency | 由宿主应用提供，不打包进库 |
| `react-dom` | peerDependency | 由宿主应用提供，不打包进库 |
| `lunar-javascript` | dependency | 打包进库（体积小，约 30KB gzipped） |
