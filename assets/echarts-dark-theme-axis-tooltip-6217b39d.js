const n=`---
title: "深蓝主题下的坐标轴与 tooltip"
excerpt: "B4 蓝色模板里轴线变白字、tooltip 关掉、grid 左右对称，和白底版差异主要在样式层。"
category: "前端开发"
categoryId: "frontend"
date: "2024-02-21"
author: "徐宁"
project: real-estate-viz
series: echarts-notes
---

项目同一套图表常做 **蓝白** 两个 Vue 文件，逻辑几乎复制，差异集中在 **轴、字、网格、tooltip**。我以 B4 外商投资分国别蓝版为例整理样式套路。B4 双实例布局见 [init 与 dispose 篇](/blog/echarts-multi-instance-lifecycle)。

## 深色底上的 value 轴

左右各一张横向条形图，左边数值向右、右边数值向左，\`inverse: true\`：

\`\`\`javascript
xAxis: [{
  type: 'value',
  axisLabel: { color: '#ffffff' },
  axisLine: { show: false },
  splitLine: { show: false },
}],
yAxis: [{
  type: 'category',
  show: false,
  inverse: true,
  data: ['中国香港', '台湾省', ...],
}],
\`\`\`

深色背景上，刻度字改 \`#ffffff\` 或浅灰；\`splitLine.show: false\` 去掉网格线，靠条形本身表达；类目轴 \`show: false\`，国名用外侧 HTML 或设计稿文字。

白版把 \`axisLabel.color\` 改成深色、必要时打开 \`splitLine\` 即可。

## tooltip 经常直接关掉

\`\`\`javascript
tooltip: {
  trigger: 'axis',
  show: false,
  axisPointer: { type: 'shadow' },
},
\`\`\`

汇报图、展板图要 **固定标注**，不希望鼠标悬停才出数。\`label.show: true\` 写在 series 上。若产品又要悬停详情，可只开 tooltip、关 label，两套主题各维护一份 option。

## grid 左右对称

左图 \`grid: { left: '42.5%', right: '4%', ... }\`，右图 \`grid: { left: '4%', right: '40%', ... }\`，中间留给标题、装饰和对开视觉。\`containLabel: true\` 防止长国名被裁切。

## devicePixelRatio 与导出

B2 部分图表 \`echarts.init(dom, null, { devicePixelRatio: 6 })\`，是为了 **高清截图** 时边缘不糊。开发时 CPU 会高一点，只在需要导出的 chart 上用，别全局默认。

## M4、D1 上的 backgroundColor

雷达页 \`option\` 里设 \`backgroundColor: 'rgba(22, 60, 111, 0.8)'\`，与容器 CSS 背景一致，避免透明区域导出时发白。主题切换时记得 **option 背景与外层 div 同步改**。

## 白版与蓝版的复制维护

B4_blue 和 B4_white 两份文件，逻辑相同，差异在 \`axisLabel.color\`、\`splitLine.lineStyle.color\`、\`series.label.color\`、\`itemStyle.color\`、外层 \`.chart-wrap\` 的 CSS 背景图。改业务逻辑时要 **两边同步改**，否则会出现蓝版对了、白版轴字看不见。

## axisPointer 与交互

即使 \`tooltip.show: false\`，有时仍保留 \`axisPointer: { type: 'shadow' }\` 做悬停高亮若产品需要。汇报静态图则 \`silent: true\` 关掉一切交互，避免领导演示时鼠标滑过出现半透明遮罩。

## legend 在深色底的对比度

深蓝背景下 legend 默认灰字看不清。统一设 \`textStyle.color: '#e0e8f0'\`，翻页 legend 的 \`pageIconColor\` 也要改，否则翻页箭头几乎隐形。

## 小结

双主题维护成本在 **样式 diff**，可考虑抽 \`getBarOption(theme)\` 工厂函数，当时项目赶工期直接复制文件。进阶 chart 类型选型见 [桑基漏斗篇](/blog/echarts-advanced-chart-types)。

标签：ECharts
`;export{n as default};
