const n=`---
title: "图表、PNG 与绝对定位的叠层"
excerpt: "B1 三产业页和 M5 货运漏斗里，ECharts 常常只占画面一半，其余靠 PNG 和 z-index 对齐。"
category: "前端开发"
categoryId: "frontend"
date: "2024-02-12"
author: "徐宁"
project: real-estate-viz
series: echarts-notes
---

ECharts 官网示例大多是一个 div 铺满图表。图表模板项目里却经常见到 **一半 ECharts，一半 PNG 与 CSS**。这篇记录我在 B1、水库图、M5 货运页里学到的图层思路。liquidFill 外壳见 [PNG 外壳篇](/blog/echarts-css-liquidfill-shell)。

## 典型结构，图表容器与装饰图

B1 就业人员三产业每个柱子是这样排的：

\`\`\`html
<div class="mid-img">
  <div class="f-2">{{ allnum1 }}</div>
  <div class="f-3">{{ formatPercentage(allper1) }}</div>
  <img src="../img/B1-01.png" style="width: 220px; position: absolute; z-index: 3; top: 75px;" />
  <div ref="pieFill1" style="height: 100%; width: 250px; position: relative; top: 15px; left: -15px;"></div>
  <div class="f-1">第一产业</div>
</div>
\`\`\`

- **PNG**，产业图标底座z-index: 3
- **ECharts**，半透明环图模拟液位在 PNG 上下之间
- **纯文本 div**，人数、百分比z-index: 4，压在最上

图表不是独立组件，而是 **信息图的一层楼**。

## 水库图，环图与右侧文字区

\`chart1\` 左侧 \`pingFill\` 容器画 ECharts，右侧用 flex 排合计、对外借款、直接投资等条目，左侧叠 \`pic-14.png\` 当水库外框。ECharts 只负责 **环形的填充比例**，业务数字用 HTML 展示更灵活单位、千分位、多行说明。

要点，**数字越大越重要时，别硬塞进 ECharts label**，旁边用 DOM 往往更好排版。

## M5，漏斗图、五张装饰图与自定义图形

M5 货运量页更复杂，主体 \`funnelChart\` 容器画 **funnel 漏斗图**；周围绝对定位 M5-1.png … M5-5.png 做箭头、底座装饰；option 里还有 \`graphic\` 配置 **polygon、text**，在画布上画三角、标注货运量。

ECharts 的 **graphic 组件** 和外部 PNG 可以并存，简单几何用 graphic，复杂造型用切图。

## z-index 与定位的协作规则

项目里我给自己定的顺序：

1. **背景 或 大装饰图**，z-index 1–2
2. **ECharts 容器**，z-index 2，必要时 \`left\` 微调对齐切图
3. **前景文字、图标**，z-index 3–4
4. **可拖拽署名**，绝对定位，不参与图表布局

改 ECharts 尺寸后，PNG 往往要跟着调 \`top/left\`，这是信息图项目的维护成本，也是视觉效果的来源。

## resize 时别忘了两层

侧栏折叠、窗口缩放时，调 \`myChart.resize()\`，并检查绝对定位元素是否错位有时要重新算 offset。只 resize 图表，装饰图不会自动对齐。

## 响应式与固定像素

B1 产业图 PNG 宽度写死 220px，环图容器 250px。大屏上看起来合适，笔记本上有时 **环图偏出底座**。当时没有接 rem 适配，靠设计稿固定像素，信息图项目的常态。图表模板更偏 **固定展板尺寸**，当时未做响应式断点适配。

## graphic 与外部 PNG 的分工

M5 里简单三角、分类文字用 \`graphic\`；复杂箭头用 M5-1.png。判断标准，**能否用矢量 与 纯色表达**。能则用 graphic，改色方便；不能则切图。

## 何时用 ECharts，何时用 HTML 与 CSS

| 需求 | 更合适的方式 |
|------|----------------|
| 比例、液位、漏斗形态 | ECharts series |
| 大标题、单位、来源署名 | HTML 与 CSS |
| 复杂插画、品牌底座 | PNG 或 SVG 背景 |
| 简单箭头、三角标注 | graphic 或 CSS |

## 小结

图表模板平台的好看，很多时候不是 option 有多炫，而是 **图层分工清晰**，图表层、标注层、装饰层。H1 十一座水库页把叠层推到极端，见 [水库网格篇](/blog/echarts-h1-reservoir-grid)。

标签：ECharts, 数据可视化, CSS
`;export{n as default};
