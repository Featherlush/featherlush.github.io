const n=`---
title: "IMO 形式化文本怎么读进 geometryParser"
excerpt: "segment、on_circle、on_line 分号命令，从 translated_imo 文本到 points、lines、circles 的两遍扫描解析管线。"
category: "前端开发"
categoryId: "frontend"
date: "2025-07-05"
author: "徐宁"
project: math-draw
series: vue-notes
---

课余项目几何绘图推导的数据不是手绘坐标，而是 \`public/data/translated_imo_*.txt\` 里的一行构造与多行前提、结论。geometryParser.js 负责把这类文本变成可绘制的 JSON。这篇梳理读取格式与解析顺序。

## 文件长什么样

以 IMO 2000 P1 为例，结构大致是：

- 第一行：题目 id，如 translated_imo_2000_p1
- 第二行：分号分隔的构造命令，真正驱动摆点的部分
- 分隔线后：定理前提人类可读与 ⇒ 结论，给右侧滚动列表用

第二行示例形态：\`a b = segment a b; g1 = on_tline g1 a a b; … ? cong e p e q\`

解析器主要吃第二行；结论区由 ProofScroller 另读原文。

## 命令拆分：分号与 trim

\`\`\`javascript
const allLines = commands.split('\\n').map((line) => line.trim()).filter(Boolean)
const commandLines = allLines.slice(1).join(' ')
const cmdLines = commandLines
  .split(';')
  .map((cmd) => cmd.trim())
  .filter(Boolean)
\`\`\`

要点：

- 跳过首行标题，把剩余行拼成一条再按 ; 切，避免换行把命令截断
- 每个片段形如 m = on_circle m g1 a, on_circle m g2 b，逗号表示同一对象的多个约束

## 构造类型识别第一遍扫描

| 片段特征 | 含义 | 解析动作 |
|----------|------|----------|
| a b = segment a b | 线段两端点 | 登记两个 point 元素 |
| g1 = on_tline … | 垂线圆心类 | 提取 center、radiusRef，登记 circle |
| m = on_circle m g1 a, on_circle m g2 b | 两圆交点 | 登记 point 与 onCircles |
| c = on_pline c m a b | 平行线约束点 | onLine: p1,p2 |
| e = on_line e a c, on_line e b d | 两线交点 | onIntersection 数组 |
| 其它 | 关系命题 | 推入 relations 数组 |

第一遍只建元素表，不算坐标，避免圆还没圆心就去算交点的顺序问题。

## 坐标计算第二遍：固定规则与几何公式

1. 基础点 a、b 固定平面位置；g1、g2 放在 a、b 正上方 on_tline 的简化
2. 圆由圆心到参考点距离得半径
3. 双圆交点 m、n 用两圆交点公式，上下交点加微小 yOffset 防重合
4. 线段上的点 c、d 按比例取点并 x 方向偏移
5. 直线交点 e、p、q 用直线交点公式，按点名加不同偏移

这是玩具级求解器：能画出 IMO 2000 构图，但不是任意构造的通用解。

## 全连线策略

所有点确定后，对点集做两两组合生成 lines：

\`\`\`javascript
for (let i = 0; i < allPointNames.length; i++) {
  for (let j = i + 1; j < allPointNames.length; j++) {
    result.lines[\`\${p1Name}-\${p2Name}\`] = { start, end, length }
  }
}
\`\`\`

因此画布上会看到完全图式的密线网，高亮时才能看出哪几条边与当前结论相关。

## 与 Python 参考脚本的关系

\`绘图参考/position.py\` 用 SymPy 解方程，思路是符号几何。前端 parser 为赶进度用硬编码与公式片段，两者未打通。若重做，会考虑：

- 构造命令到约束列表，再到数值求解或 WASM 调库
- 第一遍仍建议 AST 式元素表，与坐标求解分离

## 小结

形式化文本读取的关键是分号命令表、两遍扫描元素到坐标，以及关系行旁路。读懂 segment、on_circle、on_line 几类片段，就能对照左侧 JSON 面板调试摆点是否合理。

标签：Vue.js, Canvas
`;export{n as default};
