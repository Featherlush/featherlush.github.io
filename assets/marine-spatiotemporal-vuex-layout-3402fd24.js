const n=`---
title: "论文系统一屏布局与 Vuex 联动"
excerpt: "Ocean_Spatiotemporal 用 CSS Grid 排六块视图，sharedYear 和 flowOption 驱动网络图、地图和莫兰表同步换数。"
category: "前端开发"
categoryId: "frontend"
date: "2024-11-25"
author: "徐宁"
project: marine-industry
series: vue-notes
---

时空关联论文前端的 \`App.vue\` 没有路由，**一整屏就是一个分析工作台**。左侧配置、中间网络与时空树、右侧莫兰与地图，全部挂在同一套 Vuex 状态上。课题总览见 [海洋产业两条线](/blog/marine-industry-project-overview)。

## Grid 分区

\`\`\`css
.app {
  display: grid;
  grid-template-columns: 22% 40% 38%;
  grid-template-rows: 55% 45%;
  grid-template-areas:
    "left center-top right-top"
    "left center-bottom right-bottom";
}
\`\`\`

| 区域 | 组件 | 职责 |
|------|------|------|
| left | \`contorl.vue\` | 省份、产业排名表、节点勾选 |
| center-top | \`net.vue\` | IOT 产业关联 **网络图** |
| center-bottom | \`datatree.vue\` | 重点城市各年份 **时空树** |
| right-top | \`molan.vue\` | **莫兰指数** 散点 与 表格 |
| right-bottom | \`Map.vue\` | 沿江省份 **底图** |
| top绝对定位 | \`timeline.vue\` | 年份时间轴 |

顶部时间轴改年份后 \`store.commit('setSharedYear', year)\` 到 各子组件 \`mapState\` 或 \`watch\` 后重绘。

## Vuex 里只有两个全局量

\`\`\`javascript
state: {
  sharedYear: 2002,
  flowOption: '1',  // 流入与流出
},
\`\`\`

看起来简单，但 **六个视图都读这两个字段**。改 \`flowOption\` 时，\`molan.vue\` 切换流入 或 流出 JSON，\`Map.vue\` 跟着换配色逻辑。

实践建议：论文类面板不要过早拆多个 store module，**年份 与 流向** 往往就是最小够用集。

## 左侧控制区在干什么

\`contorl.vue\` 三块：

1. **配置项选择**，Element \`el-select\`
2. **省份调节**切换当前分析省份，联动排名 JSON
3. **产业排名表**，总度中心度、中介中心度、接近中心度，带 checkbox **高亮网络节点**

表格数据来自 \`assets/rank/\` 下按省份与年份后缀命名的 JSON，与 \`centrality/\`、\`link/\` 目录一一对应。

## D3 与 Vue 生命周期

每个图表组件典型流程：

1. \`mounted\` 里 \`d3.select(ref)\` 创建 SVG
2. \`computed\` 与 \`watch\` 监听 \`sharedYear\`、\`flowOption\`
3. 数据变更时 **清空再画** 或更新 selection模板项目里多为清空重绘，好理解

\`net.vue\` 还会根据下拉档位高、较高等过滤连边，属于 **同一数据集上的交互筛选**，不是换文件。

## 和统计平台的差异

论文系统：**无 axios**，改选项 = 换本地 JSON 与 改 Vuex。

统计平台：改选项 = **四个 query 字段**与多次 HTTP。统计侧细节见 12 月中旬的 [ECharts 仪表盘篇](/blog/marine-statistics-echarts-dashboard)。

标签：Vue.js, D3.js, 数据可视化
`;export{n as default};
