# 开发计划

## 阶段总览

| 阶段 | 内容 | 验收标准 |
|------|------|---------|
| P0 | 清理与基础改造 | 移除 AI 依赖，项目能正常 build |
| P1 | 组件库骨架搭建 | Vite Library Mode 构建成功，demo 能跑 |
| P2 | 核心功能实现 | 自定义数据、真实农历、显隐控制均可用 |
| P3 | 样式系统改造 | Tailwind → CSS Modules，3 种主题切换机制就位 |
| P4 | 发布准备 | npm pack 本地测试通过，README 完善 |

---

## P0：清理与基础改造

**目标**：移除不需要的代码，减轻包袱

- [ ] 删除 `src/services/geminiService.ts`
- [ ] 移除 `@google/genai` 依赖
- [ ] 移除 `.env.example` 和 `.env.local` 中的 API Key 相关内容
- [ ] 移除 `vite.config.ts` 中 `process.env.API_KEY` 的 define 配置
- [ ] 移除 `App.tsx` 中对 `geminiService` 的导入和调用
- [ ] 创建 `src/utils/dateUtils.ts`，封装 `parseLocalDate(dateStr)` 和 `formatLocalDate(date)` 工具函数，统一项目中的本地日期处理，避免 `new Date('YYYY-MM-DD')` 的 UTC 时区陷阱
- [ ] 替换 `App.tsx` 中 `new Date(e.target.value)` / `toISOString()` 为上述工具函数
- [ ] 确认项目仍能正常启动（`pnpm dev`）并通过 `pnpm build`

**验收**：`pnpm dev` 启动无报错，`pnpm build` 构建无报错，页面可展示（使用硬编码内容）

---

## P1：组件库骨架搭建

**目标**：将项目从"应用"变成"库 + 演示应用"结构

- [ ] 创建 `src/index.ts` 统一导出入口（只导出 Calendar + getLunarInfo + 类型）
- [ ] 创建 `src/types.ts` 新版类型定义（CalendarProps、CalendarContent 含 date 字段等）
- [ ] 创建 `Calendar.tsx` 主组件骨架（先包裹现有 CalendarSVG，CalendarSVG 不对外导出）
- [ ] 创建 `demo/` 目录，移入演示相关文件：
  - [ ] `demo/index.html`
  - [ ] `demo/main.tsx`
  - [ ] `demo/DemoApp.tsx`（原 App.tsx 改造）
- [ ] 创建 `vite.demo.config.ts`（以 `demo/index.html` 为入口的独立 Vite 配置，仅供本地开发使用）
- [ ] 修改 `vite.config.ts` → Vite Library Mode（仅用于 `pnpm build` 构建库产物）
- [ ] 在 `package.json` 中添加 `dev:demo` 脚本：`vite --config vite.demo.config.ts`
- [ ] 修改 `package.json` → 添加 `main`、`module`、`types`、`exports`（含 `./style.css` 子路径导出）、`peerDependencies`、`files` 字段
- [ ] 创建 `tsconfig.build.json`（继承 `tsconfig.json`，覆盖 `noEmit: false`、启用 `declaration`、`emitDeclarationOnly`，`include` 仅指向 `src/`），专用于库声明文件输出；保留 `tsconfig.json` 的 `noEmit: true` 供 demo 开发使用
- [ ] 修改 `package.json` 构建脚本：`build` 步骤先运行 `tsc -p tsconfig.build.json` 生成 `.d.ts`，再运行 `vite build` 生成 JS/CSS 产物
- [ ] 确认 `vite.config.ts` Library Mode 的 CSS 输出文件名稳定为 `style.css`（通过 `build.lib.fileName` 或 `build.cssFileName` 配置）
- [ ] 验证使用方可通过 `import 'react-inspiration-calendar/style.css'` 正常加载样式
- [ ] 验证 `pnpm build` 构建成功，产物在 `dist/`（含 `.es.js` + `.cjs` + `.d.ts` + `style.css`）
- [ ] 验证 `pnpm dev:demo` 演示应用可正常运行

**验收**：`pnpm build` 生成 `.es.js` + `.cjs` + `.d.ts` + `style.css`（不含 UMD），`pnpm dev:demo` 可跑，`style.css` 子路径导出可用

---

## P2：核心功能实现

**目标**：实现需求文档中的 F1、F2、F4

> **注意**：P1/P2 阶段暂硬编码 classic 主题渲染，不引入主题注册表。注册表在 P3 统一实现。

### F1：自定义内容数据
- [ ] 实现 `content` prop 单条模式
- [ ] 实现 `content` prop 数组模式（按 `date` 字段自动匹配当前日期）
- [ ] 实现 `fetchContent` prop（异步函数方式）
- [ ] 实现默认备用内容（当什么都不传或无匹配时）
- [ ] 处理加载态（fetchContent 异步等待时显示骨架 + spinner）
- [ ] 处理错误态（失败时降级到备用内容）
- [ ] 处理竞态（日期快速切换时忽略过期请求的结果，只渲染最新日期的数据）

### F2：真实农历
- [ ] 安装 `lunar-javascript`
- [ ] 改造 `utils/lunar.ts`，返回真实农历月/日
- [ ] 在 demo 中验证不同日期的农历正确性

### F4：显隐控制
- [ ] 实现 `visible` prop，默认 `true`
- [ ] `visible=false` 时返回 `null`（不渲染 DOM）

**验收**：demo 中演示所有数据传入方式、农历显示正确、显隐开关生效

---

## P3：样式系统改造

**目标**：实现需求文档中的 F3，完成 Tailwind 到 CSS Modules 的迁移，实现三种主题

### 基础样式迁移
- [ ] 创建 `styles/base.module.css`（公共样式）
- [ ] 将 `CalendarSVG.tsx` 中的 Tailwind 类名替换为 CSS Modules
- [ ] 将 `Calendar.tsx` 容器的 Tailwind 类名替换为 CSS Modules
- [ ] 移除 Tailwind CSS 相关依赖和配置（`tailwind.config.js`、`postcss.config.js`、index.css 中的 @tailwind 指令）

### 主题注册表
- [ ] 创建 `src/components/themes/` 目录和 `index.ts` 注册表
- [ ] 将 P1/P2 中硬编码的 classic 渲染迁移到注册表驱动
- [ ] 实现 `theme` prop 切换（`'classic' | 'dark' | 'minimalist'`）

### Classic 主题
- [ ] 创建 `styles/classic.module.css`
- [ ] 创建 `themes/ClassicCalendar.tsx`（从现有 CalendarSVG 改造）

### Dark 主题
- [ ] 创建 `styles/dark.module.css`（深色背景 #1a1a1a + 金色字体）
- [ ] 创建 `themes/DarkCalendar.tsx`（参考 Stitch 设计稿）

### Minimalist 主题
- [ ] 创建 `styles/minimalist.module.css`（浅米色背景 + 极简排版）
- [ ] 创建 `themes/MinimalistCalendar.tsx`（参考 Stitch 设计稿）

**验收**：三种主题均可通过 `theme` prop 切换、符合 `theme-styles.md` 的色彩/字体/布局规范、Tailwind 完全移除

---

## P4：发布准备

**目标**：确保包可用，完善文档

- [ ] 移除 `package.json` 中的 `"private": true`（否则 `npm publish` 会被阻止）
- [ ] 更新 `README.md`（安装、使用示例、API 文档、主题说明）
- [ ] 添加 `LICENSE` 文件
- [ ] 确认 `.gitignore` 和 `package.json` 的 `files` 字段正确（只发布 `dist/`）
- [ ] `npm pack` 本地打包，在另一个项目中安装测试
- [ ] 验证导入、类型提示、样式加载均正常
- [ ] `npm publish` 发布

**验收**：在一个全新的 React 项目中 `npm install` 你的包，能正常渲染日历

---

## 执行顺序约束

```
P0 (清理) → P1 (骨架) → P2 (功能) → P3 (样式) → P4 (发布)
             不可跳过         可并行           依赖 P1
```

> 每个阶段完成后，都要确认 build 和 demo 正常，再进入下一阶段。
