const e=`---
title: "个人站点里的 Vue 3 组合式 API 实践"
excerpt: "从博客筛选、滚动入场到目录悬浮，记录搭建个人介绍站点时用 composable 拆分页面逻辑的方式与取舍。"
category: "前端开发"
categoryId: "frontend"
date: "2024-05-12"
author: "徐宁"
series: vue-notes
---

课题组图表模板项目阶段主要在 Options API 里写 \`data、methods、watch\`；2024 年 5 月搭个人介绍站点时全面改用 **\`<script setup>\` 与 composable**。这篇不是语法科普，而是记录站点里几个真实模块怎么拆、为什么拆，以及哪些地方我刻意没有过度抽象。前置环境见 [npm 笔记](/blog/npm-dev-environment-notes)、[Git 协作篇](/blog/git-workflow-learning-notes)；ECharts 侧栏路由那套写法见 [liquidFill 入门篇](/blog/echarts-liquidfill-learning)。

## 为什么用组合式 API 搭这个站

个人站点的页面类型多，全屏海报首页、时间轴式博客、项目仪表盘详情、Markdown 长文。如果用 Options API，很容易出现同一个 \`setup\` 里塞了筛选、滚动、路由监听的胖组件。组合式 API 的好处在于：

- **按能力拆文件**，博客筛选进 \`useBlogFilter\`，滚动入场进 \`useScrollReveal\`
- **列表页和详情页共享筛选状态**，\`Blog.vue\` 与 \`BlogPost.vue\` 都调用同一个 composable，侧边栏分类、合集 pill 行为一致
- **副作用边界清晰**，目录悬浮、移动端 sheet 开闭、body 滚动锁定各自在组件或 composable 里收尾

和课堂作业相比，真正的难点不是 \`ref\` 和 \`computed\`，而是 **什么时候值得抽 composable**。

## 博客筛选：useBlogFilter

博客列表支持搜索、分类、标签、归档月份、系列合集五种条件。全部写进 \`Blog.vue\` 会超过两百行，于是收成 \`useBlogFilter\`：

\`\`\`javascript
export function useBlogFilter(posts = blogPosts) {
  const searchQuery = ref('')
  const activeCategory = ref('all')
  const activeTag = ref('')
  const activeMonth = ref('')
  const activeSeries = ref('')

  const filteredPosts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const filtered = posts.filter((post) => {
      if (activeCategory.value !== 'all' && post.categoryId !== activeCategory.value) return false
      if (activeTag.value && !post.tags.includes(activeTag.value)) return false
      if (activeMonth.value && !post.date.startsWith(activeMonth.value)) return false
      if (activeSeries.value && post.seriesId !== activeSeries.value) return false
      if (!q) return true
      const haystack = [post.title, post.excerpt, post.category, post.seriesTitle, post.tags.join(' ')]
        .join(' ').toLowerCase()
      return haystack.includes(q)
    })

    if (activeSeries.value) {
      return [...filtered].sort(
        (a, b) => a.date.localeCompare(b.date)
      )
    }
    return filtered
  })

  // setCategory / setTag / setSeries / clearFilters ...
  return { searchQuery, activeCategory, filteredPosts, hasFilters, /* ... */ }
}
\`\`\`

几个 deliberate 设计：

1. **合集筛选时按发布日期排序**从早到晚，与合集页、文末导航的阅读顺序一致
2. **\`setSeries\` 点击同一 pill 会取消筛选**，和标签筛选行为统一
3. **默认注入 \`blogPosts\`**，详情页侧边栏也能筛，但不会改列表数据源

页面层只负责把返回值传给 \`BlogLayout\` 和 \`BlogSidebar\`，模板里几乎不出现筛选细节。

## 滚动入场：useScrollReveal 与动态列表

全站大量元素带 \`.reveal\` class，依赖 \`IntersectionObserver\` 做淡入。问题在于 **博客筛选后 DOM 会重建**，如果只 \`onMounted\` 观察一次，新文章会一直 \`opacity: 0\`。

composable 因此暴露 \`refresh()\`，在视口内的元素直接加 \`revealed\`，其余交给 Observer：

\`\`\`javascript
const refresh = () => {
  nextTick(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
      if (isInViewport(el)) {
        el.classList.add('revealed')
        return
      }
      observer.observe(el)
    })
  })
}
\`\`\`

\`Blog.vue\` 里 \`watch(filteredPosts, () => refresh())\`，切换合集后列表能正常淡入。这是组合式 API 和页面级 watch 配合的典型场景，composable 提供能力，页面决定何时刷新。

## 内容与路由：loader 而不是写进组件

博客文章、项目详情来自 \`content/blog/*.md\` 与 \`content/projects/*.md\`，构建期用 \`import.meta.glob\` 解析 frontmatter 和 Markdown 正文。页面组件只做：

\`\`\`javascript
const post = computed(() => getPostById(route.params.id))
const outlineHeadings = computed(() => post.value?.headings ?? [])
\`\`\`

**不在 Vue 组件里硬编码文章列表**，新增 markdown 文件即自动出现在博客时间轴。阅读时长用正文估算，而不是手写 frontmatter，减少维护字段，也避免字段缺失导致排序报错。

这类数据在 loader、展示在 view 的分层，和 composable 拆交互逻辑是同一思路，组件变薄，可读性更好。

## 博客详情：目录与合集导航拆组件

详情页左侧仍是筛选侧边栏，**目录移到右侧**，桌面端用 \`ContentOutline\` Teleport 固定悬浮，手机端圆形 FAB 与底部 sheet，与项目详情页同一套交互，只换选择器：

\`\`\`vue
<ContentOutline
  :headings="outlineHeadings"
  title="目录"
  anchor-selector=".blog-outline-anchor"
  content-selector=".blog-post-page .article-content"
  related-selector=".blog-post-page .article-related"
  page-selector=".blog-post-page"
/>
\`\`\`

文末 **合集导航** 独立为 \`BlogSeriesNav\`，相邻篇跳转与中间弹出篇目列表。组件内部自己 \`computed\` 邻居文章和系列元数据，页面只传 \`post\` 对象。若把这两块都写进 \`BlogPost.vue\`，单文件会难以维护。

## 什么时候不抽 composable

站点里也有一些逻辑我刻意留在组件内：

- **仅出现一次的页面布局**，例如 \`Home.vue\` 海报视差，直接 \`useParallax\` 在页面调用即可，不再包一层
- **强依赖 DOM 结构的定位**，\`ContentOutline\` 的 \`updateDesktopPosition\` 与具体页面选择器绑定，不适合再抽象成通用 composable
- **纯展示型 computed**，例如 \`relatedPosts\` 取同分类三篇，十行以内留在 \`BlogPost.vue\` 更直观

经验法则：**第二次出现相似需求时再抽**；第一次写清楚比 premature abstraction 更重要。

## 与 TypeScript 迁移的取舍

个人站目前是 JavaScript。若迁移 TypeScript，composable 的返回值类型会成为模块契约，例如 \`useBlogFilter\` 返回的 \`filteredPosts\` 元素类型与 \`blog.js\` loader 对齐，模板里也能获得更完整的类型检查。

## 个人站与图表模板项目的对比

| 维度 | 图表模板项目 | 个人介绍站点 |
|------|-----------------|--------------|
| API 风格 | Options API | \`<script setup>\` 与 composable |
| 状态复杂度 | 单页多 chart 实例 | 多页面共享筛选、目录 |
| 构建 | Vite 5 | Vite 与 Tailwind |
| 内容 | 硬编码在 .vue | Markdown 与 loader |

从 Options 切到组合式，最大的心态变化是 **不再把所有方法堆进 \`methods\`**，而是问这段逻辑会不会在第二个页面出现。博客筛选、滚动入场、目录定位都答会，所以值得抽文件。

## 小结

组合式 API 在这个站点里解决的是 **多页面共享行为** 和 **长页面逻辑收纳** 两类问题，而不是替代 Options API 那么简单。\`useBlogFilter\`、\`useScrollReveal\`、内容 loader、目录与合集组件各司其职，页面本身主要负责布局和把能力串起来。

如果你也在做个人站或文档站，建议从筛选、滚动、长文导航这三块先抽 composable，往往比一上来建万能 hooks 库更踏实。

标签：Vue.js
`;export{e as default};
