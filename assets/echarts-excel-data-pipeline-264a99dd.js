const n=`---
title: "Excel 读入与柱状图联动"
excerpt: "G1 页用 axios 拉 xlsx、sheet_to_json 找年份行，再把百分比塞进 bar 和 markPoint。"
category: "前端开发"
categoryId: "frontend"
date: "2024-02-14"
author: "徐宁"
project: real-estate-viz
series: echarts-notes
---

图表模板里不少数据不是写死在 JS 里，而是放在 \`public/excel/\` 的 xlsx 文件。G1 高等学校自然科学领域发表论文占比是我第一次完整走通 **拉文件、解析并驱动 ECharts** 的页面。option 与抽屉联动见 [setOption 篇](/blog/echarts-setoption-config-panel)。

## 数据链路

\`\`\`javascript
import axios from 'axios'
import * as XLSX from 'xlsx'

loadData() {
  return axios.get('/excel/某统计表.xlsx', {
    responseType: 'arraybuffer',
  }).then(response => {
    const data = new Uint8Array(response.data)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet)
    const targetRow = json.find(item => item['年份'] === this.selectedYear)
    this.allper1 = targetRow['自然科学'].toFixed(3)
  })
}
\`\`\`

步骤：

1. \`arraybuffer\` 响应，避免编码问题
2. \`XLSX.read\` 与 \`sheet_to_json\`，表头变成对象键名
3. \`find\` 按年份列筛行，写入 Vue data
4. \`watch selectedYear\` 或抽屉确认后重新 \`loadData\` 与 \`fillMyChart\`

B4、L2、G3 等页面也是同一套 axios 与 xlsx，只是列名和筛选逻辑不同。

## 柱状图，空格撑开类目轴

G1 的 x 轴类目故意插入空格，让四根柱子拉开间距：

\`\`\`javascript
xAxis: [{
  type: 'category',
  data: [' ', '农业科学', ' ', '医疗科学', ' ', '工程科学', ' ', '自然科学'],
  axisLabel: { show: false },
}]
series: [{
  type: 'bar',
  data: [this.allper5, this.allper1, this.allper5, this.allper2, ...],
  itemStyle: {
    color: function (params) {
      const colorList = ['#ffffff', '#1cc99c', '#ffffff', '#0185f2', ...]
      return colorList[params.dataIndex]
    },
  },
}]
\`\`\`

白色条是占位，有色条才是数据，比调 \`barGap\` 更直观，和设计稿对齐也快。

## markPoint 贴 PNG 标记

柱顶还要叠小图标，用 \`markPoint\` 与 \`symbol: 'image://...'\`。\`xAxis\` 写类目名、\`yAxis\` 写数值，偏移用 \`symbolOffset\` 微调。底部另有四张静态 PNG 做学科图标，和柱图 markPoint 是两套图，不要混在一个 series 里。叠层思路见 [图层篇](/blog/echarts-layer-composition)。

## 和配置项抽屉的配合

G1 抽屉里只有年份下拉。改年份后 \`loadData().then(() => this.fillMyChart())\`，避免数据还没回来就 \`setOption\`。

若 Excel 缺某年行，\`find\` 会返回 \`undefined\`，要先判断再 toFixed，否则控制台报错且图表空白。

## 列名与表头稳定性

\`sheet_to_json\` 把第一行当键名。若 Excel 多了一行说明文字、或表头有空格，键名会变成带空格的字段或 \`undefined\` 列。做法，用官方模板 xlsx，不手改表头；解析后 \`console.log(json[0])\` 核对键名一次；缺列时在页面上显示数据缺失而不是静默失败。

## 异步与竞态

用户快速切换年份时，可能先发请求 2018、再发 2020，若 2018 响应更慢，会 **覆盖新数据**。严谨写法是给每次请求加序号或 \`AbortController\`；当时项目用 \`selectedYear\` 在 then 里比对是否仍为当前选中值。

## 小结

**xlsx 是数据源，option 是视图**。列名与统计年鉴表头一致时，改 Excel 不用改代码。

标签：ECharts, Axios
`;export{n as default};
