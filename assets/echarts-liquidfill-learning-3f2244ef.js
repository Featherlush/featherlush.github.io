const n=`---
title: "option 入门与 liquidFill 初体验"
excerpt: "上手第一周从柱状图读到 A1 水滴页，摸清 option 结构、Vue 集成和 liquidFill 扩展的安装方式。"
category: "前端开发"
categoryId: "frontend"
date: "2024-02-03"
author: "徐宁"
project: real-estate-viz
series: echarts-notes
---

npm 和 Git 理顺之后，图表模板项目的核心工作落在 **ECharts 绘图**上。仓库里有水库图、水滴图、三产业液位环图等二十多套页面，我主要负责 A1、B1 及若干 M 系页面的实现与调样式。这篇整理 2024 年 2 月前后从入门到能独立改 \`option\` 的学习路径。

## ECharts 核心概念，option

ECharts 的一切视觉表现几乎都写在 **option** 对象里。最简柱状图：

\`\`\`javascript
const option = {
  xAxis: { type: 'category', data: ['国有', '集体', '其他'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [354.94, 140.79, 29.92] }],
}
myChart.setOption(option)
\`\`\`

几个高频字段：

| 模块 | 作用 |
|------|------|
| \`title\`、\`tooltip\`、\`legend\` | 标题、悬停提示、图例 |
| \`xAxis\` 与 \`yAxis\` | 直角坐标系轴 |
| \`series\` | 真正的图形序列，可多条 |
| \`color\` | 全局配色数组 |

> **习惯**，改图表不要堆在一个巨型 option 里无限 \`setOption\`，按初始化一次 与 数据变化时更新 series 拆分，逻辑更清晰。

## 在 Vue 3 里挂载图表

项目里的标准写法A1、B1 同类：

\`\`\`vue
<template>
  <div ref="chartRef" style="width: 250px; height: 250px;"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return { myChart: null }
  },
  mounted() {
    this.myChart = echarts.init(this.$refs.chartRef)
    this.drawChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.myChart?.dispose()
  },
  methods: {
    drawChart() {
      this.myChart.setOption({
        series: [{ type: 'bar', data: [120, 200, 150] }],
      })
    },
    handleResize() {
      this.myChart?.resize()
    },
  },
}
<\/script>
\`\`\`

踩过的坑：

1. **\`mounted\` 之后再 init**，DOM 必须有宽高，否则图表是空白
2. **\`beforeUnmount\` 里 \`dispose\`**，路由切换不销毁会内存泄漏
3. **\`resize\`**，侧栏折叠、抽屉打开后记得调 \`myChart.resize()\`

## liquidFill 水滴与液位图

A1 非私营单位工资总额和 B1 就业人员三产业都用到了 **echarts-liquidfill** 扩展：

\`\`\`javascript
import * as echarts from 'echarts'
import 'echarts-liquidfill'

const option = {
  series: [{
    type: 'liquidFill',
    data: [0.675, 0.675],
    radius: '80%',
    color: ['#0184f1', '#00b4ff'],
    outline: {
      show: true,
      borderDistance: 4,
      itemStyle: { borderColor: '#0184f1', borderWidth: 2 },
    },
    label: {
      formatter: (param) => \`\${(param.value * 100).toFixed(1)}%\`,
    },
  }],
}
\`\`\`

A1 页面三个并列水滴分别表示国有、集体、其他单位占比；B1 则在液位环图外叠加 PNG 底座图标，**ECharts 层与绝对定位图片** 是项目里常见的组合套路。外壳排版见同系列 [PNG 外壳篇](/blog/echarts-css-liquidfill-shell)。

安装方式：

\`\`\`bash
npm install echarts echarts-liquidfill
\`\`\`

注意：\`liquidfill\` 必须在 \`echarts.init\` 之前 \`import\`，否则 \`type: 'liquidFill'\` 不识别。

## 路由与菜单

图表模板项目左侧导航维护二十多个图表路由，每个 \`chart*.vue\` 对应一条菜单项。新人常犯的错误是 **只改了组件没注册路由**，页面 404 或菜单点不进去。检查清单：

1. \`router/index.js\` 增加 path 与 component
2. 菜单配置里补上名称与图标
3. 本地 \`npm run dev\` 从菜单点进去，而不是只记 URL

## 数据格式，比例、小数与字符串

接口和 Mock 返回有时是 **字符串**。直接做除法前要先 \`Number()\`，否则 liquidFill 的 \`data\` 会变成 \`NaN\`，图表空白且无报错：

\`\`\`javascript
const total = Number(this.guoyou) + Number(this.jiti) + Number(this.qita)
if (!total) return
const p0 = Number(this.guoyou) / total
\`\`\`

液位比例必须在 **0–1** 之间；若业务给的是百分比，记得除以 100 再传给 liquidFill。

## 与配置项抽屉联动

项目每个图表页都有配置项按钮，打开 Element Plus 的 \`el-drawer\`，改颜色、字号、标题后即时刷新图表。\`setOption\` 默认会 **合并** 旧配置，只改 \`series\` 时不必重传整个 option。合并规则见 [setOption 篇](/blog/echarts-setoption-config-panel)。

## Mock 数据与图表联调

图表页通过 **axios-mock-adapter** 模拟多年序列，在接口未就绪时也能调 UI。先 Mock 把交互跑通，再接真实 Excel 与后端，是项目里常用的节奏。Excel 管线见 [数据链路篇](/blog/echarts-excel-data-pipeline)。

## 项目里还遇到的其它图表类型

除 liquidFill 外，同一仓库里还练到柱状与折线组合、蓝白 主题变体、定制排版页脚标注可拖拽。这说明 ECharts 往往只占画面一半，**布局、主题、交互** 和 option 同等重要，图层分工见 [叠层篇](/blog/echarts-layer-composition)。

## 调试小技巧

1. ECharts 官网 **Examples** 先搜相近图表，复制 option 再改
2. 浏览器里 \`console.log(option)\` 确认数据结构
3. 液位不对时先查 **比例是否在 0–1**，以及 \`data\` 是否 \`Number\`
4. 多实例时每个 \`div\` 单独 \`init\`，不要共用一个 \`myChart\`

## 小结

从课堂里的静态柱状图，到图表模板项目里可配置的水滴图、液位环图，ECharts 的学习关键是三条线并行，读懂 **option 结构**、掌握 **Vue 生命周期里的 init、dispose、resize**、用 **liquidFill 等扩展** 完成业务特有的图形。二十多套模板，本质上是在同一套工程环境里反复练这三件事。

标签：ECharts, 数据可视化, Vue.js
`;export{n as default};
