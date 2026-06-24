const n=`---
title: 证明结论的正则解析与高亮联动
excerpt: 角相等、共圆、共线、比例与外心等句式，handleActiveConclusion 里一类结论一个模式，高亮错了多半是优先级或空格没规范化。
category: 前端开发
categoryId: frontend
date: 2025-07-08
author: 徐宁
project: math-draw
series: vue-notes
---

右侧证明结论滚到某一条时，中间图要立刻标出对应的角、边或圆。我在 App.vue 里用一串正则与字符串规范化把自然语言结论映射到 highlightElements。这是项目里花时间最多的一块：句式差一点，高亮就全错或全无。

## 总流程

ProofScroller 发出 text 后，App.vue 先 resetHighlightElements，再按优先级 if/else 匹配句式，填充 redLines、blueLines、yellowPoints、redCircles，GeometryCanvas watch 重绘。每次切换结论先清空所有高亮数组，避免上一条的红线残留。

## 角相等：∠DBN = ∠DMN

\`\`\`javascript
if (/∠[A-Za-z]+ = ∠[A-Za-z]+/.test(conclusion)) {
  const anglePairs = conclusion.match(/∠([A-Za-z]+)/g)?.map((s) => s.slice(1)) || []
  // anglePairs[0] = 'DBN' 对应顶点 B，边 DB、BN
  // anglePairs[1] = 'DMN' 对应顶点 M，边 DM、MN
}
\`\`\`

规则：

- 角名三字：中间字母是顶点：第一组角边进 redLines，第二组进 blueLines：顶点进 yellowPoints，两角顶点不同则都标黄

项目过程图里深红与深蓝线、黄点即来自这类结论。

## 共线：D,C,M are collinear

\`\`\`javascript
const points = conclusion.match(/[A-Za-z]+/g)?.filter(
  (s) => s !== 'are' && s !== 'collinear'
) || []
highlightElements.redLines.push([points[0], points[1]])
highlightElements.redLines.push([points[1], points[2]])
\`\`\`

取连续三点形成的两段红线，表达在同一直线上。

## 共圆：A,C,F,E are concyclic

\`\`\`javascript
highlightElements.redCircles.push(points.map((s) => s.toLowerCase()))
\`\`\`

Canvas 侧用前三点算外接圆，画红色虚线圆。

## 线段比例：BQ:BM = BM:BN

先去空格再匹配，避免 BQ : BM 与 BQ:BM 不一致：

\`\`\`javascript
const normalized = conclusion.replace(/\\s+/g, '')
const ratioMatch = normalized.match(/([A-Za-z]+):([A-Za-z]+)=([A-Za-z]+):([A-Za-z]+)/)
// seg1 进 redLines，seg2 进 lightRedLines，seg3 进 blueLines，seg4 进 lightBlueLines
\`\`\`

四段线段用深浅红与蓝区分，表达比例关系里的四个名。

## 平行与相等：AB//CD、AB = CD、AB ∥ CD

统一规范化分隔符：

\`\`\`javascript
const normalizedConclusion = conclusion.replace(/\\s*([\\/]{2}|[=]{1,2}|∥)\\s*/g, '$1')
const separators = ['∥', '//', '==', '=']
\`\`\`

按优先级拆成两段线段名，取首尾字母为端点，分别进 redLines 与 blueLines。

## 外心：G_1 is the circumcenter of ΔAMC

\`\`\`javascript
const circumcenterMatch = conclusion.match(
  /([A-Za-z0-9_]+)\\s*is\\s*the\\s*circumcenter\\s*of/
)
const triangleMatch = conclusion.match(/circumcenter of [\\\\Δ&a-zA-Z;]+([A-Za-z]+)/)
\`\`\`

- 外心点名去掉 _ 后与 parsedData.points 对齐 g1：yellowPoints 标外心，redCircles 用 外心, 三角形某一顶点 画半径圆

## 正则实践里的坑

1. **优先级**：比例、平行、角相等句式可能部分重叠，用 if 与 else if 链固定顺序
2. **大小写**：存储点名为小写，匹配后统一 toLowerCase
3. **G_1 vs g1**：外心要先 replace /_/g, ''
4. **空格**：比例、等号两侧空格用 replace /\\s+/g, '' 抹平
5. **匹配失败**：console.warn 留痕，播放时某条无高亮多半是句式未覆盖

不是一个万能正则，而是一类结论一个模式，玩具项目里这样最快。

## 与解析层的关系

Parser 产出的是几何实体；正则层产出的是当前结论关心哪些实体。两层绝不合并：否则改 IMO 文件格式就要动高亮逻辑。

## 小结

高亮联动的本质是把结论文本映射成高亮 DSL 红边、蓝边、黄点、红圆数组。角相等与共圆两类句式覆盖了过程图里最典型的视觉效果；新句式按同样模式加分支即可。

标签：Vue.js, Canvas
`;export{n as default};
