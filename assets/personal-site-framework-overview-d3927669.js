const n=`---
title: "个人站内容驱动架构梳理"
excerpt: "从 Vite 构建、content/ 目录约定到博客系列与项目联动，把这套个人站的整体框架一次讲清。"
category: "成长随笔"
categoryId: "career"
date: "2024-12-11"
author: "徐宁"
pinned: true
---

2024 年 12 月，我把个人介绍站从能跑的 Vue 页面整理成 **内容驱动** 的静态站点，改 Markdown 就能更新博客和项目，不必每次动路由表。这篇把目录结构、构建管线、页面分层和博客系统的设计动机写在一起，方便以后自己或他人接手。组合式 API 实践见 [Vue 3 组合式篇](/blog/vue3-composition-patterns)；图表模板时期的工程环境见 [npm 笔记](/blog/npm-dev-environment-notes)、[Git 协作篇](/blog/git-workflow-learning-notes)。

## 技术栈一览

| 层级 | 技术 | 作用 |
|------|------|------|
| 框架 | Vue 3 Composition API | 页面与组件 |
| 构建 | Vite 4 | 开发服务器、生产打包 |
| 路由 | Vue Router 4 History | 多页面导航 |
| 状态 | Pinia | 全局状态预留 |
| 样式 | Tailwind CSS 3 与 CSS 变量 | 布局与主题 token |
| 内容 | Markdown 与 YAML frontmatter | 博客、项目正文 |
| 解析 | markdown-it、highlight.js、yaml | MD 转 HTML、代码高亮 |
| 评论 | Giscus | 基于 GitHub Discussions |

没有自建后端，构建产物是纯静态资源，可部署到任意静态托管。

## 仓库顶层结构

\`\`\`
PersonalIntroduction/
├── content/                 # 内容与配置，不参与 Vue 编译逻辑
│   ├── blog/*.md            # 博客文章
│   ├── blog/_series.json    # 系列合集元数据
│   ├── blog/_categories.json
│   ├── projects/*.md        # 项目详情
│   └── profile/site.json    # 个人资料、导航、履历
├── public/                  # 静态资源，原样拷贝
│   └── images/              # 博客与项目配图
├── src/
│   ├── views/               # 路由页面
│   ├── components/          # 布局、博客、内容渲染
│   ├── content/loaders/     # 构建期扫描 content/
│   ├── composables/         # 博客筛选、滚动动效
│   ├── lib/                 # Markdown、元数据解析
│   └── router/
└── vite.config.js
\`\`\`

核心思路，**\`content/\` 是数据源，\`src/\` 是渲染器**。

## 构建期内容加载

博客与项目不在运行时请求 API，而是在 **Vite 打包时** 用 \`import.meta.glob\` 扫文件：

\`\`\`javascript
const modules = import.meta.glob('../../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
\`\`\`

每条 \`.md\` 走统一管线：

1. **拆 frontmatter**，\`yaml\` 解析 \`---\` 块
2. **剥正文元数据行**，\`标签：\`、\`项目：\` 等，见 \`contentMeta.js\`
3. **markdown-it 转 HTML**，标题锚点、代码高亮
4. **估算阅读时长**，按字数

文件名即 slug，\`vue3-composition-patterns.md\` 对应路由 \`/blog/vue3-composition-patterns\`。

项目 loader \`projects.js\` 逻辑相同，额外解析 \`featured\`、\`cover\`、\`gradient\` 等 frontmatter 字段。

## 路由与页面分层

| 路径 | 视图 | 职责 |
|------|------|------|
| \`/\` | \`Home.vue\` | 首屏、精选项目、动效 |
| \`/about\` | \`About.vue\` | 简介与技能 |
| \`/experience\` | \`Experience.vue\` | 教育、实习、志愿 |
| \`/projects\` | \`Projects.vue\` | 项目卡片列表 |
| \`/projects/:slug\` | \`ProjectDetail.vue\` | 项目 Markdown 正文 |
| \`/blog\` | \`Blog.vue\` | 文章时间线 |
| \`/blog/series/:id\` | \`BlogSeries.vue\` | 系列目录 |
| \`/blog/:id\` | \`BlogPost.vue\` | 单篇文章 |
| \`/resume\` | \`Resume.vue\` | 简历页 |
| \`/contact\` | \`Contact.vue\` | 联系与 Giscus |

全局壳层：

- \`App.vue\`，背景网格、光晕、页面切换过渡
- \`PageWrapper.vue\`，顶栏 \`Navbar\` 与 \`<main>\`
- \`MouseGlow.vue\`，桌面端鼠标跟随光效，尊重 \`prefers-reduced-motion\`

## 博客系统

### Frontmatter 常用字段

\`\`\`yaml
title: "文章标题"
excerpt: "列表摘要"
category: "前端开发"
categoryId: frontend
date: "2024-12-11"
author: "徐宁"
series: vue-notes      # 可选，关联系列
project: jiuli-app     # 可选，关联项目 slug
pinned: true           # 可选，列表置顶
\`\`\`

### 系列 _series.json

按 **技术主题** 组织手记，ECharts、Vue、Flask 等，不是按项目名称。系列页 \`/blog/series/vue-notes\` 按日期 **升序** 排列，适合连载阅读。ECharts 系列从 [liquidFill 入门](/blog/echarts-liquidfill-learning) 起，可按合集目录顺序复习。

### 分类与侧栏

\`BlogLayout.vue\` 与 \`BlogSidebar.vue\`，分类筛选、标签按引用次数排序、归档月份、系列入口。筛选逻辑在 \`useBlogFilter.js\` composable，列表页与文章页共用同一套侧栏。实现细节见 [组合式 API 篇](/blog/vue3-composition-patterns)。

### 置顶

\`pinned: true\` 的文章在 **无筛选条件** 时排在列表最前，并显示置顶标记。系列内阅读仍按连载日期排序，不受置顶影响。

### 项目联动

正文或 frontmatter 写 \`project: travel-app\` 后：

- 博客侧栏 **不** 把项目 slug 当标签展示
- \`BlogPost.vue\` 文首显示相关项目芯片，链到 \`/projects/travel-app\`
- \`ProjectDetail.vue\` 底部列出同 \`project\` 的笔记默认 3 篇与展开

## 项目系统

项目 Markdown 支持封面、渐变占位、\`featured\` 精选。列表页按 \`date\` 降序；首页 \`getFeaturedProjects()\` 只取 \`featured: true\`。

正文图片按路径渲染为普通 figure，表格包裹 md-table-wrap 统一边框与斑马纹。ContentOutline 根据标题生成大纲，桌面端 sticky 展示。

## 个人资料 site.json

导航项、社交链接、教育经历、奖项、Giscus 仓库配置等集中在 \`content/profile/site.json\`，由 \`profile.js\` loader 导出。改联系方式或履历 **只改 JSON**，不必搜遍各 Vue 文件。

## Markdown 渲染增强

\`MarkdownContent.vue\` 在 HTML 基础上做几件事：

- 表格包裹 \`.md-table-wrap\`，统一边框与斑马纹
- 项目正文插图按路径正常渲染，不再插入专用架构示意图组件
- \`ContentOutline.vue\` 根据标题生成大纲桌面端 sticky

代码块经 \`highlight.js\` 高亮；正文中的 \`标签：\` 行在解析阶段剔除，只进元数据。

## 样式与动效

- **设计 token**，\`style.css\` 里 \`--ink\`、\`--accent\`、\`--content-max\` 等变量，页面统一引用
- **Tailwind**，工具类做间距、响应式；复杂区块用 scoped CSS
- **useScrollReveal**，列表项 \`.reveal\` 进入视口时淡入
- **页面过渡**，\`router-view\` 外包 \`transition\`，切换路由轻微位移

## 本地开发与发布

\`\`\`bash
npm run dev      # Vite 开发服务器
npm run build    # 输出 dist/
npm run preview  # 预览构建结果
\`\`\`

新增博客，在 \`content/blog/\` 放 \`.md\` 即可，**无需注册路由**。图片放 \`public/images/blog/<slug>/\`。

## 小结

这套站的框架可以概括成四句话：

1. **内容在 \`content/\`，展示在 \`src/views\`**
2. **构建期 glob 与统一 parse，运行时零 CMS**
3. **博客按技术系列组织，用 \`project\` 字段挂项目**
4. **组件层只管布局与渲染，业务数据尽量不进 Vue 硬编码**

之后加项目、写手记，主要动 Markdown 和 JSON；只有新交互或新页面类型时才改 Vue。本文置顶，作为整站的地图页。

标签：Vue.js, 工程化, 个人网站
`;export{n as default};
