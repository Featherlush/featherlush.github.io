const n=`---
title: H1 十一座水库液位网格
excerpt: 一张底图 bar 加十一个 pingFill 环图，绝对定位排矩阵，是我见过实例最多的一页。
category: 前端开发
categoryId: frontend
date: 2024-02-26
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

H1 多水库液位页是课题期间 **单页 ECharts 实例最多** 的模板，底层一张分类条形图，上面叠 **11 个** \`pingFill\` 液位环图，每个环图配一张 H1-01.png 水库底座。前置见 [多实例 lifecycle 篇](/blog/echarts-multi-instance-lifecycle)、[图层叠放篇](/blog/echarts-layer-composition)、[进阶类型篇](/blog/echarts-advanced-chart-types)。

## 页面结构

\`\`\`html
<div id="myChart"></div>
<div class="mid-img-1">
  <img src="../img/H1-01.png" style="width: 365px; position: absolute; z-index: 3;" />
  <div ref="pingFill1" style="height: 100%; width: 500px;"></div>
</div>
<!-- mid-img-2 … mid-img-11 同理 -->
\`\`\`

- **myChart**，横向条形，y 轴 eleven 个空类目占位，用条形长度表达各地市面积
- **pingFill1~11**，与条形某一档对齐，环图显示占比或液位
- **PNG**，z-index: 3 压在环图边缘，和 B1 产业图同一套路

绝对定位把每个 \`mid-img-*\` 放到条形对应行上，调 \`top/left\` 时对照设计稿像素级对齐。

## 底层 bar 的空类目

\`\`\`javascript
yAxis: [{
  type: 'category',
  data: ['', '', '', '', '', '', '', '', '', '', ''],
  axisLabel: { /* 各地市名写在 CSS 或另一层 */ },
  splitLine: { show: false },
}]
\`\`\`

类目轴数据是空字符串，名称不交给 ECharts，因为旁边已有水库图和外部标注。改数据时要分清 **底图 myChart** 和 **11 个 pingFill** 各自的生命周期。

## 环图 option 要点

每个 \`pingFill\` 与 B1 类似，半透明 \`pie\` 或窄环，\`radius\` 内径外径压扁，像水位；\`silent: true\` 避免 hover 挡住底层条形交互；颜色与对应地市条形 \`itemStyle\` 同色，视觉上一体。

初始化时循环 \`pingFill1\` … \`pingFill11\`，**不能用同一个 myChart 变量**，至少 11 个 ref 或数组 \`charts[i]\`：

\`\`\`javascript
const refs = ['pingFill1', 'pingFill2', /* … */ 'pingFill11']
refs.forEach((refName, i) => {
  this.charts[i] = echarts.init(this.$refs[refName])
  this.charts[i].setOption(this.buildRingOption(i))
})
\`\`\`

## 与底图 bar 的数据联动

十一个环图的比例通常来自 **同一套地市数据**，条形长度表示绝对值，环内液位表示占比或完成度。改年份或筛选条件时，要：

1. 更新底图 \`myChart\` 的 \`series.data\`
2. 循环更新 11 个 \`pingFill\` 的 data
3. 同步更新旁边 HTML 数字若有

只改底图不改环图，会出现条很长、水位很低的割裂感。

## 绝对定位矩阵的维护

\`mid-img-1\` … \`mid-img-11\` 每个容器 \`position: absolute\`，\`top\` 值按条形行高累加。设计稿改一版行距，要改 11 处 top，这是 H1 维护成本最高的地方。我当时用 Excel 算行高 × 索引，减少手算误差。

## 首屏加载策略

12 个实例同时 \`init\`，首屏会卡一下。可选优化，项目未做： \`requestAnimationFrame\` 分批 init 环图；先画底图，环图 stagger；视口外水库懒加载大屏一般全可见，意义不大。

## 性能与维护

11 次 \`init\` 与 1 次底图 = 12 实例。路由离开务必 \`dispose\` 全部 12 个实例；\`resize\` 时要批量 \`resize\`，或节流后统一调用。若以后要减实例，可考虑 **一个 canvas 画底图与 HTML 叠水库**，只保留底图一个 ECharts。

## 小结

H1 把 **图层叠放** 和 **多实例管理** 叠到一起，是 ECharts 图表模板手记系列里综合难度最高的一页。从 [liquidFill 入门](/blog/echarts-liquidfill-learning) 到本篇，可按合集目录顺序复习整条学习线。

标签：ECharts
`;export{n as default};
