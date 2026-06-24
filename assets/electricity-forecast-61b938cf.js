const n=`---
title: "电脉智绘·大创版"
description: "省级大创立项电量预测研判平台。负责前端工程、时序预测与异常筛查模块，整合数据录入、模型预测与图表看板全流程，形成可交付业务侧使用的研判系统。"
date: "2025-06-01"
gradient: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(37,99,235,0.38) 100%)"
status: "进行中"
category: "viz"
tier: "collab"
demoUrl: null
codeUrl: null
featured: true
cover: "/images/projects/electricity-forecast/cover.png"
coverLayout: wide
---

## 项目概述

电脉智绘大创应用版面向区域与行业用电量的预测和异常检测，和[论文版系统](/projects/electricity-forecast-paper)偏学术分析界面的定位不同。项目获大学生创新创业训练计划省级立项，我作为负责人完成申报、整体方案与前端核心开发，把数据总览、预测控制、多维图表、层级下钻和异常诊断串成一条可反复使用的分析链路。

系统对接多尺度 LSTM-KAN 预测服务，在同一屏联动历史电量、预测曲线、特征贡献与层级误差，支撑负荷研判与异常用电筛查。

## 仪表盘模块

### 数据总览

支持拉取服务端数据集或上传本地 CSV，展示文件名、时间范围、天数与特征数，作为每次分析会话的数据入口，并驱动右侧图表区刷新。

### 控制面板

预测天数可在 7、10、30、90 天间切换；节假日、工作日、风速、多日平均气温等特征可单独开关。点击生成后，预测区与层级结构会按新参数整体重算。

\`\`\`javascript
const payload = {
  duration: predictionDays.value,
  features: { holiday, workday, wind, mat },
  nodeId: selectedNode.value?.id
}
await axios.post('/api/predict', payload)
\`\`\`

### 预测数据时序视图

Tab 在数据呈现、预测数据与历史数据之间切换。主图展示工业用电等指标的历史预测、真实值与未来预测曲线；子图拆分重点样本与一般样本做对比；折线节点标注预测误差百分比，悬停可看 Tooltip。

### 总电量与预测解释

卡片汇总本周下周、本旬下旬、本月下月、本季度下季度等剩余与预测电量，单位万 kW·h，帮助理解不同时间尺度下的负荷变化。

### 电量层级结构

基于 D3.js 绘制可交互树图，按周、旬、月、季度切换层级。节点按预测误差着色，点击可下钻至工业、非工业及更细粒度节点，并与 Pinia 全局状态联动，驱动其他面板同步更新。

\`\`\`javascript
const treeLayout = d3.tree().size([height, width])
const root = treeLayout(d3.hierarchy(treeData))
svg.selectAll('.link')
  .data(root.links())
  .join('path')
  .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
\`\`\`

### 异常数据

自动汇总高误差节点，生成自然语言提示，表格列出节点名称与误差百分比，便于快速定位异常主体。

## 技术实现

可视化前端采用 Vue 3 与 Vite，CSS Grid 排布六大功能面板。D3.js 负责自定义时序图与层级树图，ECharts 辅助统计展示；Element Plus 与 Ant Design Vue 承担表单与消息反馈；Pinia 管理选中节点、时间区间与预测天数等跨组件状态。

模型侧通过 Axios 请求预测、层级与异常检测等 REST 接口，前端按节点 ID、时间窗口与特征配置组装参数。数据层支持 CSV 上传与服务端数据集拉取，树形层级与样本名录以 JSON 维护。

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr 1fr;
  gap: 12px;
}
\`\`\`

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Vue 3、Vite、Pinia | 组件化与状态管理 |
| 可视化 | D3.js、ECharts | 时序曲线、层级树、统计图 |
| UI | Element Plus、Ant Design Vue | 控制面板与交互反馈 |
| 请求 | Axios | 对接预测与异常检测 API |
| 工具 | Lodash.debounce | 高频交互防抖 |

## 核心实现

多 Store 协同是日常开发的重点。TreeNode_transfer、Interval、PredictionDuration、SelectedTimeStore 等模块串联选节点、改时间、重新预测与全屏刷新。

TimeSeriesView 用分层 SVG 画主图与子图，支持缩放、悬停与日期点击联动。HierarchyView 用 d3.tree 与 d3.link 绘制层级树，节点颜色映射误差热力。异常检测面板按接口返回的 error_percent 排序，并生成可读摘要文本。

\`\`\`javascript
export const useSelectedTimeStore = defineStore('selectedTime', {
  state: () => ({ start: null, end: null, nodeId: null }),
  actions: {
    setRange(start, end) {
      this.start = start
      this.end = end
    }
  }
})
\`\`\`

## 职责与成果

- 负责大创项目申报、技术路线设计与前端模块拆分
- 完成仪表盘布局、控制面板与 D3 时序和层级可视化核心开发
- 实现多面板状态联动与异常检测结果展示
- 作为论文系统前端，支撑团队学术成果发表

## 科研成果

作为论文系统前端开发，与团队以三作身份发表论文 *A hierarchical electricity consumption forecasting visualization system based on multi-scale LSTM-KAN model*，2026 年 2 月发表于 *Journal of Visualization*。

技术栈：Vue 3, Vite, Pinia, D3.js, ECharts, Element Plus, Ant Design Vue, Axios, Python
`;export{n as default};
