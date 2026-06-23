const n=`---
title: "ProofScroller、视口变换与 geometric 依赖"
excerpt: "结论提取、播放节奏、Canvas 视口与尚未接入的 geometric 库，几何小项目里 parser 和正则之外的技术补遗。"
category: "前端开发"
categoryId: "frontend"
date: "2025-07-09"
author: "徐宁"
project: math-draw
series: vue-notes
---

解析与高亮之外，还有结论怎么从原文冒出来、画布怎么缩放拖拽、geometric 包为何挂着没用。这篇补几何小项目里其余技术点，避免只谈 parser 和正则。

## ProofScroller：从原文到可播列表

数据源是整段 txt，不是单独的 conclusions.json。提取规则：

\`\`\`javascript
props.content.split('\\n')
  .filter((line) => line.includes('⇒'))
  .map((line) => {
    const idx = line.indexOf('⇒')
    let text = line.slice(idx + 2).trim()
    const bracketIndex = text.indexOf('[')
    if (bracketIndex !== -1) text = text.slice(0, bracketIndex).trim()
    return text
  })
\`\`\`

- 只认 ⇒ 行，前提区 AG_1 ⟂ AB 不进列表
- 截掉 [ 后的机器备注，列表里只留人类可读结论

### 播放与手动控制

- setInterval 按 speed 500—3000 ms 递增 currentIndex，到头循环
- 滚轮在结论区：向上/下一条，并自动暂停播放
- 点击某行：setCurrentIndex 带边界钳制

watch currentIndex 每次 emit activeConclusion，驱动 App.vue 高亮逻辑，Scroller 永不 import Canvas。

## 视口：scale 与 offset 而非重算坐标

\`\`\`javascript
const viewport = reactive({
  scale: 0.6,
  offsetX: 0,
  offsetY: 250,
})
\`\`\`

初始 offsetY 把 IMO 2000 构图往下挪，避免顶在画布外。按钮与滚轮只改这三个数；点的世界坐标不变。

拖拽时曾踩坑：屏幕 Y 向下、数学 Y 向上，平移要对 offsetY 同向累加 Canvas 里已用 -position 1 翻转。

resetView 在切题时通过 parseAndRender 旁路调用，避免上一题的缩放残留。

## 题目切换与数据加载

\`\`\`javascript
const filenames = [
  '/data/translated_imo_2000_p1.txt',
  '/data/translated_imo_2002_p2a.txt',
  …
]
\`\`\`

fetch 拉取 public 下文本，填入 commandSets，下拉框选图 1—4。切换时：

1. parseGeometryCommands selectedCommand
2. resetHighlightElements
3. ProofScroller 内 watch conclusions 把 index 归零

左侧 JSON、中间图、右侧列表同源 selectedCommand，避免三栏数据不一致。

## geometric 包：挂了但没用上

package.json 里有 geometric 二维点线多边形工具库。当前交点、外接圆、距离都在 parser 与 Canvas 里手写公式，未调用该库。

预留意图：

- 共圆检测、点在多边形内等可用库函数减少手写
- 若把 Python SymPy 管线迁到前端，geometric 可作轻量替代

玩具阶段先跑通 UI 联动，库集成优先级低。

## TypeScript 与 Vue 3 script setup

项目用 vue-tsc 与 TS 配置，但 geometryParser.js 仍是 JS，类型未贯通。GeometryCanvas 的 props 靠运行时默认对象兜底。若重做会给 ParsedGeometry、HighlightState 建 interface，并在 emit 上声明事件类型。

## Canvas 性能与尺寸

- resize 监听父容器，每帧 clearRect 全量重绘
- watch deep true 监听高亮对象，点数 < 15 时足够；上百点需改脏矩形或分层 Canvas

build.minify false 便于本地看栈。

## 小结

ProofScroller 解决结论从哪来、怎么播；viewport 解决同一几何在不同缩放下的呈现；geometric 是尚未接入的扩展位。与 parser、正则高亮拼在一起，才是完整的几何绘图推导小工具。

标签：Vue.js, Canvas
`;export{n as default};
