const n=`---
title: Pinia 与 composable 在个人站里的分工
excerpt: 主题切换、博客筛选、电脉智绘多面板联动，什么时候进 Store，什么时候留在 composable。
category: 前端开发
categoryId: frontend
date: 2025-04-15
author: 徐宁
series: vue-notes
---

Vue 3 生态里状态管理不止 Pinia 一条路。个人站用 composable 管博客筛选和主题，电脉智绘论文版用多个 Pinia Store 驱动七块 D3 视图。这篇对比同一套问题两种放法，方便以后新项目选型。组合式拆分见 [组合式 API 篇](/blog/vue3-composition-patterns)，论文版总线见 [Grid 篇](/blog/electricity-paper-d3-dashboard-grid)。

## 用 composable 够用的场景

满足大部分条件即可：

1. 状态只在一条用户路径里用，例如博客列表加详情侧栏共用筛选，但没有第三个页面要写同一套筛选
2. 字段少、无持久化，searchQuery、activeCategory 等，刷新可丢
3. 无跨组件事件总线，父子 props 或同一 composable 实例即可

个人站 useBlogFilter 把五个 ref 和 filteredPosts 包在一起，列表页创建状态，通过 props 传给 BlogLayout。详情页若也要侧栏筛选，可再调一次 useBlogFilter，接受各页面独立实例或后续再升 Pinia。

useTheme 同理，一个 ref 表示 light 或 dark，挂 document.documentElement，不需要 Store。

## 值得上 Pinia 的场景

电脉智绘论文版符合这些特征：

| 特征 | 表现 |
|------|------|
| 多视图联动 | 时序、层级、相关矩阵同时响应时间窗 |
| 状态跨组件深 | Grid 七块面板互不父子，靠 Store 广播 |
| 动作多 | 拉预测、切异常、重绘 D3 |
| 需要 DevTools 追踪 | 调试谁改了 windowEnd |

forecastStore、hierarchyStore 等按业务域切，而不是按组件切一个巨型 store。

## 决策表

| 问题 | composable | Pinia |
|------|------------|-------|
| 两三个 ref | 是 | 否 |
| 五个以上页面共享且要强一致 | 否 | 是 |
| 要持久化到 localStorage | 都可，composable 更轻 | 配插件 |
| 图表联动重绘 | 勉强 | 是 |
| 单元测试 mock | 中等 | 方便 |

经验是第二次出现非父子组件要同一状态时考虑 Pinia。

## 与 Vuex 旧项目的对比

究理 APP 用 Vuex 管登录 token 与购物车式状态，移动端壳层习惯集中式 mutation。Vue 3 新项目更推荐 Pinia，无 mutations，action 里直接改 state，TypeScript 友好，按 store 文件拆分，接近 composable 模块化。

迁移成本在 modules 边界是否清晰，不在 API 名字差异。

## 个人站为何暂不上 Pinia

package.json 里虽有 Pinia 依赖，个人站运行时几乎无全局 store。原因：

- 内容来自 manifest，不是前端维护的长列表 state，主题与筛选用 composable 加 DOM 属性即可，减少为架构而架构

若以后做阅读进度、收藏文章等跨页功能，会新增 useReadingStore 而不是把逻辑塞进 useBlogFilter。

## 小结

composable 管页面级交互状态，Pinia 管多面板业务总线。个人站走前者，论文仪表盘走后者，都是 Vue 3 合理用法。选型时先看联动范围，再看持久化与调试需求，而不是默认上 Store。

标签：Vue.js, Pinia
`;export{n as default};
