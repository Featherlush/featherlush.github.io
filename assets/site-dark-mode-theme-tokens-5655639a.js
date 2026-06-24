const r=`---\r
title: 个人站夜间模式靠 CSS 变量与 data-theme\r
excerpt: 用 data-theme 切换浅色与深色，把颜色收进 theme.css，避免组件里散落白底与硬编码色值。\r
category: 前端开发\r
categoryId: frontend\r
date: 2025-06-18\r
author: 徐宁\r
series: vue-notes\r
---\r
\r
2025 年 6 月给个人站补夜间模式时，最大的坑不是切换按钮，而是颜色写死在各个 Vue 文件里。浅色能跑，一切到深色就露出白卡片、白表格表头和看不清的标签底。这篇记录 data-theme、集中式 CSS 变量和 Tailwind darkMode selector 怎么配合，站点地图见 [个人站框架篇](/blog/personal-site-framework-overview)。\r
\r
## 设计目标\r
\r
1. 首屏不闪白，在 index.html 内联脚本里先读 localStorage 或 prefers-color-scheme，再渲染 body\r
2. 语义色名，用 --ink、--surface、--card-bg 等，而不是在组件里写 #f8fafc\r
3. 组件只引用变量，Markdown 表格、项目卡片、博客标签、内容导航都走同一套 token\r
4. 第三方跟随，highlight.js 主题 URL 随模式切换，Giscus 传 theme 参数\r
\r
## 变量分层\r
\r
src/styles/theme.css 里 :root 定义浅色默认，[data-theme='dark'] 覆盖夜间值。页面和组件只读变量，不在 scoped 样式里重复定义 --bg。\r
\r
常用分组：\r
\r
| 变量组 | 用途 |\r
|--------|------|\r
| --ink / --ink-muted / --ink-soft | 正文与辅助文字 |\r
| --bg / --surface / --card-bg | 页面底、区块底、卡片底 |\r
| --line / --card-border | 边框与分割 |\r
| --accent / --accent-soft | 链接、选中、悬停底 |\r
| --chip-neutral-* / --tag-* | 标签、技能芯片 |\r
| --glass-bg / --glass-border | 半透明卡片与导航浮层 |\r
| --markdown-table-* | Markdown 表格表头与斑马纹 |\r
\r
夜间模式里对比度要单独验一遍。--ink-muted 在深色底上不能过浅，标签底 --chip-neutral-bg 透明度太低会像糊在黑底上。\r
\r
## 切换逻辑\r
\r
useTheme.js 做四件事：\r
\r
\`\`\`javascript\r
document.documentElement.setAttribute('data-theme', mode)\r
document.documentElement.style.colorScheme = mode\r
updateHljsTheme(mode)\r
localStorage.setItem('featherlush-theme', mode)\r
\`\`\`\r
\r
组件里用 useTheme 拿 isDark、toggleTheme、giscusTheme。不要在每个页面各自读写 localStorage。\r
\r
## Tailwind 与 scoped CSS\r
\r
vite.config.js：\r
\r
\`\`\`javascript\r
darkMode: ['selector', '[data-theme="dark"]']\r
\`\`\`\r
\r
这样 Tailwind 的 dark 前缀与自定义变量同步。复杂区块仍用 scoped CSS 加 var(--*)，和 [组合式 API 篇](/blog/vue3-composition-patterns) 里组件变薄的思路一致。\r
\r
## 容易漏白的区域\r
\r
改主题时建议按页面清单验收：\r
\r
- Markdown 表格 thead 渐变，不要用固定 #f8fafc，项目详情封面预览区 cover-wrap 背景，博客切换文章按钮与弹出列表 BlogSeriesNav，内容导航悬浮面板 ContentOutline，联系页图标底与社交 Logo 反色\r
\r
每一处要么改成 var(--card-bg) 或 var(--glass-bg)，要么在 theme.css 增加专用变量。\r
\r
## 与 Pinia 的关系\r
\r
主题状态放在 composable 加 ref，没有进 Pinia。全局只有当前 mode 一个字段，没有跨页面复杂派生，composable 足够。若以后要做按路由记住阅读偏好再考虑 store。\r
\r
## 小结\r
\r
夜间模式可持续维护的关键是颜色只定义在 theme.css，组件禁止写死白底。data-theme 挂在 html 上，变量、Tailwind、hljs、Giscus 都跟随这一开关。新增页面时先问这个背景色有没有对应的语义变量。\r
\r
标签：Vue.js, CSS, 个人网站\r
`;export{r as default};
