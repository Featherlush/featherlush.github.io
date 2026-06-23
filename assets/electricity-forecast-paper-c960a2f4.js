const n=`---
title: "电脉智绘·论文版"
description: "论文配套可视化系统，围绕 MS-LSTM-KAN 多尺度预测做特征相关矩阵、层级花瓣图与四维误差评估，支撑 Journal of Visualization 见刊论文的图表复现。"
date: "2025-05-01"
gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(37, 99, 235, 0.36) 100%)"
status: "已完成"
category: "viz"
tier: "collab"
demoUrl: null
codeUrl: null
featured: true
cover: "/images/projects/electricity-forecast-paper/cover.png"
coverLayout: wide
---

## 项目概述

电脉智绘论文版面向学术论文 [*A hierarchical electricity consumption forecasting visualization system based on multi-scale LSTM-KAN model*](https://link.springer.com/article/10.1007/s12650-026-01110-y) 的前端可视化系统。我在 2025 年 4 至 5 月完成仪表盘与核心 D3 组件；论文于 2026 年 2 月见刊于 [*Journal of Visualization*](https://link.springer.com/article/10.1007/s12650-026-01110-y)。与[大创应用版](/projects/electricity-forecast)侧重业务操作面板不同，论文版强调模型可解释性、特征关联分析与多尺度误差评估，界面布局与交互服务于论文插图与实验复现。

我担任论文系统前端开发三作，负责仪表盘整体布局、D3 可视化组件与 Pinia 状态联动。

相关笔记见 [D3.js 手记](/blog/series/d3-notes) 中标记 electricity-forecast-paper 的篇目。

## 与大创版的区别

| 维度 | 论文版 | 大创应用版 |
|------|--------|------------|
| 目标 | 论文实验展示、模型解释与评估 | 大创立项产品化交互 |
| 控制区 | 数据集上传、模型选择与预测时长滑块 | 预测天数、特征开关与生成数据 |
| 特征分析 | Feature Panel 卡片与 Feature Correlation 矩阵 | 总电量指标卡为主 |
| 时序视图 | 历史预测曲线与日历热力格 | 数据呈现、预测与历史 Tab 切换 |
| 层级视图 | 花瓣环图、树形结构与图例 | D3 树图与周旬月季切换 |
| 右侧面板 | Evaluation View 四维误差与异常表 | 异常数据面板为主 |
| 部署 | 支持 gh-pages 静态发布 | 对接大创演示后端 |

## 论文系统模块

### Control Panel 数据与模型控制

上传数据集后展示文件名、时间范围、样本数与特征数；支持 MS-LSTM-KAN 等多尺度预测模型选择；预测时长滑块覆盖 7、10、30、90 天。

### Feature Panel 特征面板

以卡片展示 Week、Work、MAT、Holiday 等特征贡献，数值与趋势箭头直观对比影响方向，支持点选特征组合自定义预测输入。

### Feature Correlation 特征相关矩阵

D3 绘制扇形相关矩阵，对角线直方图与非对角散点并用红蓝配色表示正负相关，辅助理解特征与用电量的耦合关系。

\`\`\`javascript
const corrScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1])
cells.attr('fill', d => corrScale(matrix[i][j]))
\`\`\`

### Time Series View 时序预测

折线对比历史真实值、历史预测值与未来预测值；悬停 Tooltip 展示日期、数值与误差百分比；底部日历热力格编码日粒度用电水平与预测区间。

### Hierarchy View 层级结构

树形层级从工业与非工业下钻至重点与一般叶子节点；花瓣环图外环表误差、内环表用电贡献；节点弹窗展示各特征贡献占比。

\`\`\`javascript
drawPetalRing(svg, node, {
  outer: d => d.errorPercent,
  inner: d => d.contribution,
  colors: petalColorScale
})
\`\`\`

### Evaluation View 误差评估

按 MAE、MSE、RMSE、MAPE 四维指标，在周、旬、月、季多时间尺度上对比；色带编码误差大小，快速识别模型薄弱尺度。

### Anomaly View 异常检测

按节点汇总预测误差，条形对比预测值与真实值，表格排序展示高误差分区。

## 技术实现

论文可视化前端用 Vue 3、Vite 与 Pinia，14 列 CSS Grid 排布仪表盘。D3.js 承担时序图、相关矩阵、层级树、花瓣环图与评估条形图；Element Plus 与 Ant Design Vue 处理上传与表单交互；drawTreeNode、drawPetalRing 等工具模块拆分绘图逻辑。

Axios 对接 Python 预测服务，按选中节点、时间窗与特征子集请求 MS-LSTM-KAN 结果。

\`\`\`javascript
await axios.post('/api/ms-lstm-kan', {
  model: 'MS-LSTM-KAN',
  horizon: duration.value,
  features: selectedFeatures.value,
  nodeId: activeNode.value
})
\`\`\`

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Vue 3、Vite、Pinia | 论文仪表盘与状态管理 |
| 可视化 | D3.js、d3-sankey、d3-shape | 矩阵、树图、花瓣图、评估图 |
| UI | Element Plus、Ant Design Vue | 上传、消息、表单 |
| 发布 | gh-pages | 论文配图在线演示 |

## 职责与成果

- 实现论文全部可视化面板，保证与论文插图一致的可读布局
- 开发特征相关矩阵、花瓣层级图与多尺度误差评估等核心 D3 组件
- 打通选特征、生成预测、层级下钻、误差评估与异常排序的分析链路
- 支撑团队论文发表于 *Journal of Visualization*

## 科研成果

作为论文系统前端开发，与团队以三作身份发表论文 [*A hierarchical electricity consumption forecasting visualization system based on multi-scale LSTM-KAN model*](https://link.springer.com/article/10.1007/s12650-026-01110-y)，2026 年 2 月发表于 *Journal of Visualization* 第 29 卷，391–406 页。

- 开发周期：2025 年 4 至 5 月
- 见刊时间：2026 年 2 月 19 日网络首发

技术栈：Vue 3, Vite, Pinia, D3.js, ECharts, Element Plus, Ant Design Vue, Axios, MS-LSTM-KAN
`;export{n as default};
