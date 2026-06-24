const n=`---
title: Hierarchy View 的花瓣环与 Glyph 圆环
excerpt: 论文插图 e 如何把 d3.tree 布局、渐变三角连线、Glyph 圆环与 Petal Ring 组合成可点击下钻的层级视图，以及整体缩放到约三成背后的视口妥协。
category: 前端开发
categoryId: frontend
date: 2025-05-02
author: 徐宁
project: electricity-forecast-paper
series: d3-notes
---

论文插图 e Hierarchy View 要同时表达三件事，树形聚合结构、节点用电贡献、叶子节点上各特征贡献花瓣。外表是一张 d3.tree 排布的层级图，连线是渐变填充三角带，编码 linkPct，节点内部却是两套完全不同的绘图器，中间层 drawGlyph 分段圆环，叶子层 drawPetalRing 花瓣环。这与 Feature Correlation 的矩阵外壳加异构微图是同一范式，只是外壳从 band 矩阵换成了 tree layout。前置布局见 [Grid 篇](/blog/electricity-paper-d3-dashboard-grid)；矩阵侧对照见 [相关矩阵篇](/blog/electricity-paper-d3-correlation-matrix)。

## 一、组件分层

| 层级 | 职责 | 关键实现 |
|------|------|----------|
| L0 容器 | 数据请求、节点选中、重绘触发 | \`ref\`、\`axios\`、Pinia时间窗、异常开关 |
| L1 视口变换 | 把逻辑树尺寸压进 Grid 中部格 | \`translate(+675,+20)\` 与 \`scale(0.3)\` |
| L2 树外壳 | 节点排布与父子连线 | \`d3.tree\`、三角 \`path\`、\`linkPct\` 标签 |
| L3 节点微图 | 按节点类型画不同图形 | 非叶子 \`drawGlyph\`；叶子 \`drawPetalRing\` |

**L1 是最不优雅却最必要的一层**，\`nodeSize([300, 500])\` 排出来的树，按 1:1 画进 Grid 中部，节点会溢出或挤成一团。最终用 **整体缩放与硬编码平移** 对齐论文截图，不是算法解，是 **海报式版面约束** 下的工程妥协。

## 二、节点数据模型

\`TreeNode\` 把 D3 布局需要的几何参数和业务字段绑在同一对象，避免 hierarchy 与 Vue 双维护：

\`\`\`typescript
interface TreeNode {
  name: string
  consumption: number
  error: number
  linkPct?: number
  children?: TreeNode[]
  childrenCount?: number
  features?: Array<{ name: string; percentage: number }>
  centerText?: { name: string; value: string; ... }
  ringInnerR?: number
  ringOuterR?: number
  segments?: number
}
\`\`\`

- **中间节点**，\`childrenCount\` 到 Glyph 外环段数，段色 \`colors[i % len]\`
- **叶子**，\`features[8]\` 与 \`segments: 8\` 对应 花瓣数量与内环分段对齐

开发前期用 \`baseData\` 静态树调坐标；接口返回后合并 \`consumption\`、\`error\`、\`features\` 真值。静态树的价值在于 **连线三角和花瓣角度可以在没有后端时迭代**。

## 三、drawGlyph，非叶子的子节点计数圆环

\`drawTreeNode.ts\` 面向 **有子节点、无 features** 的节点：

\`\`\`typescript
for (let i = 0; i < params.childrenCount; i++) {
  const start = i * angleStep + gap / 2
  const end = (i + 1) * angleStep - gap / 2
  const arcGen = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(start)
    .endAngle(end)
    .cornerRadius(9)
  g.append('path').attr('fill', colors[i % colors.length])
}
\`\`\`

**设计思考**，中间层读者关心的是下面还有几块，不是八个气象特征。段数 **随 \`childrenCount\` 变化**2、5…，比固定 8 段更符合语义。\`segmentGap\` 在弧度上留缝，避免相邻 industry 子块糊成整环。

中心米色圆与双行文字，节点名与用电占比 \`value\`。\`drawGlyph\` 里还有 \`translate(0,10) scale(1.5)\` 微调字号，utils 内也有局部 transform，与 Tree.vue 全局 \`scale(0.3)\` 叠加，调参时要两层一起看。

## 四、drawPetalRing，叶子的特征贡献极坐标图

### 4.1 内环分段标准 arc

\`percentage === 0\` 的特征段变灰、透明度 0.7，**零贡献仍占位**，保持八等分可读，避免缺一块被误读成数据缺失。

### 4.2 外圈花瓣非 arc，曲线闭合

花瓣不是扇形，而是 **四顶点 与 CardinalClosed**。角度 \`-1.55\` 是肉眼对齐论文配图调出来的常数，花瓣要朝外张开且不与内环重叠，纯数学中点角会让花瓣扎进相邻段。

\`sizeFactor\` 与 \`percentage\` 控制花瓣长短，过大时相邻花瓣交叉，过小则论文印刷看不清。\`scaleFactor\`默认 0.7加每节点 \`ringInnerR/ringOuterR\` 双层控制大小叶子与小叶子。

### 4.3 中心圆与底部标签

中心圆与 \`centerText.name\` 在底部偏移，标签在节点 **下方** 而非中心，避免与花瓣抢视线，符合论文 (e) 排版。

## 五、树外壳，layout、连线、渐变

### 5.1 separation 按 depth 分层

\`\`\`javascript
.separation((a, b) => {
  if (a.parent === b.parent) {
    if (depth === 1) return 4
    if (depth === 2) return 3
    if (depth === 3) return 1.8
  }
  return 1
})
\`\`\`

叶子层节点多、圆环半径大，若与上层用同一 separation，E 系列叶子会重叠。按 **depth 递减间距** 比 \`nodeSize\` alone 更可控。

### 5.2 三角连线，故意不用 d3.link

垂直父子画底边在子节点 y 的三角；斜向父子第三点在 \`(midX, targetY)\` 形成三角。\`d3.linkHorizontal\` 只能画线，无法 **用三角面积暗示流量占比**。填充 \`linearGradient\`，\`userSpaceOnUse\`，端点绑 source 与 target 坐标让三角沿父子方向由红 fade 到透明。

**障碍**：节点与连线坐标 hack，\`targetDepth === 3\` 时 sourceY、targetY 手工偏移，因为 Glyph 与 Petal 实际绘制半径与 tree 点不同心；换 \`scaleFactor\` 或花瓣长度后，三角 often 要再调一轮。

### 5.3 入场动画与图层

连线、标签初始 \`opacity: 0\`，\`transition\` stagger 淡入，避免首屏所有三角同时闪现。连线在节点下层，节点 \`pointer-events\` 可点。

## 六、Glyph vs Petal 分发与点击语义

点击节点后 \`setSelectedNodeName\`、\`getElectricityConsumption\` 与 \`updateNodeVisual\` 按分支高亮，非全树重绘。

\`updateNodeVisual\` 按 **节点 name 分支** 只刷新 **直接子节点** 的 \`currentCircleColor\`，点 industry 只亮 top-5 和 EN100，**不会误亮 E 系列叶子**。若用 \`descendants()\` 批量改色，中间层点击会让整棵子树变粉，读者失去当前焦点在哪一层的线索。

## 七、与其它面板的衔接

叶子名写入 Store 后：

| 下游 | 行为 |
|------|------|
| \`TimeSeriesView\` | \`nodeResponseData\` 到 三线折线 |
| \`FeatureMatrixView\` | 白名单叶子 到 \`/featureSelection\` |
| \`EvaluateView\` | 根节点聚合误差 |
| \`AnomalyViewTrue\` | 节点误差排名 |

层级图是 **空间锚点**，先建立工业与非工业到重点用户的心智，再扫时序与矩阵。时序与评估细节见 [同系列时序篇](/blog/electricity-paper-d3-timeseries-evaluation)。

## 八、定制逻辑对照

| 外壳 | 单元类型判定 | 微图函数 |
|------|----------------|----------|
| scaleBand 矩阵 | \`i>j、i==j、i<j\` | 色块、直方图、散点 |
| d3.tree | \`features && 无 children\` | Glyph 与 PetalRing |
| 折线区与日历区 | 上 或 下 DOM 分区 | 多线+分界 或 热力格 |

共性，**外壳只回答几何位置，微图函数只回答这一格画什么**。

## 九、开发障碍清单

| 障碍 | 现象 | 处理 |
|------|------|------|
| 视口装不下 | tree 逻辑尺寸 >> Grid 格 | \`scale(0.3)\` 与 \`translate(675,20)\` |
| 三角与圆错位 | 连线锚在 tree 点，圆心有偏移 | depth3 与兄弟分支手工改 path 端点 |
| 渐变方向错 | objectBoundingBox 随三角旋转 | \`gradientUnits: userSpaceOnUse\` |
| 花瓣挤在一起 | 八段 与 长花瓣 | 角偏移、\`sizeFactor\` 上限 |
| 点击全树闪烁 | 每次 click 重跑 drawPetalRing | 仅 \`updateNodeVisual\` 改色 |
| Store 双字段 | \`selectedNodeName\` / \`selectedNodeeName\` | 点击时两个都 set，watch 各绑不同字段 |

## 小结

Hierarchy View = **tree 外壳与三角渐变连线 与 双节点绘图器Glyph 与 Petal**。花瓣把特征贡献从表格变成 **可比较的极坐标图形**，是论文版相对大创树图最大的定制增量；而 \`scale(0.3)\` 与连线坐标 hack 则说明 **学术海报式仪表盘里，全局版面常常倒逼局部几何做非尺度变换**，接受这层妥协，才能把 D3 的真实布局塞进 CSS Grid 的一格。

标签：D3.js
`;export{n as default};
