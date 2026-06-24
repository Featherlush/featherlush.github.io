const n=`---
title: 给 AI 喂上下文时要带仓库地图
excerpt: Vibe Coding 成败往往在 prompt 之前。先交代目录约定、引用已有文章，一次只改一条验收项。
category: 成长随笔
categoryId: career
date: 2026-06-17
author: 徐宁
series: vibe-coding-notes
---

Vibe Coding 翻车的常见原因不是模型笨，而是一句话里塞了五个需求，AI 只改了最明显的两个。2026 年 6 月改个人站时，我逐渐固定上下文加拆分这套习惯，比换模型更有效。入门见 [入门篇](/blog/vibe-coding-first-encounter)；站点结构见 [框架篇](/blog/personal-site-framework-overview)。

## 三层上下文

| 层级 | 内容 | 例子 |
|------|------|------|
| 静态地图 | 目录职责、数据从哪来 | content 是数据源，src/views 是页面 |
| 动态指针 | 相关文件、已有实现 | 夜间变量在 theme.css，参考夜间模式篇 |
| 本轮验收 | 可勾选的完成标准 | build 通过、博客表格 thead 不白底 |

只发修夜间模式而不带地图，AI 可能在某个 Vue 里写 #1e293b，第二天另一个组件仍是白底。

## 仓库地图怎么说清

个人站我会反复引用这套结构，减少 AI 乱建新文件：

\`\`\`
content/blog/*.md          博客正文
content/profile/site.json  导航、Giscus、履历
src/styles/theme.css       主题 token
src/composables/           可复用逻辑
src/content/loaders/       构建期加载
\`\`\`

并说明不要在运行时请求 CMS，不要给每篇博客手写路由。这些在 [框架篇](/blog/personal-site-framework-overview) 里都有，聊天时贴路径或让 AI 先读该 md。

## 任务拆分模板

把大需求拆成可独立验收的小步，每步一轮对话或一轮 Agent：

1. 基础设施，theme.css 变量、useTheme、index.html 防闪白
2. 全局样式，style.css、Tailwind darkMode selector
3. 按页面扫雷，Resume、Blog、ProjectDetail、Markdown 表格
4. 文档，自己写实现笔记，框架篇补内链，AI 可帮助对照清单整理提纲

每步结束跑 npm run build。合并大步时 diff 巨大，很难 review。

## 引用站内博客当规格

个人站博客本身就是给未来自己看的 spec。整理新篇或补系列时：

- 遵循 vue3-composition-patterns.md 的结构，正文语言平实，少用特殊标点，frontmatter 字段与现有篇一致，文末标签行

这比从零描述博客规范短得多，且与站点真实解析器一致。

## 用户规则与 Cursor Rules

长期在项目里放短规则比每次聊天重复有效：

- 最小 diff，不改无关文件，不主动 git commit，代码风格跟周围文件，标点、命名等个人偏好

规则是硬约束，聊天里是本轮目标。两者冲突时以规则为准。

## 反面教材

| 说法 | 问题 |
|------|------|
| 优化整个网站 | 无验收边界 |
| 像大厂那样做 | 无具体参照 |
| 全部改成 TypeScript | 与当前 JS 仓库策略冲突 |
| 顺便重构一下 | scope 爆炸 |

改成 Projects.vue 卡片在 data-theme 为 dark 时背景用 var(--card-bg)，与 Home 卡片一致。

## 小结

Vibe Coding 的 prompt 不是玄学咒语，而是地图、指针、验收清单。先拆步、再引用已有文档与文件，AI 产出才接近可合并。下一篇记夜间模式这种跨十几文件的需求怎么 vibe 下来。

标签：工程化, 个人网站, 成长
`;export{n as default};
