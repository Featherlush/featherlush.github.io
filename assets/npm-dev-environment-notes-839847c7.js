const n=`---
title: "npm 与前端工程环境学习记录"
excerpt: "产学研图表模板课题上手时，从 Node.js、package.json 到 Vite 脚本，整理 npm 环境搭建与日常命令笔记。"
category: "成长随笔"
categoryId: "career"
date: "2024-01-10"
author: "徐宁"
project: real-estate-viz
---

2023 年底加入课题组产学研课题，第一次独立维护团队里的 Vue 图表前端。在此之前只在课堂作业里用过简单 HTML 页面，**npm、Vite、依赖管理**几乎从零开始。这篇记录当时边做边查、边踩坑写下的笔记，工程环境理顺之后，才轮到 Git 协作和 ECharts 绘图。

## 为什么需要 npm

浏览器不能直接安装第三方库。团队项目要用 Vue、ECharts、Element Plus，就必须有：

1. **包管理器** npm，下载并锁定依赖版本
2. **构建工具** Vite，把 \`.vue\`、ES Module 打包成浏览器可运行的文件
3. **脚本入口** \`package.json\` 的 \`scripts\`，用统一命令启动开发与构建

第一次 \`npm install\` 看到项目根目录出现 \`node_modules\`，体积动辄几百 MB，当时很震惊。后来才明白每个依赖还可能有自己的依赖，树状展开后体积就大了。

## 项目里的 package.json 长什么样

图表模板项目的依赖非常典型，摘一段当时反复对照的片段：

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.11",
    "vue-router": "^4.2.5",
    "element-plus": "^2.5.3",
    "echarts": "^5.4.3",
    "echarts-liquidfill": "^3.1.0",
    "axios": "^1.6.7",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.6.2",
    "vite": "^5.0.8"
  }
}
\`\`\`

几个字段的含义：

| 字段 | 作用 |
|------|------|
| \`dependencies\` | 运行时需要的库，会打进最终产物 |
| \`devDependencies\` | 只在开发与构建阶段用，例如 Vite 本身 |
| \`scripts\` | 快捷命令别名，\`npm run dev\` 实际执行 \`vite\` |
| 版本号前的 \`^\` | 允许安装兼容的较新版本，小版本可自动升级 |

> **踩坑** 改完 \`package.json\` 后如果只 \`npm install\` 了新包，但 dev 服务没重启，有时会报找不到模块。养成 **装包后重启 dev** 的习惯。

## 常用命令与使用场景

\`\`\`bash
# 根据 package.json 安装全部依赖，克隆仓库后第一步
npm install

# 启动开发服务器，支持热更新
npm run dev

# 打包生产环境静态文件到 dist/
npm run build

# 本地预览 build 结果，检查打包是否正常
npm run preview
\`\`\`

图表模板项目 \`vite.config.js\` 里开启了 \`host: "0.0.0.0"\`，方便同事在同一局域网访问本机做联调：

\`\`\`javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    open: true,
  },
})
\`\`\`

## node_modules 与 package-lock.json

- **\`node_modules\`**，真实安装的包，**不要提交到 Git**体积大且可复现
- **\`package-lock.json\`**，锁定每一层依赖的精确版本，团队应一并提交，保证大家装出来一致

我有一次删了整个 \`node_modules\` 再 \`npm install\`，项目又能跑了，说明锁文件是可靠的。反过来，只删 lock 文件再 install，可能拉到不同子依赖，偶发别人电脑能跑我这边报错。

## 安装新包时的两种写法

\`\`\`bash
# 运行时依赖，会写进 dependencies
npm install axios

# 开发依赖，会写进 devDependencies
npm install -D sass
\`\`\`

项目里加 \`echarts-liquidfill\` 时，前辈提醒要用第一种，因为图表运行时要加载这个扩展。

## 当时总结的几条习惯

1. 克隆仓库后 \`npm install\` 后 \`npm run dev\`，先确认能跑再改代码
2. 遇到模块报错，看是不是没 install、版本不对，或 dev 没重启
3. 不要随便改 lock 文件；冲突时找同事一起解决而不是直接删
4. npm 和 node 版本差异偶尔会导致 install 失败，记下本机版本，可用 node -v 与 npm -v 查看

## public 目录与静态资源

图表项目把 Excel、示例 JSON 放在 \`public/excel/\` 下，页面里用 \`/excel/文件名.xlsx\` 访问。Vite 不会打包处理这些路径，**部署时整个 public 会原样拷贝**。我改 G1 页数据时只替换 xlsx 文件，不用重新 build 逻辑代码。

图片资源在 \`src/img/\`，通过相对路径或 CSS \`background\` 引用。图表模板更依赖设计师给的 PNG 底座，体积大，不适合塞进 JS bundle。

## 环境变量与代理

图表模板项目没有接真实后端，Mock 在 \`main.js\` 或单独文件里挂 axios adapter。若接 API，可在 \`vite.config.js\` 配 \`server.proxy\` 把请求前缀转发到后端服务；开发环境走代理、生产环境走 Nginx 同源，和 npm 脚本一样属于工程环境配置。

## 小结

npm 环境本身不复杂，难的是把它和 **Vite、Vue 单文件组件、路径别名** 串成一条完整链路。图表模板项目是我第一次完整走通这条链路，从 \`npm install\` 到侧栏菜单里点进 A1 水滴图页面。后面学 Git 协作、ECharts 绘图，都建立在这套工程环境之上。

标签：工程化, Vite
`;export{n as default};
