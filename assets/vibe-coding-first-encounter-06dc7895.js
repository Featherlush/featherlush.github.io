const n=`---\r
title: 从描述意图到改仓库的 Vibe Coding 入门\r
excerpt: 用自然语言描述想要的效果，让工具改仓库、跑构建、整理框架文档。记录第一次系统用 Cursor 维护个人站时的体会。\r
category: 成长随笔\r
categoryId: career\r
date: 2026-06-16\r
author: 徐宁\r
series: vibe-coding-notes\r
---\r
\r
2026 年 6 月给个人站加夜间模式、整理构建分包、补框架类笔记时，我大部分时间不是在 IDE 里逐行敲 Vue，而是在聊天框里描述导航栏主题按钮对齐、表格夜间白底盖字、对照已有笔记补技术缺口这类需求。先描述意图，再让 AI 动仓库，最后自己负责验收，近几年在开发者圈里常被称作 Vibe Coding。这篇只记我作为学生开发者的入门理解，不是工具广告。\r
\r
## 和课堂写代码差在哪\r
\r
| 课堂默认路径 | Vibe Coding 路径 |\r
|--------------|------------------|\r
| 自己查文档、抄示例、调试报错 | 用项目上下文让 AI 先给一版 diff |\r
| 作业规模小，全局在脑子里 | 个人站七十篇博客、几十组件，人脑装不下全貌 |\r
| 评分看能不能跑 | 站点要看能不能维护、能不能讲清架构 |\r
\r
Vibe Coding 不是不写代码，而是把检索、样板、跨文件重命名交给 AI，人保留需求拆分、边界判断、合并前审查。不会读 diff 的 vibe coding 和不会写代码一样危险。\r
\r
## 简化的工作流\r
\r
1. 说清楚目标与约束，例如夜间用 CSS 变量、不要硬编码白底\r
2. 指向已有模式，例如和 theme.css 里其它 chip 变量一致\r
3. 让 AI 改完跑 build，npm run build 是最低验收\r
4. 自己点一遍页面，列表、详情、切换主题、手机目录 FAB\r
5. 值得留档的自己写进博客，AI 可帮忙对照实现列提纲\r
\r
个人站地图见 [框架篇](/blog/personal-site-framework-overview)；传统工程环境见 [npm 笔记](/blog/npm-dev-environment-notes)。\r
\r
## Vibe Coding 适合什么\r
\r
- 样式与主题统一，一次改 token 牵十几处 scoped CSS\r
- 框架文档与目录整理，对照缺口列系列、补互链\r
- 脚手架与脚本，manifest 生成、标点规范化脚本\r
- 已知 UI 目标但不想手抄 Tailwind 时的布局微调\r
\r
## 不太适合什么\r
\r
- 算法与数值，图形学软渲染、启发式权重等硬约束场景\r
- 安全与密钥，JWT 密钥、数据库密码绝不能进仓库\r
- 你没概念的需求，先自己画草图或列验收项\r
\r
和 ShapeWeave 里 [生成式 AI 感触](/blog/shape-weave-ai-reflections) 类似，模型擅长填语义，硬约束仍要工程化兜底。\r
\r
## 和 Copilot 补全的区别\r
\r
单行补全像自动打字；Cursor Agent 类工作流像临时搭档，能读全仓、多文件编辑、跑终端。Vibe Coding 通常指后者，加上你用自然语言当产品经理。\r
\r
我仍然会在关键 composable 里自己写第一版逻辑，再让 AI 扩散到各页面。核心路径人写，重复劳动 AI 扫。\r
\r
## 学生用 vibe coding 的心态\r
\r
1. 每轮改动要能解释，别人追问实现时要能讲清，例如夜间模式怎么做的，不能只停在工具帮忙\r
2. 把 AI 产出当 PR，见 [审查篇](/blog/vibe-coding-review-ai-diff)\r
3. 留规则文件，见 [上下文篇](/blog/vibe-coding-context-prompt-structure)\r
\r
## 小结\r
\r
Vibe Coding 对我不是偷懒借口，而是在站点规模下把重复劳动外包给 AI，把时间留给架构、验收和自己写项目笔记。下一篇写怎么给 AI 喂上下文和拆任务。竞赛项目分工见 [全栈模块篇](/blog/vibe-coding-competition-fullstack-boundaries)；分工事实见 [协作分工篇](/blog/vibe-coding-interview-storytelling)。\r
\r
标签：工程化, 个人网站, 成长\r
`;export{n as default};
