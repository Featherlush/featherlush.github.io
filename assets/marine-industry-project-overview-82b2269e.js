const n=`---
title: "海洋产业课题两条线怎么拆"
excerpt: "2024 年底同时接触论文时空面板和统计平台图表页，两个仓库的分工与时间线一次说清楚。"
category: "成长随笔"
categoryId: "career"
date: "2024-11-18"
author: "徐宁"
project: marine-industry
---

2024 年底前后，我参与海洋产业相关的产学研可视化课题。同一主题下其实有 **两个仓库、两种交付形态**，刚接入时容易混在一起，这篇先把地图画清楚。

## 两个仓库各做什么

| 仓库代号 | 作用 | 我负责的部分 |
|----------|------|----------------|
| 时空关联前端 | 论文配套时空关联可视化 | 整页前端、D3 图表、部分 Python 预处理 |
| 智能统计前端 | 业务系统里的可视化模块 | 统计仪表盘路由下的 ECharts 页；Spring Boot 后端非本人开发 |

论文系统偏 **研究制图**，投入产出网络、莫兰指数、中心度排名，数据多是预处理好的 JSON。

统计平台偏 **多表核算与可视化**，季度指标、市县报表、产业类目配置；我接触的图表页是把聚合结果 **读出来画成仪表盘**。

## 技术栈对比

**论文系统**，Vue 3、Vite、D3.js、Element Plus、Vuex。没有接后端接口，状态在 Vuex，静态资源在 \`src/assets/\`。

**统计前端**，Vue 3、Vite、Vue Router、Pinia、ECharts 5、Element Plus、Axios。图表页通过开发代理访问 Spring Boot 后端接口。

两条线的入口差异可以概括为：

\`\`\`javascript
// 论文系统：改选项等于换本地 JSON
store.commit('setSharedYear', 2007)
import linkData from '@/assets/link/link_07某市.json'

// 统计平台：改选项等于带 query 发 HTTP
const query = { year: 2023, quarter: 2, region: '浙江省' }
await getEchartsData(query)
\`\`\`

## 时间线上的感受

- 先熟悉论文面板布局与 D3 绑定方式，理解一屏多图共享年份
- 再进入统计平台，重点是 **年、季、产业、地区** 四个维度与多块 ECharts 同步刷新
- Java 端我不写代码，但图表联调必须知道报表 Controller 暴露了哪些 GET 接口

## 与纯 ECharts 模板项目的差异

课题组另一套图表模板仓库是 **单页多 chart 文件、ECharts 为主**。本课题里：

- 论文线大量 **D3 与静态 JSON**，更像定制信息图
- 统计线是 **ECharts 地图、饼图、瀑布与折线**，且强依赖后端聚合

两套栈在同一段时间并行，能更清楚地区分 **静态制图** 与 **接口驱动的仪表盘** 两种交付形态。

## 延伸阅读

按技术合集阅读，日期由早到晚大致如下。

- [Vue.js 手记](/blog/series/vue-notes)，论文面板 Vuex 布局，11 月下旬
- [D3.js 手记](/blog/series/d3-notes)，Python 预处理与 JSON 管线，12 月上旬
- [ECharts 手记](/blog/series/echarts-notes)，统计仪表盘图表页，12 月中旬
- [Spring Boot 手记](/blog/series/spring-boot-notes)，后端结构梳理，联调视角，12 月下旬

标签：海洋产业, Vue.js, D3.js
`;export{n as default};
