const n=`---
title: "统计图表模板平台"
description: "Vue 3 与 ECharts 实现的二十余套可配置统计图表模板，覆盖水滴图、层级环图与深蓝和浅色双主题看板。"
date: "2024-02-01"
gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(29, 78, 216, 0.34) 100%)"
status: "已完成"
category: "viz"
tier: "collab"
demoUrl: null
codeUrl: null
featured: true
cover: "/images/projects/real-estate-viz/cover.png"
coverLayout: wide
---

## 项目概述

统计图表模板平台是课题组产学研课题中的前端图表组件库与演示系统。我在 2023 年 12 月至 2024 年 2 月参与开发，把统计指标封装成可复用、可配置的 Vue 图表页面，支持报告场景快速出图。

系统采用 Element Plus 后台布局，侧栏导航、面包屑与路由切换构成整体框架。左侧菜单集中管理二十余套图表模板，每套图表均支持配置项抽屉实时调参，兼顾深蓝科技风与浅色商务风两种主题变体。

## 界面展示

详情页顶部项目预览为 A1 水滴图，展示非私营单位就业人员工资总额，顶部数字翻牌与国有、集体与其他单位三组液位占比并列呈现，支持年份与配色配置。

### B1 就业人员总数三产业液位环图

![B1 三产业就业人员结构](/images/projects/real-estate-viz/detail-b1.png)

第一、第二、第三产业并列展示，ECharts liquidFill 与定制底座图标叠加；顶部汇总总人数，底部标注单位、制图方与数据来源。

## 图表模板体系

平台按业务场景划分多系列模板，通过 Vue Router 独立路由挂载，便于按需组合进报告或大屏。

| 系列 | 代表页面 | 图表形态 | 说明 |
|------|----------|----------|------|
| 基础 | 水库图、水滴图 | 液位与环形水库 | 投资、资金类占比展示 |
| A 系 | A1、A3 | 水滴图、多维对比 | 工资总额、分地区多指标对比 |
| B 系 | B1、B2、B4 | 液位环图、条形组合 | 就业人员、产业结构等 |
| M 系 | M1 至 M5 | 柱状与折线组合 | 货运量等指标，支持年份与地区筛选 |
| C 系 | C1 blue 与 white | 主题柱状图 | 生活垃圾无害化处理等环保指标 |
| G、D、H、J 与 L | G1 至 G3、D1、H1、J1、L1、L2 | 定制信息图 | 图标与 ECharts 混合排版 |

同一模板常提供 blue 与 white 双主题，适配深色大屏与浅色报告两种输出场景。

\`\`\`javascript
const liquidOption = {
  series: [{
    type: 'liquidFill',
    data: [ratioState.value],
    color: theme.value === 'blue' ? ['#1d4ed8'] : ['#3b82f6'],
    outline: { show: false }
  }]
}
chart.setOption(liquidOption)
\`\`\`

## 核心功能

### 后台导航与路由画廊

可折叠侧栏菜单，路由直达各图表组件。顶部面包屑为个人中心、前端、图表页层级。页面切换带 fade-right 过渡动画。

### 配置项抽屉

每套图表内置配置项按钮，通过 el-drawer 暴露标题内容、颜色、字号等文本项，液位顶部底部颜色、边框样式等图形项，以及年份、地区、指标下拉等数据项。修改后即时刷新 ECharts setOption，无需重载页面。

\`\`\`javascript
watch(configForm, () => {
  chart.setOption(buildOption(configForm), { notMerge: false })
}, { deep: true })
\`\`\`

### 数据接入

Axios 统一请求封装，预留后端地址；axios-mock-adapter 模拟 A1、A3、B1 等接口，支持 1970 至 2022 年多年历史序列；xlsx 解析 Excel 数据源，便于对接客户上传表格。

### 交互增强

自定义 v-candrag 指令让制图署名、数据来源等标注可拖拽定位；数字翻牌动画与液位渐变填充强化大屏展示效果。

\`\`\`javascript
app.directive('candrag', {
  mounted(el) {
    el.onmousedown = e => {
      const startX = e.clientX - el.offsetLeft
      document.onmousemove = ev => {
        el.style.left = ev.clientX - startX + 'px'
      }
    }
  }
})
\`\`\`

## 技术实现

前端用 Vue 3、Vite 与 Vue Router 组织二十余套图表页面；Element Plus 承担布局、抽屉、表单与年份选择器；ECharts 5 与 echarts-liquidfill 负责液位图、柱状图与折线图；Axios、mock 适配器与 xlsx 处理接口请求与表格解析。

## 职责与成果

- 参与 A、B、M 等多个系列图表的前端实现与样式调优
- 封装配置项抽屉与 ECharts 联动逻辑，降低改图时的代码改动成本
- 完成深蓝主题水滴图、三产业液位环图等典型模板
- 与团队通过 Git 协作交付，完成多轮合并与联调

技术栈：Vue 3, Vite, Vue Router, Element Plus, ECharts, echarts-liquidfill, Axios, xlsx, JavaScript
`;export{n as default};
