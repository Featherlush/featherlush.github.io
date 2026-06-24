const n=`---\r
title: 合并 AI 改动前必做的 diff 审查\r
excerpt: 把 AI 改动当成同事的 PR。看范围、搜硬编码、跑 build、点页面。记录个人站几次差点直接合并的坑。\r
category: 成长随笔\r
categoryId: career\r
date: 2026-06-21\r
author: 徐宁\r
series: vibe-coding-notes\r
---\r
\r
AI 改个人站很快，但快不等于对。2026 年 6 月有几类改动若我不看 diff 就直接 build 通过就关窗口，过几天一定返工，例如双冒号标点、无关文件被格式化、scope 过大的重构、secrets 误提交。这篇是我固定的审查清单，接 [入门篇](/blog/vibe-coding-first-encounter) 与 [夜间模式实战](/blog/vibe-coding-personal-site-night-mode)。\r
\r
## 第一步看改了哪些文件\r
\r
Agent 一轮可能动五十个文件。先看列表：\r
\r
| 信号 | 处理 |\r
|------|------|\r
| 全是 content/blog 下的 md | 可能是标点或批量博客，查是否误改代码块 |\r
| 出现 .env、credentials | 立即回滚，不提交 |\r
| package.json 莫名升 major | 问为什么，常不需要 |\r
| 与本轮需求无关的 view | 要求 AI 还原 |\r
\r
个人站约定最小 diff。若 AI 顺便重排了整个 Home.vue，我会让它拆成独立 PR 或撤销。\r
\r
## 第二步 grep 验收关键词\r
\r
夜间模式相关：\r
\r
\`\`\`bash\r
rg "#f8fafc|#fff[^f]|bg-white" src/\r
\`\`\`\r
\r
博客标点规范化后：\r
\r
\`\`\`bash\r
rg "：：" content/blog/\r
\`\`\`\r
\r
构建优化后看 dist 主包体积，对照 [Vite 分包篇](/blog/vite-chunking-content-manifest)。\r
\r
## 第三步跑终端命令\r
\r
至少：\r
\r
\`\`\`bash\r
npm run build\r
\`\`\`\r
\r
若有 preview，随机打开框架篇、任一项目详情、简历页，并切换主题。Lint 若项目未配置可跳过，Vue 模板语法错误 build 通常会抓。\r
\r
## 第四步读关键逻辑而非全文\r
\r
不必读完五十个 md，但必须读：\r
\r
- 新建或改动的 composable，动到 router、vite.config.js 的 diff，任何 localStorage、外链 script 加载\r
\r
Giscus 与主题同步见 [Giscus 篇](/blog/giscus-comments-theme-sync)。若 AI 改 loadGiscus 逻辑，要看 watch 是否会造成 iframe 重复挂载。\r
\r
## 常见 AI 失误在个人站\r
\r
| 失误 | 后果 | 预防 |\r
|------|------|------|\r
| 标点脚本产生连续双冒号 | 博文排版丑 | 脚本末尾合并连续冒号 |\r
| 在 markdown 代码块里改标点 | 示例代码坏掉 | 脚本跳过 fence |\r
| Tailwind 动态类名 bg-\${color} | 夜间类名不进包 | 用完整类名或 scoped CSS |\r
| 复制粘贴另一项目 API 地址 | 泄露或联调错 | grep http:// |\r
| aria-label 与 UI 不一致 | 无障碍倒退 | 手动 Tab 一遍 |\r
\r
## 什么时候可以接受不完美但可合并\r
\r
- 纯文案博客，无技术错误，标点可后修\r
- 样式九成正确，剩一个边角组件下一轮修\r
- 脚本一次性任务，不进运行时路径\r
\r
什么时候不能合并：\r
\r
- build 失败或路由 404，主题切换后正文不可读，怀疑 secret 或私有仓库 URL 进 diff\r
\r
## 和 Git 工作流的关系\r
\r
接 [Git 协作篇](/blog/git-workflow-learning-notes)。即使 solo 项目，我也倾向每轮 vibe 一个 commit 主题，message 自己写，不用 AI 编造修复了用户未报告的问题。\r
\r
## 小结\r
\r
Vibe Coding 里一半工作在聊天，一半在 review。地图与拆分见 [上下文篇](/blog/vibe-coding-context-prompt-structure)；批量内容见 [内容规模化篇](/blog/vibe-coding-content-at-scale)。没有 review 的 AI 改动不算工程实践。\r
\r
标签：工程化, Git, 成长\r
`;export{n as default};
