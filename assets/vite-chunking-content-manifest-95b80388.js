const n=`---\r
title: 个人站 Vite 分包与内容清单\r
excerpt: 用路由懒加载、markdown 拆包和构建前 manifest，把首包压到可接受体积并消除 500KB 警告。\r
category: 成长随笔\r
categoryId: career\r
date: 2025-06-20\r
author: 徐宁\r
pinned: false\r
---\r
\r
个人站早期构建时 Vite 报过单 chunk 超过 500KB 的警告，博客与项目 Markdown 全量打进入口，highlight 与 markdown-it 也挤在一起。2025 年 6 月做了分包和构建前内容清单，主包约 110KB，gzip 约 42KB。这篇补 [个人站框架篇](/blog/personal-site-framework-overview) 里没展开的构建细节。\r
\r
## 问题从哪来\r
\r
1. 路由同步 import，所有 views 进主包\r
2. 博客正文 eager glob，import.meta.glob 带 eager true 把六十多篇正文一次性解析\r
3. Markdown 解析器 markdown-it 与 highlight.js 体积大，和路由代码绑死\r
\r
列表页只需要标题、摘要、日期；详情页才需要 HTML 正文。把元数据与正文拆开是第一步。\r
\r
## 构建前 manifest\r
\r
scripts/generate-content-manifest.mjs 在 predev 与 prebuild 跑：\r
\r
- 扫描 content/blog 与 content/projects 下的 md，用 Node 侧 parseBlogMeta 只解析 frontmatter 与元数据行，输出 src/generated/blog-manifest.json 与 projects-manifest.json\r
\r
列表、筛选、侧栏标签计数只读 manifest，不加载正文。详情页再：\r
\r
\`\`\`javascript\r
const rawModules = import.meta.glob('@content/blog/*.md', {\r
  query: '?raw',\r
  import: 'default',\r
})\r
// 按 slug 动态 import，非 eager\r
\`\`\`\r
\r
这样首屏不会拖入全部 Markdown 字符串。\r
\r
## 路由懒加载\r
\r
router/index.js 全部改为：\r
\r
\`\`\`javascript\r
component: () => import('@/views/BlogPost.vue')\r
\`\`\`\r
\r
每个页面一个 async chunk。用户打开博客列表时不会下载项目详情与简历页的代码。\r
\r
## manualChunks\r
\r
vite.config.js 把 markdown 相关依赖打进 markdown-vendor：\r
\r
\`\`\`javascript\r
manualChunks(id) {\r
  if (id.includes('node_modules/markdown-it') || id.includes('highlight.js')) {\r
    return 'markdown-vendor'\r
  }\r
}\r
\`\`\`\r
\r
Markdown 解析只在文章或项目详情触发，与首页、关于页 JS 分离。\r
\r
## 路径别名\r
\r
@ 指向 src，@content 指向 content。manifest 脚本里解析器仍用相对路径，避免 Node 跑 Vite 别名失败。应用内 import 统一 @/，见 [组合式 API 篇](/blog/vue3-composition-patterns) 的 loader 分层。\r
\r
## 验收方式\r
\r
\`\`\`bash\r
npm run build\r
\`\`\`\r
\r
看 dist/assets/index 主包体积，确认无 500KB 警告。再 npm run preview 抽查：\r
\r
- 博客列表是否只显示 manifest 条数，点开长文是否正常懒加载正文，切换路由是否只拉对应 chunk\r
\r
## 小结\r
\r
内容驱动站点的构建优化核心是元数据与正文分离、路由与解析器分包。manifest 在 Node 里预生成，浏览器侧按需 import.meta.glob。以后文章再多，列表页体积也不线性膨胀。\r
\r
标签：Vue.js, 工程化, 个人网站\r
`;export{n as default};
