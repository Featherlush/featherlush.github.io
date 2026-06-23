const n=`---
title: "HBuilder 打 APK 时的相对路径踩坑"
excerpt: "Vite 默认 base 为根路径，打进 APK 后 JS 和 CSS 404 白屏。相对路径 base、Hash 路由和 API 地址三件事要分开配。"
category: "前端开发"
categoryId: "frontend"
date: "2024-08-12"
author: "徐宁"
project: jiuli-app
series: vue-notes
---

HBuilder 把 dist 打进 Android APK 后，页面在 WebView 里用 file 协议或应用沙箱路径打开，和 npm run dev 的 localhost 完全不同。我打包时因为资源用了绝对路径，花了很多时间：安装成功，打开却是白屏或只有壳没有图。根因是 Vite 默认 base '/'，打包后 JS/CSS 去根路径找文件，在 APK 里根本不存在。

## 正确设置：Vite base './'

\`frame/vite.config.js\`：

\`\`\`javascript
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
\`\`\`

含义：构建产物里引用脚本、样式、图片时用相对当前 HTML 的路径 \`./assets/index-xxx.js\`，而不是 \`/assets/...\`。这样在 HBuilder 打包的任意目录层级下都能加载。

我失败时的典型现象：

- 浏览器直接打开 dist/index.html 本地文件，控制台 404 /assets/...
- APK 安装后首页空白，Network 里主 bundle 加载失败

改成 base './' 后重新 npm run build，再拷进 HBuilder，白屏问题才消失。

## 构建流程

1. 本地 frame 目录：npm install
2. 确认 API 地址环境变量指向已部署的后端，勿写进公开仓库
3. npm run build 生成 dist/
4. 用 HBuilder 新建 5+ App 或打开已有壳工程
5. 将 dist 内容设为 Web 资源根目录或按 HBuilder 文档映射到 www
6. 配置应用图标、启动页、包名
7. 云打包或本地打包生成 APK
8. 真机安装，先测静态页能否打开，再测登录接口

## 两类路径不要混

| 类型 | 该怎么配 | 错误示范 |
|------|----------|----------|
| 静态资源 JS、CSS、图片 | \`base: './'\`，资源放 assets 或 public | \`base: '/'\` 或 HTML 里写 \`/logo.png\` |
| 接口 API | 完整 HTTP 或 HTTPS 服务地址，部署后的后端 | 写成 \`./api\` 或 \`/api\`，file 协议下无效 |

我一度把 API 也要相对路径和静态资源要相对路径混在一起，其实只有静态资源需要 \`./\`；axios 的 baseURL 必须是手机能访问到的服务器地址，见阿里云部署篇。

## Hash 路由与打包

项目使用 createWebHashHistory()，index.html 只需加载一次，路由在 # 后切换，不依赖服务器 rewrite。这与 base './' 是黄金组合：APK 内无需配 History fallback。

若误用 History 模式，WebView 里深链接可能直接找不到文件。

## 其他打包注意点

- 先 build 再打包：改 Vue 代码后必须重新 npm run build，不要直接把旧 dist 打进 APK
- @vitejs/plugin-legacy：旧 WebView 若缺 ES 特性，保留 legacy 插件；同时测一台旧 Android
- build.minify false 仅为调试体积大；发布前可按需打开压缩
- 图片：src/assets 走打包路径；public 下文件原样拷贝，引用时用相对或根相对路径，避免手写绝对 /

## 真机联调检查清单

1. 不连后端，首页静态布局是否正常验证 base
2. 登录接口是否可达验证 API 地址与安全组
3. Tab 切换、闯关页路由是否正常验证 Hash
4. 轮播图、大图是否 404验证资源路径
5. 清除应用缓存后重装，避免旧 dist 残留

## 小结

HBuilder 打包失败，十有八九是静态资源路径问题：\`npm run build\` 前把 Vite \`base\` 设为 \`'./'\`，重新构建后再进 HBuilder。API 地址则单独配置为可访问的后端 URL，不要用 \`./\` 代替。Hash 路由与相对 base，是 Web 壳 APK 最省心的组合。

标签：Vue.js, 工程化, 移动开发
`;export{n as default};
