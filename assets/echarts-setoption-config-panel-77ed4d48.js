const n=`---
title: 配置项抽屉与 setOption 合并规则
excerpt: 抽屉里调色、调字号后要立刻出图。局部 setOption、notMerge 和颜色联动，是我踩坑最多的地方。
category: 前端开发
categoryId: frontend
date: 2024-02-08
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

[liquidFill 入门篇](/blog/echarts-liquidfill-learning) 写了基础 option，这篇单独聊 **配置项抽屉 与 setOption**，图表模板项目里几乎每个 \`chart*.vue\` 都有配置项按钮，改颜色、字号、年份后图表要立刻响应。搞懂 \`setOption\` 的合并规则，是少踩坑的关键。

## 配置项在项目里长什么样

典型结构，A1、A3 等页面：

- \`el-drawer\` 与 \`el-tabs\` 分组，文本选项、图形选项
- \`el-color-picker\` 绑定 \`ball_top_color\`、\`top_text_color\`
- \`el-slider\` 调字号、液位振幅
- \`@change\` 回调里调用 \`changeBallTopColor()\` 等方法刷新图表

使用方不需要改代码，在抽屉里调色就能出图，这也是图表模板平台的产品逻辑。

## 局部 setOption，只改需要变的部分

改标题颜色时，不必重传整个 option：

\`\`\`javascript
changeBallTopColor() {
  this.myChart.setOption({
    series: [{
      color: [this.ball_top_color, this.ball_bottom_color],
    }],
  })
}
\`\`\`

ECharts 默认 **merge 模式**，新 option 与旧 option 深度合并，未提及的字段保留。配置项越多的页面，越适合按模块拆分更新函数。

## 全量 setOption，何时用第二参数

B1 三产业液位环图在切换年份时会 **dispose 旧实例再 init**，并用：

\`\`\`javascript
myChart1.setOption(option, true)
\`\`\`

第二个参数 \`notMerge: true\` 表示 **不合并、整表替换**。适用场景，系列数量、类型发生变化；避免旧 series 残留导致鬼影；重新 init 后第一次绘图。

经验，**同类型、同结构的数据刷新用 merge；换年份、换指标维度用 dispose 与 init 或 notMerge。** 多实例生命周期见 [init 与 dispose 篇](/blog/echarts-multi-instance-lifecycle)。

## 数据驱动配置项，watch 联动

B1 用 \`watch selectedYear\` 拉接口再画三个环图。配置项不仅是颜色，**年份、地区下拉**也是配置。数据变 到 先更新 data 到 再 setOption，顺序不能反。

## 颜色选择器与 ECharts 配色

\`el-color-picker\` 的 \`show-alpha\` 支持透明度，绑定到 option 时注意 \`itemStyle.color\` 接受 rgba 字符串；液位图 \`color\` 数组通常两项。改色后若没生效，先查是不是只改了 CSS 没调 \`setOption\`。

## el-collapse 与配置项分组

A1 等页面的配置项抽屉用 \`el-collapse\` 把文本选项、图形选项拆开，避免一打开抽屉信息过载。折叠面板里的 \`@change\` 有的绑方法名、有的直接调绘图函数，**命名要一致**，否则改色无反应时很难搜到回调。

## notMerge 与 series 下标

\`setOption({ series: [{ ... }] }, true)\` 会 **整表替换 series 数组**。若旧 option 里有两条 series，新 option 只传一条，另一条会消失，这正是我们想要的效果。反之，若只想改第二条 series 的颜色，merge 模式下应传：

\`\`\`javascript
setOption({ series: [ {}, { itemStyle: { color: '#fff' } } ] })
\`\`\`

用空对象占位第一条，避免下标错位。调 B4 双柱图时踩过的坑。

## 我总结的 setOption 习惯

| 场景 | 做法 |
|------|------|
| 抽屉改标题 或 颜色 | 局部 \`setOption\`，只传变化字段 |
| 切换年份 或 地区 | 先请求数据，再更新 series.data |
| 图表类型不变、数据维度变 | \`dispose\`、\`init\` 与 \`setOption(opt, true)\` |
| 调试 option | \`console.log\` 后对照官网示例逐项删 |

## 小结

配置项驱动的本质，是把 **option 当成可编辑的状态机**，UI 控件改的是 Vue data，图表通过 \`setOption\` 反映 data。二十多套模板，差异主要在 option 长什么样，而联动套路是同一套。深蓝主题下的轴与 tooltip 样式见 [主题篇](/blog/echarts-dark-theme-axis-tooltip)。

标签：ECharts, Vue.js
`;export{n as default};
