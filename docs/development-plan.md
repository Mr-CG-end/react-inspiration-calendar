# 开发计划

## 阶段总览

| 阶段 | 内容           | 验收标准                                     |
| ---- | -------------- | -------------------------------------------- |
| P0   | 清理与基础改造 | 移除 AI 依赖，项目能正常 build               |
| P1   | 组件库骨架搭建 | Vite Library Mode 构建成功，demo 能跑        |
| P2   | 核心功能实现   | 自定义数据、真实农历、显隐控制均可用         |
| P3   | 样式系统改造   | Tailwind → CSS Modules，3 种主题切换机制就位 |
| P4   | 发布准备       | npm pack 本地测试通过，README 完善           |

---

## P0：清理与基础改造

**目标**：移除不需要的代码，减轻包袱

- [x] 删除 `src/services/geminiService.ts`
- [x] 移除 `@google/genai` 依赖
- [x] 移除 `.env.example` 和 `.env.local` 中的 API Key 相关内容（已删除文件）
- [x] 移除 `vite.config.ts` 中整段 Gemini 相关 define 配置（含 `process.env.API_KEY` 和 `process.env.GEMINI_API_KEY`）
- [x] 移除 `App.tsx` 中对 `geminiService` 的导入和调用
- [x] 创建 `src/utils/dateUtils.ts`，封装 `parseLocalDate(dateStr)` 和 `formatLocalDate(date)` 工具函数，统一项目中的本地日期处理，避免 `new Date('YYYY-MM-DD')` 的 UTC 时区陷阱
- [x] 替换 `App.tsx` 中 `new Date(e.target.value)` / `toISOString()` 为上述工具函数
- [x] 确认项目仍能正常启动（`pnpm dev`）并通过 `pnpm build`

**验收**：`pnpm dev` 启动无报错，`pnpm build` 构建无报错，页面可展示（使用硬编码内容）

---

## P1：组件库骨架搭建

**目标**：将项目从"应用"变成"库 + 演示应用"结构

- [x] 创建 `src/index.ts` 统一导出入口（只导出 Calendar + getLunarInfo + 类型）
- [x] 创建 `src/types.ts` 新版类型定义（CalendarProps、CalendarContent 含 date 字段等）
- [x] 创建 `src/components/Calendar.tsx` 主组件骨架（先包裹现有 CalendarSVG，CalendarSVG 不对外导出）
- [x] 创建 `demo/` 目录，移入演示相关文件：
  - [x] `demo/index.html`
  - [x] `demo/main.tsx`
  - [x] `demo/DemoApp.tsx`（原 App.tsx 改造）
- [x] 创建 `vite.demo.config.ts`（以 `demo/index.html` 为入口的独立 Vite 配置，仅供本地开发使用）
- [x] 修改 `vite.config.ts` → Vite Library Mode（仅用于 `pnpm build` 构建库产物），并在 `build.rollupOptions.external` 中显式排除 `react` 和 `react-dom`（含 `react/jsx-runtime`），确保库产物不捆绑 React
- [x] 在 `package.json` 中添加 `dev:demo` 脚本：`vite --config vite.demo.config.ts`
- [x] 修改 `package.json`：
  - [x] 添加 `main`、`module`、`types`、`exports`（含 `./style.css` 子路径导出）、`files` 字段
  - [x] 将 `react` 和 `react-dom` 从 `dependencies` **移到** `peerDependencies`（不能同时保留在 dependencies 中，否则消费者会出现 React 实例重复）
  - [x] 添加 `peerDependencies` 版本约束：`"react": "^18.0.0 || ^19.0.0"`、`"react-dom": "^18.0.0 || ^19.0.0"`
- [x] 创建 `tsconfig.build.json`（继承 `tsconfig.json`，覆盖 `noEmit: false`、启用 `declaration`、`emitDeclarationOnly`，`include` 仅指向 `src/`），专用于库声明文件输出；保留 `tsconfig.json` 的 `noEmit: true` 供 demo 开发使用
- [x] 修改 `package.json` 构建脚本：`build` 步骤先清理 `dist/`，再运行 `tsc -p tsconfig.build.json` 生成 `.d.ts`，最后运行 `vite build` 生成 JS/CSS 产物（避免历史产物残留）
- [x] 配置代码规范工具链：ESLint（flat config + `typescript-eslint` + `eslint-plugin-react-hooks`）+ Prettier（`.prettierrc`），添加 `lint` 和 `format` 脚本到 `package.json`
- [x] 确认 `vite.config.ts` Library Mode 的 CSS 输出文件名稳定为 `style.css`（通过 `build.lib.cssFileName` 配置）
- [x] 验证使用方可通过 `import 'react-inspiration-calendar/style.css'` 正常加载样式
- [x] 验证 `pnpm build` 构建成功，产物在 `dist/`（含 `index.js` + `index.cjs` + `.d.ts` + `style.css`）
- [x] 验证构建产物中**不包含 React 实现代码**（产物应仅保留 `import "react"` 等外部引用声明，不应包含 `createElement`、`__SECRET_INTERNALS` 等 React 内部实现；可用 `npx rg "createElement|__SECRET_INTERNALS" dist/` 或打开产物文件人工检查）
- [x] 验证 `pnpm dev:demo` 演示应用可正常运行

**验收**：`pnpm build` 生成 `index.js` + `index.cjs` + `.d.ts` + `style.css`（不含 UMD），产物不捆绑 React，`pnpm dev:demo` 可跑，`style.css` 子路径导出可用

---

## P2：核心功能实现

**目标**：实现需求文档中的 F1、F2、F4

> **注意**：P1/P2 阶段暂硬编码 classic 主题渲染，不引入主题注册表。注册表在 P3 统一实现。

### F1：自定义内容数据

- [x] 实现 `content` prop 单条模式
- [x] 实现 `content` prop 数组模式（按 `date` 字段自动匹配当前日期）——**必须使用 `dateUtils.parseLocalDate` 进行日期比较**，禁止直接 `new Date(string)`
- [x] 实现 `fetchContent` prop（异步函数方式）——内部日期处理同样使用 `dateUtils`
- [x] 实现默认备用内容（当什么都不传或无匹配时）
- [x] 处理加载态（fetchContent 异步等待时显示骨架 + spinner）_已决议：为保持纯净 SVG 体验，取消 Spinner，仅使用骨架呼吸灯动画_
- [x] 处理错误态（失败时降级到备用内容）
- [x] 处理竞态（日期快速切换时忽略过期请求的结果，只渲染最新日期的数据）

### F2：真实农历

- [x] 安装 `lunar-javascript`
- [x] 改造 `utils/lunar.ts`，接入 `lunar-javascript` 返回真实农历月/日；新增结果缓存（`Map`）避免重复计算
- [x] 创建 `src/lunar-javascript.d.ts`，为无类型的第三方库提供最小必要的环境模块声明
- [x] 在 demo 中验证不同日期的农历正确性

### F4：显隐控制

- [x] 实现 `visible` prop，默认 `true`
- [x] `visible=false` 时返回 `null`（不渲染 DOM）

### 自动化测试

- [x] 为 `dateUtils`（`parseLocalDate`、`formatLocalDate`）编写单元测试，覆盖跨时区边界用例
- [x] 为 `content[]` 数组日期匹配逻辑编写单元测试
- [ ] 为 `fetchContent` 竞态抑制逻辑编写单元测试（模拟快速切换场景）
- [x] 为农历转换（`getLunarInfo`）编写单元测试，验证代表性日期的正确性
- [x] 配置测试工具链（Vitest），添加 `test` 脚本到 `package.json`

**验收**：demo 中演示所有数据传入方式、农历显示正确、显隐开关生效；**所有单元测试通过**

---

## P3：样式系统改造

**目标**：实现需求文档中的 F3，完成 Tailwind 到 CSS Modules 的迁移，实现三种主题

### 基础样式迁移

- [x] 创建 `styles/base.module.css`（公共样式）
- [x] 将 `CalendarSVG.tsx` 中的 Tailwind 类名替换为 CSS Modules
- [x] 将 `Calendar.tsx` 容器的 Tailwind 类名替换为 CSS Modules
- [x] 移除 Tailwind CSS 相关依赖和配置（`tailwind.config.js`、`postcss.config.js`、index.css 中的 @tailwind 指令）

### 主题注册表

- [x] 创建 `src/components/themes/` 目录和 `index.ts` 注册表
- [x] 将 P1/P2 中硬编码的 classic 渲染迁移到注册表驱动
- [x] 实现 `theme` prop 切换（`'classic' | 'dark' | 'minimalist'`）

### Classic 主题

- [x] 创建 `styles/classic.module.css`
- [x] 创建 `themes/ClassicCalendar.tsx`（从现有 CalendarSVG 改造）

### Dark 主题

- [x] 创建 `styles/dark.module.css`（深色背景 #1a1a1a + 金色字体）
- [x] 创建 `themes/DarkCalendar.tsx`（参考 Stitch 设计稿）

### Minimalist 主题

- [x] 创建 `styles/minimalist.module.css`（浅米色背景 + 极简排版）
- [x] 创建 `themes/MinimalistCalendar.tsx`（参考 Stitch 设计稿）

**验收**：三种主题均可通过 `theme` prop 切换、符合 `theme-styles.md` 的色彩/字体/布局规范、Tailwind 完全移除

---

## P4：发布准备

**目标**：确保包可用，完善文档

- [x] 移除 `package.json` 中的 `"private": true`（否则 `npm publish` 会被阻止）
- [x] 确认 `package.json` 发布元数据完整：`name`、`version`（非占位 0.0.0）、`license`、`repository`、`description`、`keywords`
- [x] 更新 `README.md`（安装、使用示例、API 文档、主题说明）
- [x] 添加 `LICENSE` 文件
- [x] 确认 `.gitignore` 和 `package.json` 的 `files` 字段正确（只发布 `dist/`）
- [ ] `npm pack` 本地打包，在另一个项目中安装测试
- [ ] 验证导入、类型提示、样式加载均正常
- [ ] `npm publish` 发布

**验收**：在一个全新的 React 项目中 `npm install` 你的包，能正常渲染日历

---

## 执行顺序约束

本项目为**单人开发**，采用严格串行执行：

```
P0 (清理) → P1 (骨架) → P2 (功能) → P3 (样式) → P4 (发布)
```

每个阶段**必须完成并通过验收后**，才能进入下一阶段。各阶段的依赖关系：

- P1 依赖 P0（清理完成才能搭骨架）
- P2 依赖 P1（库结构就绪才能实现功能）
- P3 依赖 P2（功能稳定后才做样式迁移，避免返工）
- P4 依赖 P3（所有功能和样式完成后才准备发布）

> 每个阶段完成后，都要确认 `pnpm build` 和 `pnpm dev:demo` 正常，再进入下一阶段。
