const n=`---
title: "几何绘图推导"
description: "把 IMO 几何题的形式化描述解析成 Canvas 图形，并按证明结论逐步高亮，课余做的小可视化工具。"
date: "2025-07-08"
gradient: "linear-gradient(135deg, rgba(100, 116, 139, 0.18) 0%, rgba(51, 65, 85, 0.34) 100%)"
status: "已完成"
category: "viz"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
cover: "/images/projects/math-draw/cover.png"
coverLayout: wide
---

## 项目概述

几何绘图推导是我 2025 年 7 月课余做的小项目。读入一道几何题的形式化描述，点、圆、共线、共圆等关系，在浏览器里自动摆点、连线、画圆，再把推导链里的每一条结论与画布联动高亮，点哪条证明就标出对应的角、线段或圆。

数据来自 IMO 题目的翻译文本，如 2000 P1、2002 P2 等，不是完整定理证明器，而是能画出来并能跟着结论看的可视化小工具。

相关笔记见 [Vue.js 手记](/blog/series/vue-notes) 中标记 math-draw 的篇目。

## 界面布局

三栏工作台。

| 区域 | 作用 |
|------|------|
| 解析数据 | 展示 parseGeometryCommands 后的 JSON，点坐标、线段、圆与未解析关系 |
| 几何画布 | Canvas 绘制点、全连线、圆，支持缩放与拖拽平移 |
| 证明结论 | 从原文提取结论列表，可播放或手动切换 |

顶部可选图 1 至图 4 切换不同题目，并提供放大、缩小与重置视图。

## 绘画过程结论联动

同一幅构图下，切换不同证明结论时，画布只高亮与该结论相关的点、线段或圆。

### 角相等如 ∠DBN = ∠DMN

![角相等结论高亮](/images/projects/math-draw/process-angle-highlight.png)

深红与深蓝标出两组角的边，黄色强调角的顶点。

### 共圆如 A,C,F,E are concyclic

![共圆结论高亮](/images/projects/math-draw/process-concyclic-highlight.png)

红色虚线画出外接圆，圆心以绿色标记点辅助定位。

## 核心流程

加载 public/data 下形式化描述文本；geometryParser.js 识别 segment、on_circle、on_line 等构造，推算点坐标并生成连线；GeometryCanvas.vue 把世界坐标经 viewport 变换到屏幕；ProofScroller 切换结论后正则解析句式，更新 highlightElements 重绘。

\`\`\`javascript
function parseSegment(line) {
  const m = line.match(/^segment\\s+([A-Z]),([A-Z])$/)
  if (!m) return null
  return { type: 'segment', from: m[1], to: m[2] }
}
\`\`\`

\`\`\`javascript
function worldToScreen(x, y, viewport) {
  return {
    x: (x - viewport.cx) * viewport.scale + viewport.width / 2,
    y: (y - viewport.cy) * viewport.scale + viewport.height / 2
  }
}
\`\`\`

## 证明结论与高亮规则节选

| 结论模式 | 画布表现 |
|----------|----------|
| ∠DBN = ∠DMN | 两组角边用深红深蓝线段，顶点黄点 |
| A,C,F,E are concyclic | 红色虚线外接圆 |
| D,C,M are collinear | 共线点对应红色线段 |
| BQ:BM = BM:BN | 四段比例对应深浅红蓝线 |
| G_1 is the circumcenter of Δ… | 外心黄点与半径红圆 |

\`\`\`javascript
const rules = [
  {
    pattern: /∠([A-Z]{2,3})\\s*=\\s*∠([A-Z]{2,3})/,
    highlight: m => ({ segments: [m[1], m[2]], vertices: [m[1][1], m[2][1]] })
  },
  {
    pattern: /([A-Z,]+)\\s+are\\s+concyclic/,
    highlight: m => ({ circleThrough: m[1].split(',') })
  }
]
\`\`\`

## 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Vue 3 与 TypeScript | 三栏布局与状态 |
| 绘图 | Canvas 2D API | 点线圆与虚线高亮 |
| 解析 | 自研 geometryParser | 文本命令转坐标与关系 |
| 几何库 | geometric | 预留几何计算扩展 |
| 构建 | Vite 7 | 开发与打包 |

仓库内另有 SymPy 求解参考脚本，与前端解析思路相关，未接入页面。

## 局限与说明

点坐标为规则推算与偏移，非通用求解器。高亮规则按常见句式手写正则，新句式需扩展。全点连线在演示题规模下可接受，大图会过密。个人练习玩具项目，未做长期维护。

技术栈：Vue 3, TypeScript, Canvas, Vite, geometric
`;export{n as default};
