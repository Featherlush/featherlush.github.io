const n=`---
title: PNG 外壳与 liquidFill 同屏排版
excerpt: comm.css 的 ydd_bj 底图加上半透明液位，chart2 三列球体和 A1 页面都是这样拼出来的。
category: 前端开发
categoryId: frontend
date: 2024-02-05
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

[liquidFill 入门篇](/blog/echarts-liquidfill-learning) 讲了 option 字段，这篇单独记 **外壳怎么拼**，项目里并不是裸放一个圆球，而是 **PNG 背景与内嵌 ECharts 容器** 两层结构。

## ydd_bj 与 ydd_fill 的分工

\`comm.css\` 里预置了几套水滴外壳：

\`\`\`css
.ydd_bj1 {
  background: url("../img/pic-01.png");
  background-repeat: no-repeat;
  background-size: 235px 235px;
}
.ydd_bj2 { /* pic-03.png */ }
.ydd_bj3 { /* pic-02.png */ }
.ydd_fill {
  width: 200px;
  height: 200px;
}
\`\`\`

模板里典型写法：

\`\`\`html
<div class="flex-column flex-row-alin-center ydd_bj1">
  <div class="ydd_fill" ref="item0Fill"></div>
  <div class="mt-20">国有单位</div>
</div>
\`\`\`

- **ydd_bj***，只负责外形、配色边框，不参与数据
- **ydd_fill**，\`echarts.init\` 的挂载点，液位动画在这里画

chart2 非私营单位工资三列球体、A1 多列水滴，都是同一套 class 复用，换底图 class 就能换造型。

## liquidFill 在壳子里的参数

chart2 里 \`zzzkcFill\` 把液位塞进外壳，几个和嵌套相关的 option：

\`\`\`javascript
series: [{
  type: 'liquidFill',
  radius: '100%',
  center: ['50%', '50%'],
  data: [
    percentage / 100,
    { value: percentage / 100, direction: 'left' }
  ],
  backgroundStyle: { color: 'rgba(17, 17, 17, .1)' },
  amplitude: this.ball_amplitude + '%',
  outline: { show: false },
}]
\`\`\`

要点：

- \`outline.show: false\` 去掉默认描边，避免和 PNG 外圈叠出双线
- \`backgroundStyle\` 半透明，让底图纹理还能透一点
- \`amplitude\` 绑配置项滑块，使用方可调浪高

配置项改颜色时，循环三个 ref 重绘，和 [setOption 篇](/blog/echarts-setoption-config-panel) 同一套路。

## 和 B1 环图的差异

B1 用 **产业 PNG 与 半透明 pie** 模拟液位，不是 liquidFill。外壳思路一样：先定容器尺寸，再让图表 \`radius\` 填满内腔。

| 方式 | 优点 | 缺点 |
|------|------|------|
| liquidFill | 波浪动画、百分比居中 | 需扩展包，多实例要各自 init |
| pie 与 半透明 | 不依赖扩展 | 没有水位动画，option 要手调角度 |

项目里真水滴页多用 liquidFill，产业图标页多用 pie。B1 叠层细节见 [图层篇](/blog/echarts-layer-composition)。

## resize 时的一个坑

chart2 原代码在 \`resize\` 里写了 \`window.location.reload()\`，窗口一变就整页刷新。演示环境能接受，嵌入平台时应该改成 \`myChart.resize()\`，并为每个实例分别监听。

## 对齐调试，像素级调外壳

\`ydd_bj\` 的 \`background-size: 235px\` 和 \`ydd_fill\` 的 200px 宽高是试出来的，不是算出来的。设计师换一版 PNG，往往要重新调 \`top 与 left\` 或 \`background-position\`。流程：

1. 先让 PNG 外壳在浏览器里对齐设计稿截图
2. 再调 liquidFill 的 \`radius\`、\`center\`，让液位不溢出外圈
3. 最后才绑真实数据

若先接数据后调样式，会误以为比例算错，其实是 **容器没对齐**。

## 三列并排时的间距

chart2 三列球体用 flex 与 \`mlr20\` 控制间距，每个列里独立 \`ref\`。配置项改振幅时 **三个实例都要重绘**，和 A1 三水滴一样。漏掉其中一个 ref，会出现两列浪高变了、一列没变的诡异状态。

## 小结

**外壳用 CSS 或 PNG，液位用 ECharts**，尺寸对齐靠固定 \`background-size\` 和 \`ydd_fill\` 宽高。多实例生命周期见 [init 与 dispose 篇](/blog/echarts-multi-instance-lifecycle)。

标签：ECharts, CSS
`;export{n as default};
