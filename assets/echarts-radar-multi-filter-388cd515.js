const e=`---
title: M4 雷达图与多条件筛选
excerpt: 年份、地区、指标三个抽屉同时改 radarData，比例换算和 dispose 后重建是我主要记的。
category: 前端开发
categoryId: frontend
date: 2024-02-19
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

M4 规模以上单位就业人员是我接触的第一个 **雷达图与三个筛选抽屉** 的页面，年份多选最多 5、指标单选、地区多选最多 3。任一条件变化都要重算整张雷达。多实例 dispose 思路见 [init 与 dispose 篇](/blog/echarts-multi-instance-lifecycle)；装饰叠层见 [图层篇](/blog/echarts-layer-composition)。

## 三个 watch，一个出口

\`\`\`javascript
watch: {
  selectedYears: { handler() { this.generateRadarChart() }, deep: true },
  selectedIndicator() { this.generateRadarChart() },
  selectedAreas: { handler() { this.generateRadarChart() }, deep: true },
},
\`\`\`

不要分别在抽屉 \`change\` 里调图表，watch 集中处理，少漏场景。

## 先 dispose，再 init

\`\`\`javascript
generateRadarChart() {
  this.destroyRadarChart()
  let radarChart = echarts.init(document.getElementById('radarChart'))
  // ...
  radarChart.setOption(option)
},
destroyRadarChart() {
  let radarChart = echarts.getInstanceByDom(document.getElementById('radarChart'))
  if (radarChart) radarChart.dispose()
},
\`\`\`

多条件频繁切换时，若只 \`setOption\` 不销毁，偶发 legend 与 series 数量不一致。项目里选择 **整图重建**，和 B1 思路一致。

## 数据，从绝对值到雷达比例

原始 \`dataValues\` 按年、指标、 十一地市嵌套。展示时换算成 **占当年全省总额的百分比**：

\`\`\`javascript
const totalValues = { '2018': 8938.52, '2019': 9719.41, ... }
const areaValue = this.chartData.dataValues[j][index][areaIndex]
const percentage = (areaValue / totalValue * 100).toFixed(2)
\`\`\`

雷达每个轴对应一个 **选中的年份**，一条线对应一个 **选中的地区**。选 3 个市、5 年，就得到 3 条闭合曲线，每条 5 个点。

## radar 与 areaStyle

\`\`\`javascript
radar: {
  indicator: this.selectedYears.map(year => ({ name: year, max: 100 })),
  center: ['40%', '55%'],
  radius: '65%',
},
series: [{
  type: 'radar',
  data: radarData,
}]
\`\`\`

\`areaStyle\` 用径向渐变、描边与阴影，三条线分别蓝、青、橙。\`max: 100\` 因为已经归一化成百分比。

页面上还有 **手写刻度**0、1000、2500、5000和 M4-1.png 装饰， ECharts 只画雷达，标尺靠 DOM。

## 抽屉 UX

三个 \`el-drawer\` 都设 \`:modal="false"\`，可同时打开对照筛选，不挡图表。\`multiple-limit\` 限制年份 5、地区 3，防止 legend 挤满右侧。

## legend 与 series 数量对齐

\`radarData\` 数组长度必须等于 \`selectedAreas.length\`。若用户先选 3 个地区再改成 1 个，旧 legend 项可能残留，这就是项目选择 **dispose 后重建** 而不是 merge 的原因之一。\`legend.data\` 建议从 \`selectedAreas\` 映射生成，不要手写固定数组。

## 年份与指标切换时的边界

- 年份未选时，不调用 generateRadarChart，或显示空状态提示
- 指标切换后 dataValues 索引要跟着换，别用闭包里旧的 index
- 地区超过 3 个时 UI 层 multiple-limit 拦住，必要时在 generateRadarChart 里 slice 防御

## 与 M4-1 装饰图的配合

页面右侧 M4-1.png 是绝对定位的标尺装饰，和雷达 \`center: ['40%', '55%']\` 一起调。改 \`radius\` 或 \`center\` 后，手写刻度的 DOM 位置往往也要微调，**不要指望只改 option 就全局对齐**。

## 小结

雷达图难点在 **数据维度变换**，不是 \`type: 'radar'\` 本身。深蓝主题下轴与 legend 颜色见 [主题篇](/blog/echarts-dark-theme-axis-tooltip)。

标签：ECharts, Vue.js
`;export{e as default};
