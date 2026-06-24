const n=`---
title: 桑基、漏斗与象形柱图选型
excerpt: A3 桑基、M5 漏斗、B4 堆叠条，同一套模板里几种进阶类型的第一印象和适用场景。
category: 前端开发
categoryId: frontend
date: 2024-02-22
author: 徐宁
project: real-estate-viz
series: echarts-notes
---

liquidFill 和基础柱状之后，项目里开始出现 **sankey、funnel、pictorialBar** 等类型，同一套模板还要做 **蓝白** 两套主题。这篇按页面记我的选型理解。M5 漏斗叠层见 [图层篇](/blog/echarts-layer-composition)；深蓝主题见 [主题篇](/blog/echarts-dark-theme-axis-tooltip)。

## A3，桑基图看结构，不只看数值

A3 多类别桑基示例用 \`type: 'sankey'\` 展示类别之间的流向关系。地区、年份下拉筛选后，节点与边的权重会变。

\`\`\`javascript
series: [{
  type: 'sankey',
  emphasis: { focus: 'adjacency' },
  data: nodes,
  links: links,
  lineStyle: { color: 'gradient', curveness: 0.5 },
}]
\`\`\`

学习点，**nodes 与 links** 两套数据，比 xAxis 或 yAxis 多一步数据准备；\`lineStyle.color: 'gradient'\` 让边有方向感；深蓝背景上，label 和边都要调高对比度。

桑基适合 **总量拆分到多个子类** 的结构叙事，比堆叠柱更强调 **路径**。

## C1，象形柱图 pictorialBar

C1 生活垃圾无害化处理用 **pictorialBar**，\`symbol\` 指向自定义图片：

\`\`\`javascript
series: [{
  type: 'pictorialBar',
  symbol: 'image://../src/img/C1-01.png',
  symbolRepeat: 'fixed',
  symbolClip: true,
  data: this.dataList1,
}]
\`\`\`

条形由小图标重复拼成，比纯色柱更有环保主题表现力。\`symbolClip: true\` 按数值裁剪图标长度；深色主题下 axis、splitLine 要统一成浅色。

象形柱适合 **强主题、弱精确** 的展示；精确读数仍靠 label 或 tooltip。

## M5，漏斗图与 graphic 标注

M5 货运量对比用 \`type: 'funnel'\`，配合 \`graphic\` 画三角区域和分类文字。年份、地区抽屉切换后，漏斗层级和数据一起变。

漏斗图要点，\`funnelAlign: 'center'\` 适合居中对称版式；漏斗 与 外部 PNG 装饰要一起调，否则箭头对不准层级；数据是 **逐级减量** 时比 bar 更直观。

## 双主题，blue 与 white 变体

项目里 B4、C1、M5、D1 等常有 \`_blue\` 与 \`_white\` 两个文件：

| 主题 | 典型背景 | option 调整 |
|------|----------|-------------|
| blue | 深蓝大屏 | 白 或 浅蓝文字，axis 浅色 |
| white | 浅灰报告 | 深色文字，浅 splitLine |

不是简单换 CSS 背景，**axisLabel、splitLine、legend 颜色都要进 option**。后来的做法是抽一份 \`baseOption\`，主题只覆盖 \`textStyle、axis、background\` 相关字段。

## 怎么选型

| 业务问题 | 优先考虑 |
|----------|----------|
| 占比、液位 | pie 或 liquidFill |
| 类别对比 | bar 或 pictorialBar |
| 结构拆分、流向 | sankey |
| 阶段递减 | funnel |
| 时间序列 | lineM 系部分页面 |

官网 Examples 里先搜中文关键词，再对照项目里的 \`chart*.vue\` 改，效率最高。

## 与 Mock 数据联调

A3、B1 等页在接口未就绪时用 **axios-mock-adapter** 造多年、多地区数据。进阶图表往往 **数据结构更复杂**，links 数组、nodes 数组，Mock 时先保证字段名与真接口一致。Excel 管线见 [数据链路篇](/blog/echarts-excel-data-pipeline)。

## sankey 数据准备要点

nodes 里每个节点要有唯一 \`name\`；links 里 \`source\`、\`target\` 必须对应 nodes 的 name。最常见 bug 是 **source 与 target 字符串多空格**，边不显示且无报错。

## pictorialBar 的图片尺寸

\`symbolSize\` 或图片本身像素会影响条形颗粒感。C1 环保图标若太密，要调 \`symbolMargin\` 或换更小的 symbol 图。

## funnel 排序与 sort

漏斗默认按数值排序。若业务要求固定顺序，设 \`sort: 'none'\` 并按 data 数组顺序传入。M5 改 sort 后，外部 PNG 箭头要对准新层级，又要调一圈绝对定位。

## D1 等页面的补充

D1 等页还有 **堆叠 bar 与双 y 轴** 组合，和桑基、漏斗同属进阶 SKU。选型时先问产品要 **比大小、看结构、看阶段递减** 哪一种，再翻项目里有没有现成 \`chart*.vue\` 可抄。

## 小结

进阶类型没有更难的神学，而是 **多一种数据形状与多一种 option 模板**。二十多个页面，本质是 **可复用的图表 SKU**。系列综合难度最高的一页是 [H1 十一座水库液位网格](/blog/echarts-h1-reservoir-grid)，把多实例和图层叠放合在一起练。

标签：ECharts
`;export{n as default};
