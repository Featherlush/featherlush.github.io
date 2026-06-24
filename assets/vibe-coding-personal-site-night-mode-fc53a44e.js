const r=`---\r
title: 用 Vibe Coding 收拢个人站夜间模式\r
excerpt: 让 AI 收拢 CSS 变量、扫白底漏网、同步 hljs 与 Giscus。记录一轮跨文件改动的顺序与踩坑。\r
category: 成长随笔\r
categoryId: career\r
date: 2026-06-19\r
author: 徐宁\r
series: vibe-coding-notes\r
---\r
\r
2026 年 6 月个人站夜间模式，是我第一次用 Vibe Coding 系统性改样式架构，而不是单点 patch。从加个切换按钮，到表格、标签、内容导航、系列切换器都不漏白，大约跨 theme.css、二十余个 Vue、index.html、vite.config。技术细节见 [夜间模式篇](/blog/site-dark-mode-theme-tokens)；上下文方法见 [上下文篇](/blog/vibe-coding-context-prompt-structure)。\r
\r
## 需求怎么说才不被理解成加个 dark 类\r
\r
错误打开方式只说支持 dark mode。AI 容易只在 Navbar 加一个 toggle，或大量 dark:bg-slate-900 散落各处。\r
\r
我实际用的描述：\r
\r
1. 用 html[data-theme=dark]，颜色集中在 theme.css\r
2. 组件禁止硬编码 #fff、#f8fafc\r
3. 首屏不闪白，index.html 内联读 localStorage\r
4. highlight.js 与 Giscus 主题跟随\r
5. Tailwind 配置 darkMode 为 selector，匹配 data-theme\r
\r
这是架构约束，不是颜色偏好。带约束后，AI 会先动 theme.css 和 useTheme.js，而不是只改一个页面。\r
\r
## 一轮对话里的典型产出\r
\r
| 产出 | 作用 |\r
|------|------|\r
| src/styles/theme.css | 浅色 :root 与深色覆盖 |\r
| useTheme.js | 切换、持久化、hljs URL |\r
| ThemeToggle.vue | 导航栏按钮与 aria-label |\r
| 各页 scoped CSS | 硬编码浅色改 var(--card-bg) 等 |\r
\r
我让 AI 列出仍含 white 或 slate-50 的文件再逐个改，比全站搜索替换安全。\r
\r
## 漏网之鱼为什么要人肉点页面\r
\r
AI 改完主题变量后，仍有几类问题要手动验收或第二轮 vibe：\r
\r
| 区域 | 现象 | 原因 |\r
|------|------|------|\r
| Markdown 表格 thead | 白底盖字 | 渐变写在 MarkdownContent 或全局表样式 |\r
| 项目封面 preview | 白块 | cover-wrap 独立背景 |\r
| BlogSeriesNav | 切换列表白底 | 弹出层没用 glass 变量 |\r
| ContentOutline | 悬浮面板发白 | glass-bg 未变量化 |\r
| 经历页旅游卡片 | 字看不见 | Tailwind 动态类在 scoped 里失效，需手写渐变 |\r
\r
这些在 [无障碍篇](/blog/spa-accessibility-reduced-motion) 和夜间模式篇的清单里。Vibe 第一轮常漏 Markdown 管道与 Teleport 组件。\r
\r
## 构建与视觉双验收\r
\r
\`\`\`bash\r
npm run build\r
npm run preview\r
\`\`\`\r
\r
构建通过只说明语法和 import 没问题。切换主题后建议点一遍博客列表标签、长文目录 FAB、简历页芯片、联系页社交图标反色。\r
\r
我曾在 AI 改完后发现标签背景透明度太低，第二轮才调 --chip-neutral-bg。\r
\r
## 博客也要同步更新\r
\r
实现稳定后，自己写夜间模式笔记，并更新 [框架篇](/blog/personal-site-framework-overview) 内链。AI 可帮助对照实现清单整理提纲。代码与文档同一轮需求，避免代码上了文档没有。\r
\r
## 和手写 CSS 的分工\r
\r
- 我定变量命名分层、开关挂 html、哪些区域用 glass\r
- AI 扫各文件硬编码色、补 aria、对齐导航栏高度\r
- 我审对比度、动效是否仍过重\r
\r
若完全不懂 CSS 变量，vibe 出来的夜间模式容易整体涂灰，而不是语义 token。\r
\r
## 小结\r
\r
夜间模式适合 Vibe Coding，因为改动面广但模式重复。关键是 upfront 讲清 token 中心制和验收页面清单，而不是只说要深色。审查 diff 见 [审查篇](/blog/vibe-coding-review-ai-diff)。\r
\r
标签：Vue.js, CSS, 个人网站, 工程化\r
`;export{r as default};
