const r=`---\r
title: Vue 3 项目里 TypeScript 的实用边界\r
excerpt: 个人站仍以 JavaScript 交付，但接口、Pinia 与 props 的类型边界怎么划，避免一上来全量迁移。\r
category: 前端开发\r
categoryId: frontend\r
date: 2025-03-08\r
author: 徐宁\r
series: vue-notes\r
---\r
\r
课题组图表模板和竞赛 APP 里已经混用 .ts 配置与 .vue 里的 lang ts，个人介绍站为了迭代速度暂时用 JavaScript。这篇不是 TS 语法课，而是记录哪些文件值得先加类型、哪些继续 JS 更划算，和 [组合式 API 篇](/blog/vue3-composition-patterns) 同一套组件变薄思路。\r
\r
## 先类型化数据边界\r
\r
优先级从高到低：\r
\r
| 边界 | 原因 | 本仓库对应 |\r
|------|------|------------|\r
| 内容 loader 返回值 | 列表与详情共享结构 | blog.js 与 projects.js manifest |\r
| composable 入参出参 | 多页面复用 | useBlogFilter 筛选条件 |\r
| API 响应 | 联调扯皮多 | 究理 APP api 层 |\r
| 纯展示组件 props | 改动少、收益稳定 | 图表配置面板 |\r
\r
UI 动效、一次性页面布局可以晚做 TS。先保证数据进组件之前类型正确。\r
\r
## script setup 里的最小用法\r
\r
\`\`\`typescript\r
interface BlogPostMeta {\r
  id: string\r
  title: string\r
  date: string\r
  categoryId: string\r
  tags: string[]\r
}\r
\r
const props = defineProps<{\r
  post: BlogPostMeta\r
}>()\r
\`\`\`\r
\r
不必立刻给每个 ref 标类型。computed 返回值往往能从入参推断。\r
\r
## 与 Pinia 的配合\r
\r
电脉智绘论文版里 Store 字段多，适合 defineStore 加接口：\r
\r
\`\`\`typescript\r
interface ForecastState {\r
  windowStart: string\r
  windowEnd: string\r
  loading: boolean\r
}\r
\`\`\`\r
\r
个人站主题、博客筛选若进 Pinia，也应先写 state 接口再写 action，避免 any 在 action 里扩散。Dashboard 多 Store 联动见 [论文版 Grid 篇](/blog/electricity-paper-d3-dashboard-grid)。\r
\r
## 配置与构建\r
\r
- jsconfig 或 tsconfig 配 paths 对齐 Vite 别名\r
- 新文件优先 .ts composable，旧 .vue 逐步 lang ts\r
- vue-tsc --noEmit 可放 CI，本地 dev 仍以 Vite 速度为主\r
\r
## 不急着全量迁移的原因\r
\r
个人站频繁改 Markdown 与样式，全量 TS 会让 frontmatter 字段改动牵一堆类型。当前策略：\r
\r
1. manifest 结构稳定后给 loader 加 .d.ts 或迁到 .ts\r
2. 新增 composable 用 TS\r
3. 旧页面保持 JS，动大重构时再改\r
\r
竞赛交付窗口紧时，接口层 TS 加视图层 JS 是务实组合。\r
\r
## 小结\r
\r
TypeScript 在 Vue 3 项目里应先守住 loader、API、Store、props 四条边界，而不是追求每个文件都 .ts。个人站后续若迁移，会从 generated manifest 与 composable 开始，而不是从 Home 海报动画开始。\r
\r
标签：Vue.js, TypeScript\r
`;export{r as default};
