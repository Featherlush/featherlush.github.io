const r=`---\r
title: 联系页接入 Giscus 并与主题同步\r
excerpt: 用 Giscus 把联系页评论挂到 GitHub Discussions，处理路由 reset 与夜间模式跟随 data-theme。\r
category: 前端开发\r
categoryId: frontend\r
date: 2025-06-24\r
author: 徐宁\r
series: vue-notes\r
---\r
\r
个人站不想自建评论数据库，联系页用 Giscus 把讨论挂在 GitHub Discussions 上。2025 年 6 月接入时，难点在配置项对齐和与夜间模式、路由切换同步。站点配置集中在 content/profile/site.json，渲染组件是 GiscusComments.vue。夜间模式见 [夜间模式篇](/blog/site-dark-mode-theme-tokens)。\r
\r
## Giscus 是什么\r
\r
Giscus 读取公开仓库的 Discussions，用 client.js 在页面里嵌 iframe 评论框。前提：\r
\r
1. 仓库开启 Discussions\r
2. 在 giscus.app 生成配置，拿到 repo、repoId、category、categoryId\r
3. 选择 Discussion 分类，例如 General\r
\r
评论数据在 GitHub，本站只负责嵌脚本。\r
\r
## site.json 集中配置\r
\r
\`\`\`json\r
"giscus": {\r
  "repo": "Featherlush/featherlush.github.io",\r
  "repoId": "R_kgDOMoYMTQ",\r
  "category": "General",\r
  "categoryId": "DIC_kwDOMoYMTc4Ch74w",\r
  "mapping": "specific",\r
  "term": "contact",\r
  "theme": "light",\r
  "lang": "zh-CN",\r
  "inputPosition": "top"\r
}\r
\`\`\`\r
\r
| 字段 | 含义 |\r
|------|------|\r
| mapping | pathname 按路径建讨论；specific 用固定 term 聚合到一条讨论 |\r
| term | specific 模式下的讨论标识，联系页用 contact |\r
| inputPosition | 评论框在列表上方或下方 |\r
\r
联系页希望所有留言进同一条讨论，所以用 specific 加 term，而不是每篇文章一条 Discussion。\r
\r
## GiscusComments 组件\r
\r
组件不写死配置，从 site.json 传入 props。核心逻辑：\r
\r
\`\`\`javascript\r
scriptEl.src = 'https://giscus.app/client.js'\r
scriptEl.setAttribute('data-repo', props.repo)\r
scriptEl.setAttribute('data-mapping', props.mapping)\r
scriptEl.setAttribute('data-theme', props.theme)\r
scriptEl.setAttribute('data-loading', 'lazy')\r
\`\`\`\r
\r
onMounted 时 loadGiscus 向容器插入 script。onUnmounted 清空容器，避免重复 iframe。\r
\r
## 路由切换时 reset\r
\r
Giscus iframe 默认不随 Vue 路由更新。若博客文内也嵌评论且用 pathname 映射，需要在 route.fullPath 变化时：\r
\r
\`\`\`javascript\r
if (window.giscus?.reset) {\r
  window.giscus.reset()\r
}\r
\`\`\`\r
\r
联系页单页使用 specific 映射时 reset 影响小，保留 watch 便于以后扩展到文章页。\r
\r
## 与夜间模式同步\r
\r
Giscus 主题字符串如 light、dark、transparent_dark 等，与站点 data-theme 不是同一套。useTheme.js 暴露 giscusTheme computed，在 Contact.vue 传给组件：\r
\r
\`\`\`javascript\r
watch(() => props.theme, () => {\r
  loadGiscus()\r
})\r
\`\`\`\r
\r
切换浅色与夜间时重新 load 脚本，比只改 iframe 样式更稳。hljs 主题 URL 同样在 useTheme 里切换，见 [夜间模式篇](/blog/site-dark-mode-theme-tokens)。\r
\r
## 样式与布局\r
\r
.giscus-host 设 min-height，避免懒加载前页面高度跳动。:deep(iframe) 宽度 100%，与正文栏对齐。夜间模式下评论区背景应与 --card-bg 协调，若 Giscus 主题仍偏白，优先换 dark 或 transparent_dark 预设，而不是强行盖 CSS。\r
\r
## 隐私与维护\r
\r
读者评论需 GitHub 账号。仓库公开时讨论内容也公开，适合作品集联系页，不适合私密反馈。维护时定期在 Discussions 里处理 spam，可在仓库设 Discussion 模板提醒留言格式。\r
\r
## 小结\r
\r
Giscus 让个人站零后端评论可行。配置进 site.json，组件只负责插脚本，主题与路由用 watch 跟进。联系页用 specific 聚合留言；若扩展到博客，改用 pathname 映射并记得 giscus.reset。\r
\r
标签：Vue.js, 个人网站\r
`;export{r as default};
