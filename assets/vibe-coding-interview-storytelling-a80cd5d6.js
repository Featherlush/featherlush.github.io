const n=`---\r
title: 协作分工里怎样落到可核对的技术事实\r
excerpt: 记录个人站维护时人与 AI 的分工边界，以及架构、踩坑、审查三类能对照仓库核对的事实。\r
category: 成长随笔\r
categoryId: career\r
date: 2026-06-24\r
author: 徐宁\r
series: vibe-coding-notes\r
---\r
\r
这篇属于 Vibe Coding 手记系列，补全分工边界相关的内容。个人站维护涉及主题变量、路由分包、批量 md 命名与构建脚本等工程细节；正文按项目经历写，AI 主要帮忙对照仓库列缺口、整理系列互链和起草脚本。下文归纳三类可核对的技术事实，以及被追问某段实现时怎样分层说明。系列入门见 [入门篇](/blog/vibe-coding-first-encounter)；竞赛边界见 [全栈模块篇](/blog/vibe-coding-competition-fullstack-boundaries)。\r
\r
## 先定一句话定位\r
\r
我用的版本是：用 Cursor 类 Agent 处理重复劳动和跨文件修改，架构、鉴权、联调、博客正文和合并前的审查我自己负责。AI 主要帮助对照仓库列技术缺口、整理系列互链和起草构建脚本。\r
\r
不说我不用 AI，也不说我不用写代码。分工清楚、验收到位，比争论谁敲键盘更重要。\r
\r
## 用可核对事实代替笼统说法\r
\r
| 笼统说法 | 可核对事实 |\r
|--------|--------|\r
| 我用 Cursor 写了很多代码 | 个人站博客正文懒加载，首包从报 500KB 警告压到主包约 110KB，做法是 manifest 与路由分包 |\r
| AI 帮我做了夜间模式 | 颜色收进 theme.css 语义变量，data-theme 挂 html，hljs 与 Giscus 同步切换 |\r
| 博客都是工具写的 | 博客按项目经历自己写，AI 帮助对照缺口列提纲、整理系列与框架互链 |\r
\r
每条都落到可验证事实，指向 [Vite 分包篇](/blog/vite-chunking-content-manifest)、[夜间模式篇](/blog/site-dark-mode-theme-tokens)、[框架篇](/blog/personal-site-framework-overview)。\r
\r
## 三个常引用的技术主题\r
\r
维护个人站或竞赛项目时，我通常从作品里挑三类能对照仓库核对的内容：\r
\r
### 1. 架构决策\r
\r
个人站内容在 content、展示在 views、构建期 glob 加载，为什么不用 CMS，为什么列表只读 manifest。能画简图或口述数据流即可，不必背 [框架篇](/blog/personal-site-framework-overview) 全文。\r
\r
### 2. 踩坑与修复\r
\r
竞赛或联调里的真坑，例如：\r
\r
- 究理 APP token 键名不一致导致假登录，见 [JWT 踩坑篇](/blog/jlapp-jwt-bcrypt-auth)，旅游 APP 双轨鉴权，见 [双轨鉴权篇](/blog/travel-flask-jwt-dual-auth)，APK 相对路径与 base 配置，见 [HBuilder 篇](/blog/jlapp-hbuilder-apk-packaging)\r
\r
这些细节在联调日志和代码里都能找到，讲清楚说明读过 diff、跟过问题。\r
\r
### 3. 审查流程\r
\r
描述固定步骤，见 [审查篇](/blog/vibe-coding-review-ai-diff)：\r
\r
- 看改动文件列表，砍掉无关 scope，npm run build 与关键页面点击，grep 硬编码色、secret、错误标点，核心 composable 自己读 diff\r
\r
这叫工程习惯，比只说检查过一遍更有依据。\r
\r
## 若被追问某段代码或某篇文章\r
\r
分层说明即可：\r
\r
| 层次 | 说明 |\r
|------|------|\r
| 业务规则与接口契约 | 我定，参考 REST 与模型设计博客 |\r
| 重复 UI 与 CRUD | 我在既有模板上改，部分用 AI 扩写 |\r
| 主题变量与构建脚本 | 我定规范，AI 扫文件或帮助起草脚本，我验收 |\r
| 博客正文 | 我按项目经历写，AI 帮助对照缺口列提纲、整理互链与系列目录 |\r
\r
若要求现场写代码，选小而完整的一道，例如 slugify、一个简单的 computed 筛选、或写 SQL 查询。Vibe Coding 不替代基本功复习。\r
\r
## 和只会 ChatGPT 的区别\r
\r
强调仓库内上下文：\r
\r
- 项目规则、目录约定、引用已有 md 当 spec，见 [上下文篇](/blog/vibe-coding-context-prompt-structure)，Agent 能跑 npm run build，不是只吐代码块，产出是可合并的 diff，不是聊天里的片段\r
\r
AIGC 画图是 [AI 手记](/blog/series/ai-notes) 赛道；Vibe Coding 是维护工程赛道，别混讲。\r
\r
## 站点与文档呈现\r
\r
- 博客系列 Vibe Coding 手记记维护期工作流，与项目技术笔记并列即可\r
- 博客 md 文件名由 AI 根据正文内容批量命名，便于检索与系列归类；正文仍按项目经历撰写\r
\r
## 团队流程视角\r
\r
若对方也在用 AI 编码工具，可以聊 review 规范与 CI 怎么接 Agent diff。Vibe Coding 本质是工程流程问题，不是个人偷懒。\r
\r
## 小结\r
\r
协作分工的核心是工具处理重复劳动，人定规范并验收。博客正文来自项目实践，AI 帮助总结框架与改仓库；架构、踩坑、审查三条线都能落到具体文件与命令。\r
\r
标签：成长, 工程化, 个人网站\r
`;export{n as default};
