const n=`---
title: Markdown 长文的锚点目录实现
excerpt: markdown-it-anchor 生成 h2 与 h3 锚点，extractHeadings 供目录数据，ContentOutline 负责桌面悬浮与移动端 sheet。
category: 前端开发
categoryId: frontend
date: 2025-06-25
author: 徐宁
series: vue-notes
---

博客与项目详情常有数千字 Markdown，读者需要跳章节而不是只靠滚动条。个人站用 markdown-it-anchor 给标题加 id，extractHeadings 抽出目录数据，ContentOutline.vue 负责桌面悬浮与手机底部 sheet。组合式拆分见 [Vue 3 组合式篇](/blog/vue3-composition-patterns)；Markdown 管线见 [个人站框架篇](/blog/personal-site-framework-overview)。

## 管线分工

\`\`\`
content/*.md
  → splitFrontmatter
  → extractHeadings(body)
  → renderMarkdown(body)
  → ContentOutline(headings)
\`\`\`

列表页只读 manifest，不解析正文标题；详情页加载全文后才渲染目录，避免六十多篇标题全部进首包。

## 锚点 markdown-it-anchor

src/lib/markdown.js：

\`\`\`javascript
md.use(markdownItAnchor, {
  slugify,
  level: [2, 3],
})
\`\`\`

只对二级与三级标题生成锚点，与目录层级一致。slugify 与 extractHeadings.js 共用同一函数，保证目录里的 id 与 DOM 里标题 id 一致。若两处算法不同，点击目录会跳错或无效。

html false 关闭 Markdown 内嵌 HTML，减少 XSS 面；linkify true 自动识别 URL。

## extractHeadings

在原始 Markdown 字符串上用正则抓二级与三级标题，不依赖已渲染 HTML：

\`\`\`javascript
headings.push({ id: slugify(text), text: text.trim(), level: 2 })
\`\`\`

优点是不必等 DOM；缺点是标题里若有内联格式需与渲染结果一致处理。本站标题多为纯文本，足够用。

## ContentOutline 行为

### 桌面端

- Teleport to body，避免父级 overflow 破坏 fixed 定位
- 根据 anchorSelector 对齐宽度与 left，ResizeObserver 监听布局变化
- 滚动到正文区且未进入相关项目区块时显示，离开正文则隐藏

### 移动端

- 右下角 FAB 打开底部 sheet，带 dialog 语义与 aria-expanded
- 打开时锁定 body 滚动，点击目录项后关闭 sheet

### 当前章节高亮

updateActiveHeading 用导航栏高度 --nav-total-height 作探针，遍历标题 getBoundingClientRect top，取最后一个 top 小于探针的 id 为 activeId。与 html scroll-padding-top 配合，锚点跳转不会被顶栏挡住。

## 博客与项目的差异

BlogPost.vue 传入 outlineHeadings，可过滤或映射字段。ProjectDetail.vue 直接用 project.headings。组件通过 props 定制选择器：

| prop | 默认用途 |
|------|----------|
| anchorSelector | 对齐侧栏列 |
| contentSelector | 正文 panel，控制何时显示桌面目录 |
| relatedSelector | 相关笔记区块，滚到此处隐藏目录 |
| pageSelector | 页面根，参与 ResizeObserver |

同一组件服务两种详情页，避免复制粘贴两套目录逻辑。

## 与 BlogSeriesNav 的关系

系列底部切换文章负责横向换篇；ContentOutline 负责篇内章节。两者都需夜间变量，见 [夜间模式篇](/blog/site-dark-mode-theme-tokens) 里 glass-bg 与 card-bg 验收项。

## 扩展时注意

1. 若支持四级标题，同步改 anchor level 与 extractHeadings
2. 中文标题 slug 需稳定，避免纯标点 id 冲突
3. 目录项过多时 panel-body 已设 max-height 与内部滚动，勿再叠双层滚动

## 小结

长文目录三件套是统一 slugify、anchor 只开 h2 与 h3、ContentOutline 分桌面与移动两套交互。数据在 Markdown 解析阶段产出，UI 用 Teleport 与滚动探针，不污染 Markdown 组件本身。

标签：Vue.js, 个人网站, 工程化
`;export{n as default};
