const n=`---
title: "海洋产业项目"
description: "海洋时空关联学术配套平台。基于 D3.js 与 ECharts 开发产业关联网络、莫兰散点与多维统计仪表盘，实现时空联动筛选与可复用可视化组件库产出。"
date: "2024-12-01"
gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.35) 100%)"
status: "已完成"
category: "viz"
tier: "collab"
demoUrl: null
codeUrl: null
featured: false
---

## 项目概述

2024 年底前后，我参与海洋产业相关的产学研可视化课题，工作拆成两条线。时空关联方向负责论文配套的前端页面、D3 图表、交互逻辑与部分 Python 数据预处理；智能统计平台方向只负责可视化图表路由页，Spring Boot 后端由团队其他同学开发。

整体围绕产业关联、区域统计与论文制图，我把算法和统计结果做成可交互的 Web 界面。

系列笔记见 [Vue.js 手记](/blog/series/vue-notes)、[D3.js 手记](/blog/series/d3-notes)、[ECharts 手记](/blog/series/echarts-notes)、[Spring Boot 手记](/blog/series/spring-boot-notes)。

## 时空关联论文系统

面向论文中的产业投入产出与空间关联分析，用 Vue 3、Vite、D3.js、Element Plus 与 Vuex 搭了一屏式分析面板，数据以预处理后的 JSON 驱动，centrality、rank、link、flow 等目录按省份与年份拆分。

### 页面布局

顶部时间轴切换 2002、2007、2012、2017 等年份节点，与全局 sharedYear 联动。左侧控制区配置省份、产业排名表与总度中心度、中介中心度、接近中心度，支持勾选高亮网络节点。中部上方是 IOT 产业关联网络图，D3 力导向展示节点与连边；中部下方是时空树图，以中心城市连接各年份节点。右侧上方是莫兰指数散点与表格，支持总流入与总流出切换；右侧下方是区域地图，D3 绘制底图并与流向选项联动。

\`\`\`javascript
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2))
\`\`\`

### 数据处理

用 Python 脚本从 Excel 投入产出表抽取矩阵，生成节点流入流出与连边 JSON，前端直接 import。按省份与年份批量产出 ranked 与 centrality 系列文件，前端按 Vuex 状态切换加载。

\`\`\`python
links = [
  {"source": row["from"], "target": row["to"], "value": row["flow"]}
  for _, row in iot_df.iterrows()
]
json.dump(links, open(f"flow/{year}.json", "w"))
\`\`\`

### 技术要点

多组件共享 Vuex 年份、流向与选中省份，地图、网络图与莫兰图同步刷新。D3 与 Vue 生命周期配合，mounted 里初始化 SVG，数据变更时重绘或更新。Element Plus 下拉、表格与自定义 D3 视图混排，适配论文制图所需的参数切换。

\`\`\`javascript
watch(() => store.state.sharedYear, year => {
  loadNetworkData(year)
  loadMoranData(year)
})
\`\`\`

## 智能统计平台图表页

统计平台前端对接 Spring Boot 后端模块，我主要负责可视化图表路由整页及子图表组件。

### 图表页结构

页面用 CSS Grid 排布仪表盘，上方筛选条与左侧大地图、右侧双饼图、下方瀑布图与堆叠折线图并列排布。

年份、季度、产业类型三级下拉联动；点击地图地市后更新 region 并重新拉取全页数据。

| 组件 | 作用 |
|------|------|
| map.vue | 省级地图，注册 GeoJSON，按接口返回值着色 |
| PieChart.vue | 双饼图，产业结构对比与一二三产业拆分 |
| AccumulatedWaterfallChart.vue | 本年度与上年累计瀑布图 |
| StackedLine.vue | 分季度堆叠折线图 |

通过 axios 调用 REST 接口，切换年、季、地区与产业时 initData 并行请求，统一驱动地图与四块图表。地图数据为空时用 ElMessage 提示，避免空白图误导阅读。

\`\`\`javascript
async function initData() {
  const [mapRes, pieRes, waterfallRes, lineRes] = await Promise.all([
    axios.get('/api/chart/map', { params: query }),
    axios.get('/api/chart/pie', { params: query }),
    axios.get('/api/chart/waterfall', { params: query }),
    axios.get('/api/chart/stacked-line', { params: query })
  ])
}
\`\`\`

同仓库内还有报表审核、文件上传与产业类目配置等页面，非我主要负责；联调时主要保证图表页与后端字段、季度枚举一致。

## 个人收获

第一次在同一课题下同时用 D3 与 ECharts 两套可视化栈。论文系统侧重静态 JSON 与状态联动；统计平台侧重多接口并行与地图点击驱动全局筛选。前后端以图表页为边界约定 query 字段，减少联调偏差。

技术栈：Vue 3, Vite, D3.js, Element Plus, Vuex, Python, Vue Router, Pinia, ECharts, Axios
`;export{n as default};
