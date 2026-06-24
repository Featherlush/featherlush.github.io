const n=`---\r
title: 用脚本规模化维护博客内容\r
excerpt: 对照技能缺口整理系列与互链，用脚本统一标点、生成 manifest。内容变多时脚本比纯聊天更可靠。\r
category: 成长随笔\r
categoryId: career\r
date: 2026-06-22\r
author: 徐宁\r
series: vibe-coding-notes\r
---\r
\r
个人站博客从六十多篇涨到七十多篇，相当一部分是 2026 年 6 月按项目经历陆续补上的技术笔记，夜间模式、Vite 分包、TypeScript 边界、无障碍、Giscus、目录导航，再加本系列。正文记录的是自己做过的事；AI 主要帮忙对照仓库列缺口、整理系列目录和跑构建脚本。若每篇都从零手写，一周不够；若只靠聊天不改脚本，标点与 manifest 容易乱。这篇记内容规模化时的分工，接 [上下文篇](/blog/vibe-coding-context-prompt-structure) 与 [审查篇](/blog/vibe-coding-review-ai-diff)。\r
\r
## 先分析缺口再列提纲\r
\r
不是笼统地说再写几篇博客，而是：\r
\r
1. 对照站点已有标签与技能笔记，列还没独立篇章的主题\r
2. 每篇对应站点里真实实现，能链到代码或已有笔记\r
3. 指定 series、categoryId、互链目标\r
\r
例如缺 TypeScript 边界对应 typescript-vue-boundaries.md，缺部署对应 static-site-github-pages-deploy.md。AI 擅长在表格里对照缺口与已有文件，人确认后自己写正文。\r
\r
## 博客规范当写作约束\r
\r
每批新文固定 frontmatter 含 title、excerpt、category、categoryId、date、author，可选 series、project、pinned。\r
\r
正文用时间背景开篇、## 分节、表格或代码、站内互链、文末标签行。语言平实，少用特殊标点。这条写进自己的检查清单，也写进给 AI 的仓库规则。\r
\r
## 标点脚本由 AI 帮助起草，人跑验收\r
\r
五十多篇老文章标点不一时，我让 AI 帮助起草 scripts/normalize-blog-punctuation.mjs，再自己改规则：\r
\r
- 跳过 YAML frontmatter，跳过代码块 fence，合并误伤的双冒号\r
\r
然后人跑脚本加 grep 验收，而不是让 AI 手工打开几十个文件。\r
\r
\`\`\`bash\r
node scripts/polish-blog-site.mjs\r
rg "：：" content/blog/\r
\`\`\`\r
\r
脚本可重复执行，聊天一次性 diff 不可重复。生成脚本往往比直接改几十个文件更 vibe。\r
\r
## manifest 不要手写\r
\r
prebuild 跑 generate-content-manifest.mjs，从 content/blog 扫 frontmatter。新增 md 后：\r
\r
\`\`\`bash\r
npm run build\r
\`\`\`\r
\r
看控制台 content manifest 条数。若列表页少文章，先查 slug 与文件名，再查 manifest 是否生成，而不是在 Vue 里硬编码数组。\r
\r
细节见 [Vite 分包篇](/blog/vite-chunking-content-manifest)。\r
\r
## 系列与框架篇互链\r
\r
批量新文后第二轮小任务：\r
\r
- 更新 _series.json 描述，[框架篇](/blog/personal-site-framework-overview) 补两到三条内链，新系列则加 _series.json 条目\r
\r
这类机械 edits 很适合 AI，但要检查 JSON 合法与 id 不重复。\r
\r
## 本系列与 AI 手记的分工\r
\r
vibe-coding-notes 与 ai-notes 分开。ai-notes 记 ShapeWeave 等生成式模型；vibe-coding-notes 记 Cursor 类工具如何改工程与整理文档。避免把会用 ChatGPT 画图和会用 Agent 维护仓库混为一谈。\r
\r
## 内容质量谁负责\r
\r
自己写的初稿也常有过于笼统的小结、路径写错、段落重复。\r
\r
我至少做三件事：\r
\r
1. 核对代码路径与命令是否真存在\r
2. 删重复、补一句亲身踩坑\r
3. 读一遍出声，拗口处改短句\r
\r
博客记录项目经历；md 文件名由 AI 根据正文内容批量命名，便于检索与系列归类。\r
\r
## 小结\r
\r
个人站博客规模化等于缺口分析、自己写正文、AI 辅助框架归纳、脚本兜底、build 验 manifest、人工润色。规模上来后，信任脚本与构建管线比信任模型记忆更稳。入门与审查见本系列前两篇；站点地图见 [框架篇](/blog/personal-site-framework-overview)。竞赛边界见 [全栈模块篇](/blog/vibe-coding-competition-fullstack-boundaries)、协作分工见 [协作分工篇](/blog/vibe-coding-interview-storytelling)。\r
\r
标签：工程化, 个人网站, 成长\r
`;export{n as default};
