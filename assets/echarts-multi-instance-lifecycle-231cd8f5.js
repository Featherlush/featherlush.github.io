const n=`---
title: 一页多图时的 init 与 dispose
excerpt: B1 三个环图、B4 左右双柱，切换年份或路由前先 dispose，resize 也要绑对实例。
category: 前端开发
categoryId: frontend
date: 2024-02-18
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

B1 一页 **三个** liquidFill 与环图实例，B4 **左右各一个** 条形图，M 系页面还有年份、地区切换。多实例场景下，生命周期管理比单图难一层。这篇是我整理的笔记。B1 外壳见 [图层篇](/blog/echarts-layer-composition)；setOption 合并见 [配置项篇](/blog/echarts-setoption-config-panel)。

## 单页多 ref，B1 的三图表

B1 为三个产业各维护 \`myChart1、myChart2、myChart3\`，\`pieFill(id, allper)\` 里按 id 分支：

\`\`\`javascript
pieFill(id, allper) {
  if (id === 'pieFill1') {
    if (this.myChart1) this.myChart1.dispose()
    this.myChart1 = echarts.init(this.$refs.pieFill1)
  }
  // pieFill2、pieFill3 同理 ...
  const option = { series: [{ type: 'pie', ... }] }
  this.myChart1.setOption(option, true)
}
\`\`\`

**切换年份前先 dispose**，是为了避免同一 DOM 上重复 \`init\` 导致内存泄漏，以及旧动画、旧 series 与新数据叠在一起。当时没 dispose 时，切换年份偶尔出现环图闪一下旧数据。

## 更优雅的做法，事后才知道

现在回头看，可以 **只 init 一次**，在 \`mounted\`，后续只 \`setOption\` 更新 data；仅在 DOM 销毁时 \`dispose\`。项目代码选择每次重绘都 dispose+init，偏保守但好理解。团队赶进度时，能跑且不泄漏就合格。

## 用数组管理实例，事后重构思路

若页面实例数不固定如 H1 有 11 个环图，可以：

\`\`\`javascript
data() {
  return { chartInstances: [] }
},
methods: {
  initAll() {
    this.refsList.forEach((ref, i) => {
      this.chartInstances[i] = echarts.init(this.$refs[ref])
    })
  },
  disposeAll() {
    this.chartInstances.forEach(c => c?.dispose())
    this.chartInstances = []
  },
}
\`\`\`

B1 用三个独立变量是 **可读性优先**；H1 用数组是 **规模优先**。

## 切换路由时的幽灵监听

除了 \`beforeUnmount\`，还要注意 **父组件 keep-alive**若项目启用。被缓存的 chart 页不会 unmount，\`resize\` 监听会一直挂着。图表模板项目没开 keep-alive，但若以后嵌入大屏平台，要在 \`activated 与 deactivated\` 里补监听注册与移除。

## 白屏排查顺序

DOM 高度为 0 时 \`init\` 会得到空白 canvas。排查顺序，父级 flex 是否没给子 div 高度；\`mounted\` 里是否比 DOM 布局更早 \`init\`，必要时 \`nextTick\`；Chrome DevTools 里 canvas 实际像素宽高。

## 双实例对称布局，B4

B4 左右两个 \`barFill1\`、\`barFill2\`，各 800px 宽，用负 \`left\` 拼成对称蝴蝶柱图。两个实例要分别 \`echarts.init\`、分别 \`setOption\`；\`resize\` 时两个都调。犯过的错，只 resize 左边，右边在窗口变化后比例失调。

## 路由切换，beforeUnmount 必写

\`\`\`javascript
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize)
  this.myChart1?.dispose()
  this.myChart2?.dispose()
  this.myChart3?.dispose()
}
\`\`\`

漏写 \`dispose\`，在侧栏菜单里多点几个图表页，Chrome 内存会慢慢涨。

## resize 监听

侧栏折叠会改变主内容区宽度。高频 resize 可加 lodash debounce；图表模板项目里直接监听也够用。

## getElementById vs $refs

M5 用 \`document.getElementById('funnelChart')\`，其他页多用 \`this.$refs\`。在 Vue 里 **优先 ref**，避免 id 在全局重复，与组件生命周期一致。

## 检查清单

- [ ] 每个 \`init\` 都有对应 \`dispose\`
- [ ] 多实例页面 \`resize\` 全覆盖
- [ ] 路由离开前清理监听
- [ ] 切换数据时明确 merge 还是 notMerge
- [ ] DOM 有宽高再 \`init\`

## 小结

多实例不是多写几遍 \`init\` 就完事，而是 **谁创建、谁销毁、谁跟随布局变化** 要成对出现。M4 雷达三抽屉频繁重建见 [雷达篇](/blog/echarts-radar-multi-filter)；H1 十二实例见 [水库网格篇](/blog/echarts-h1-reservoir-grid)。

标签：ECharts, Vue.js
`;export{n as default};
