const n=`---
title: "几何画布与解析层如何解耦"
excerpt: "parsedData、viewport、highlightElements 三层 props。Canvas 只负责画不算题，题型文本和 IMO 格式都不应渗进 GeometryCanvas。"
category: "前端开发"
categoryId: "frontend"
date: "2025-07-07"
author: "徐宁"
project: math-draw
series: vue-notes
---

同一道题，左侧 JSON 在变、中间图在缩放拖拽、右侧结论在播，如果全写在 App.vue 一个文件里，改高亮颜色就要动坐标公式。我把解析、视图、绘制、结论 UI 拆成四层，Canvas 组件只认数据结构，不认 txt 语法。

## 四层职责

| 层 | 模块 | 输入 | 输出 |
|----|------|------|------|
| 数据 | geometryParser.js | 形式化字符串 | points, lines, circles, relations |
| 编排 | App.vue | 选中题目、当前结论 | parsedData、viewport、highlightElements |
| 绘制 | GeometryCanvas.vue | 上述三个 props | Canvas 像素 |
| 结论 UI | ProofScroller.vue | 原文 | activeConclusion 事件 |

Parser 不知道 Canvas；Canvas 不知道 IMO 文件格式；结论滚动不知道角相等怎么画，只 emit 文本。

## GeometryCanvas 的 props 契约

\`\`\`javascript
parsedData: { points, lines, circles, relations }
viewport: { scale, offsetX, offsetY }
highlightElements: {
  redLines, lightRedLines, blueLines, lightBlueLines,
  yellowLines, yellowPoints, redCircles
}
\`\`\`

绘制顺序固定：

1. 所有 lines 灰线或高亮色
2. 所有 circles 黑色实线圆
3. highlightElements.redCircles 红色虚线，共圆或外心圆
4. 所有 points 绿点或黄点高亮，并加标签

坐标变换只在 Canvas 内：

\`\`\`javascript
function toScreen(point) {
  return {
    x: point.position[0] * scale + offsetX + canvasWidth / 2,
    y: -point.position[1] * scale + offsetY + canvasHeight / 2,
  }
}
\`\`\`

Y 轴取反是把数学坐标系翻到屏幕向下。缩放、平移只改 viewport，不重算 parsedData。

## 交互事件向上冒泡

Canvas 不直接改 viewport，而是：

- wheel 触发 emit zoom deltaY，App 里 scale 乘以 1.1
- 拖拽触发 emit pan dx、dy，累加 offsetX 与 offsetY

这样将来换 SVG 或 WebGL，编排层状态不变。

## highlightElements 与 parsedData 分离

高亮不是改 lines 数据，而是绘制时查询：

\`\`\`javascript
const isRed = highlightElements.redLines.some(
  (pair) =>
    (pair[0] === line.start.name && pair[1] === line.end.name) ||
    (pair[1] === line.start.name && pair[0] === line.end.name)
)
\`\`\`

好处：

- 切换结论时 O1 清空高亮数组，不必重建几何
- 同一条边可在不同结论里重复高亮，基础灰线网不变

redCircles 有两种语义：两点定圆外心与半径点，或多点共圆取前三点算外接圆，绘制分支在 Canvas 内分开处理。

## ProofScroller 与画布边界

ProofScroller 只负责：

- 用 ⇒ 切结论列表
- 播放、滚轮或点击改 currentIndex
- emit activeConclusion index, text

App.vue 的 handleActiveConclusion 把自然语言结论翻译成 highlightElements，这是当前最脏的一层，但脏在编排，不在 Canvas。

## 左侧 JSON 面板

JSON.stringify parsedData 直接绑在模板里，是调试 parser 的单一数据源镜像。改 parser 后先看 JSON，再看画布，避免图错了不知道是哪一步算错。

## 若继续演进

- 把 handleActiveConclusion 抽成 conclusionToHighlight.js 纯函数
- parsedData 用 TypeScript 接口约束点、线、圆
- 大题时点太多时，不要全连线，改为只画 segment 声明的边与高亮边

## 小结

解耦的核心是：解析产出世界几何，viewport 管相机，highlight 管样式层，Canvas 只做给定状态到像素的映射。题型文本、证明语法、IMO 文件格式都不应渗进 GeometryCanvas.vue。

标签：Vue.js, Canvas
`;export{n as default};
