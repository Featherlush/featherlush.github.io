const n=`---
title: "Git 协作与环境学习记录"
excerpt: "第一次参与团队 Git 仓库协作，从克隆、分支、提交到合并，结合产学研图表模板项目的流程整理笔记。"
category: "成长随笔"
categoryId: "career"
date: "2024-01-18"
author: "徐宁"
project: real-estate-viz
---

接 [npm 环境笔记](/blog/npm-dev-environment-notes)。工程能跑起来之后，下一关是 **Git**，代码不在自己电脑上一份孤本，而在团队远程仓库里多人协作。2024 年 1 月，我第一次在正式项目里用 Git 提交图表页面的修改，这篇记录当时的命令、流程和踩过的坑。

## 图表模板项目里的 Git 长什么样

图表项目托管在团队 **Git 远程仓库**上，本地 \`git remote -v\` 会看到名为 \`origin\` 的远程地址由团队统一配置。

本地主要涉及两条分支：

- **\`develop\`**，团队日常集成分支，功能合并到这里
- **\`feature/charts\`**，个人功能分支，改图表组件时先在这里提交

课堂里学过 \`git add 与 commit\`，但真正进团队后才发现 **分支策略、远程同步、合并冲突** 才是日常。

## 第一天：克隆与首次运行

\`\`\`bash
# 克隆远程仓库到本地，地址向团队索取或查看文档
git clone <团队远程仓库地址>
cd <项目目录>

# 查看当前分支
git branch

# 安装依赖并启动，接 npm 笔记
npm install
npm run dev
\`\`\`

克隆后默认可能在 \`main\` 或 \`develop\`，前辈让我切到 \`develop\` 再拉最新代码，然后基于它建个人分支：

\`\`\`bash
git checkout develop
git pull origin develop

git checkout -b feature/charts
\`\`\`

\`git pull\` 等于 \`fetch\` 与 \`merge\` 两步合一，把远程别人已提交的更新同步到本地，**开工前必做**：

\`\`\`bash
git pull origin develop   # 等价于 fetch 与 merge
\`\`\`

## 日常开发循环

改完 \`chartA1.vue\` 或 \`nav-left-admin.vue\` 后，典型流程：

\`\`\`bash
# 1. 看改了哪些文件
git status

# 2. 看具体改动，提交前自查
git diff

# 3. 暂存要提交的文件，可指定路径，也可 . 表示全部
git add src/components/chartA1.vue

# 4. 本地提交，写清楚做了什么
git commit -m "feat: A1 水滴图支持年份切换与配色配置项"

# 5. 推到远程个人分支
git push origin feature/charts
\`\`\`

提交说明当时被要求尽量写清 **做了什么、为什么**，例如 \`fix: 修复 B1 液位图 resize 后比例错位\`，方便 Code Review。

## 合并到 develop

个人分支验证通过后，在 Git 网页端或本地合并进 \`develop\`具体以团队规范为准。我经历过两种方式：

1. **网页 Merge Request**，请前辈 Review 后点合并更安全
2. **本地合并**，前辈教过的命令：

\`\`\`bash
git checkout develop
git pull origin develop
git merge feature/charts
git push origin develop
\`\`\`

合并前一定要 \`pull\`，否则容易在过时基础上合并，产生多余冲突。

## 冲突：第一次慌张的时刻

改 \`chartB1.vue\` 时，我和另一位同学都动了同一段 \`setOption\` 配置。\`git pull\` 后出现：

\`\`\`
CONFLICT (content): Merge conflict in src/components/chartB1.vue
\`\`\`

文件里会出现冲突标记，大致长这样：

\`\`\`
<<<<<<< HEAD
  color: ['#0184f1', '#00d4ff']
=======
  color: ['#2563eb', '#38bdf8']
>>>>>>> feature/charts
\`\`\`

处理步骤：

1. 打开文件，**手动保留正确内容**，删掉 \`<<<<<<<\`、\`=======\`、\`>>>>>>>\` 标记
2. \`git add chartB1.vue\`
3. \`git commit\` 完成合并提交

教训：**高频共用的组件尽量分工**，约好谁改哪几个 chart 文件，比硬解冲突省事得多。

## 哪些文件不该提交

项目里 \`.gitignore\` 已经忽略了：

- \`node_modules/\`
- \`dist/\`构建产物，除非团队明确要求
- 本地 IDE 配置，\`.idea/\` 有时也会被忽略

我差点把整包 \`node_modules\` 加进去，\`git status\` 看到上万文件时要警惕，先查是不是该忽略。

## 实用查询命令

\`\`\`bash
# 最近提交记录
git log --oneline -10

# 某文件的历史
git log --oneline -- src/components/chartA1.vue

# 放弃工作区未暂存的修改，慎用
git checkout -- src/components/chartA1.vue

# 查看远程地址
git remote -v
\`\`\`

\`git log\` 在查这个配置项是谁改的时候很好用。

## 和 npm 环境如何配合

典型一天：

1. \`git pull\` 拉最新代码
2. 若 \`package.json\` 有变则 \`npm install\`
3. \`npm run dev\` 开发
4. \`git commit\` 与 \`git push\`
5. 合并前再 \`pull\` 一次

Git 管**代码版本**，npm 管**依赖版本**，两条线并行，项目才能稳定协作。

## git stash：临时切换任务

有几次前辈让我紧急改 A3 桑基图，手头 B1 的改动还没写完、不想半成品 commit。学了：

\`\`\`bash
git stash push -m "WIP B1 液位"
git checkout develop
git pull
# 改 A3、提交
git checkout feature/charts
git stash pop
\`\`\`

\`stash pop\` 可能产生冲突，但比乱 commit 再 revert 干净。项目后期我养成了 **下班前要么提交、要么 stash** 的习惯。

## Code Review 时我学到的点

合并请求里前辈常问三类问题，和 ECharts 无关但和协作有关：

- 这次改动是否只影响约定好的 chart 文件？
- \`package-lock.json\` 是否意外变更？
- 配置项默认值是否和设计稿一致？

提前在 \`git diff\` 里自查一遍，Review 通过率会高很多。

## 小结

Git 不是背命令，而是养成 **拉取、修改、自查、提交、同步** 的节奏。图表模板项目里二十多个 \`chart*.vue\` 文件、路由和 Mock 数据都在仓库里滚动迭代，我负责的 A1、B1 等页面能稳定演示，离不开这套基础协作流程。

标签：Git
`;export{n as default};
