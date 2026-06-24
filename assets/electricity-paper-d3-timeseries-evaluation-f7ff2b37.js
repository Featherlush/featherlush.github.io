const e=`---
title: Time Series View 与 Evaluation View 开发手记
excerpt: 论文插图 d 与 f，Time Series View 的历史与预测分界、准星交互与日历格，以及 Evaluation View 的居中宽度条矩阵。
category: 前端开发
categoryId: frontend
date: 2025-05-15
author: 徐宁
project: electricity-forecast-paper
series: d3-notes
---

2025 年 5 月论文版收尾时，**Time Series View** 与 **Evaluation View** 把 **时间** 和 **误差** 两条叙事线补齐。两者都不是单张标准图，时序是 **上下双外壳**，折线区与日历格区，评估是 **band 矩阵外壳 与 格内居中宽度条**。与 Feature Correlation、Hierarchy 一样，核心难点在于 **分区几何、局部比例尺、跨 Store 重绘**，而不是 D3 入门示例里的单折线。前置见 [Grid 篇](/blog/electricity-paper-d3-dashboard-grid)、[相关矩阵篇](/blog/electricity-paper-d3-correlation-matrix)、[Hierarchy 篇](/blog/electricity-paper-d3-petal-hierarchy)。

## 一、Time Series View 组件分层

| 分区 | 职责 | 关键实现 |
|------|------|----------|
| 图例区 | 论文配图说明len1：len5 位图 | Vue 模板，非 D3 |
| 上层 \`top-chart\` | 历史与预测折线与交互 | 单 SVG：三线、\`divisionX\` 分界、overlay 准星、HTML tooltip |
| 下层 \`bottom-charts\` | 日历热力格 | 独立 SVG：7 列 × 动态行，蓝与橙双色系，中心日黄高亮 |

上下 **不共用同一个 xScale 实例**，但共用 **同一段 merged 日期与用量数组**，读者用眼睛做纵向对齐，而不是共享轴刻度线下区甚至没有连续 x 轴，只有格块。

### 1.1 上层，三线 与 历史与预测分界

\`createLineChart\` 在同一坐标系画 HisTrue、HisPred、Pred 三条序列。\`predictionDuration\`7/10/30/90决定 **历史截取长度** 与 **未来延伸长度**。分界日期 \`divisionDate\` 取历史末点，\`divisionX = xScale(divisionDate)\` 画黑色虚线竖界。

**设计思考：分界是叙事锚点**，论文关心模型从今天往后的预测是否可信，竖线左侧是已知世界，右侧是模型外推。三线共用 \`yScale(extent 合并)\`，避免预测线因独立纵轴被视觉抬高或压低。

\`drawDivision\` 在分界处为 HisTrue 末点与 Pred 首点各画 **4px 圆点**，强化两线在界处应对齐比较。误差文案 \`The error is X%\` 放在 **\`height * 0.9\` 底部** 而非分界旁，窄格子里与折线重叠；改底部横排后，异常时粉红字与 \`abnormal\` 字段联动。

### 1.2 十字准星，左右区不同 series

\`\`\`javascript
overlay.on('mousemove', (event) => {
  const x0 = xScale.invert(d3.pointer(event)[0])
  const i = bisectDate(expandedDates, x0, 1)
  const isLeft = currentX < divisionX
  // 左侧：HisTrue + HisPred 圆点；右侧：Pred 圆点
})
\`\`\`

**障碍**，不是三条线一起跟，预测区没有真实值，左侧跟两条历史线即可；若在右侧仍显示 HisTrue 圆点，读者会以为未来有观测。\`divisionX\` 比较的是 **像素 x**，不是日期索引。

\`expandedDates\` 与 \`bisectDate\` 保证 **折线连续段与 bisect 索引一致**，缺这一步时，准星会跳到错误日期，tooltip 数字对不上格。

点击 overlay 写入 \`selectedTimeStore\`，驱动评估区按 **选中末日** 拉 \`/getPeriodErrors\`。

**Tooltip 大偏移**，\`tooltipStyle\` 里 \`left = x：450\` 是硬编码，因为时序占 Grid 中部宽栏，鼠标在右侧时 tooltip 若跟指针会超出视口；海报布局下常见的固定向左偏技巧，换窄屏需配合 \`adjustedLeft\` 钳制。

### 1.3 下层，转置日历格

\`drawBottomCharts\` 合并历史与预测序列，以 interval 末日为 center，滑动窗口生成日期。布局每行 7 天、横向推进时间，与 GitHub contribution 相比 **转了 90°**。

双色带 **独立 domain**，历史与预测各用 sequential scale。若两段共用一个 scale，历史高负荷日会把预测段全洗成浅色。业务上允许 **上下两段各自拉伸**，代价是 **色深不能跨段比较绝对用量**，只能看段内相对高低，与相关矩阵上三角散点不能跨格比同构。

中心日格 yellow 高亮；左侧 Sun.…Sat. 按首格星期旋转排列。切换 \`predictionDuration\` 时列数变，\`initializeCharts\` **先算上下高度比再双区同绘**。

### 1.4 多 Store 联动

\`predictionDuration\`、\`selectedNodeName\`/\`nodeResponseData\`、\`featurestate\` 变化都会触发 \`initializeCharts()\`。\`chartRendered\` 控制图例与说明文字，空数据时不显示 Legends 块。

---

## 二、Evaluation View，矩阵外壳 与 居中宽度条

数据来自 \`/getPeriodErrors\`，整理为 **4×4 逻辑表**Week 或 Decade 或 Month 或 Season × MAE 或 MSE 或 MAPE 或 RMSE，取响应中 **根节点** \`rootErrors\` 的聚合指标。

### 2.1 组件分层

| 部分 | 实现要点 |
|------|----------|
| 矩阵外壳 | \`xScale\` 与 \`yScale\` 双 \`scaleBand\`，行 \`g\` 与列间虚线 |
| 格内图形 | \`rect\` 宽度 = \`bandwidth × (value / maxValue)\`，水平居中 |
| 颜色编码 | \`fill = colorScale(value)\`，10 阶绿到橙手工色带 |
| 标注 | 列名在上、行名在左、数值在条右侧 |

这不是色块填满格子的 heatmap，而是 **子弹图式居中条**，论文 (f) 强调 **越小越好**。满格填色时，0.01 与 0.02 的 MAE 都是一整块绿，读者难辨； **条越短越好** 的隐喻更直观。条在格内居中，两侧留白表示未使用的误差预算。

\`maxValue\` 取 **全局 16 格最大值**，使四指标、四时间尺度 **可在一张矩阵内横向比长短**，与相关矩阵每格独立 scale 相反，这里业务要求 **统一标尺**。

### 2.2 颜色，10 阶手工绿到橙

\`fill\` 直接用 \`colorScale(d.value)\` 而非 \`value/max\` 映射索引，论文配色以 **绝对误差量级** 分段，与条长度形成双编码长度主、颜色辅。

列间 **灰色虚线** \`stroke-dasharray: 3,3\` 贯穿整表高度，帮助在窄栏里对齐 MAE 或 MSE 列。

### 2.3 窄栏与 resize

右侧 Grid 列宽约为全屏 1/5，\`bandwidth()\` 很窄时条高固定 15px、\`rx\` 圆角 \`min(5, …)\`，避免条变成圆点。

### 2.4 数据 cutoff 与多 watch

后端误差表只覆盖到数据集截止日前；选更晚的 \`selectedTime\` 时 **静默不请求**，避免空表仍画旧矩阵误导读者。

三个 watch 分别监听 selectedTime 与 endDate、currentModelValue 和 featurestate，任一变化都会触发 getErrorData 并重绘 drawChart。换模型或特征子集后，16 格全刷。

---

## 三、异常视图简述

\`AnomalyViewTrue\` 以 **节点条形对比 与 表格排序** 为主，D3 画横向条；部分进度用 CSS。与时序 \`abnormal\`、层级 \`error\` 形成闭环，高误差叶子在树上点选 到 时序看分界处误差% 到 异常表确认排名。

---

## 四、定制逻辑对照表

| 视图 | 外壳 | 格内 或 区内编码 | 比例尺策略 |
|------|------|----------------|------------|
| Feature Matrix | band 矩阵 | 色块、直方图、散点 | 格内独立 |
| Hierarchy | tree | Glyph 与 Petal | 节点局部 与 全局 scale(0.3) |
| Time Series 上 | 连续 time scale | 三线与分界 | 全局 y，x 随窗口 |
| Time Series 下 | 7 列格网 | 热力色块 | 历史与预测 **双 domain** |
| Evaluation | band 矩阵 | 居中宽度条 | **全局 max** 归一宽度 |

---

## 五、开发障碍清单

| 组件 | 障碍 | 处理 |
|------|------|------|
| 时序 | 上下高度分配 | \`initializeCharts\` 按比例切 top 或 bottom 高度 |
| 时序 | 准星与分界 | \`isLeft\` 用像素比 \`divisionX\` |
| 时序 | tooltip 出屏 | 大偏移 与 边界钳制 |
| 时序 | 日历列数随预测天数变 | 窗口尾 \`predictionDuration\` 参与 for 循环 |
| 时序 | 误差字挡线 | 文案改 \`height*0.9\` 底部 |
| 评估 | 窄栏条太宽 | 宽度按 \`value/max\` 而非满 bandwidth |
| 评估 | 日期晚于 cutoff | 不请求 API |
| 评估 | 多 watch 重复请求 | 接受简单重拉，靠 \`message.loading\` 防抖感 |

## 小结

时序区解决 **何时、多少、准不准**；评估区解决 **哪个时间尺度最弱**。两者都靠 Pinia 时间与节点状态驱动，D3 负责 **非标准分区布局与精细交互**。读懂 **双外壳** 与 **居中条矩阵** 后，论文版前端形成完整分析闭环，并支撑 [Journal of Visualization 2026 见刊论文](https://link.springer.com/article/10.1007/s12650-026-01110-y)。

标签：D3.js
`;export{e as default};
