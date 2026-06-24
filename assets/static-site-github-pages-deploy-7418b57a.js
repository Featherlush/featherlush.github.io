const n=`---\r
title: Vite 静态站部署到 GitHub Pages\r
excerpt: npm run build 产出 dist，History 路由要配回退，子路径托管要设 base，可用 Actions 自动发布。\r
category: 成长随笔\r
categoryId: career\r
date: 2025-06-23\r
author: 徐宁\r
---\r
\r
个人站没有后端，构建产物就是 dist 里的 HTML、JS 与 CSS。2025 年 6 月把部署流程写成固定步骤，避免每次手动拷文件漏 404 回退。构建分包见 [Vite 分包篇](/blog/vite-chunking-content-manifest)；仓库结构见 [个人站框架篇](/blog/personal-site-framework-overview)。\r
\r
## 本地构建与预览\r
\r
\`\`\`bash\r
npm run build\r
npm run preview\r
\`\`\`\r
\r
prebuild 会跑 generate-content-manifest.mjs，列表元数据与正文 chunk 与开发环境一致。发布前在 preview 里点开博客详情、项目详情，确认懒加载正常。\r
\r
## History 模式与静态托管\r
\r
路由使用 createWebHistory：\r
\r
\`\`\`javascript\r
createRouter({\r
  history: createWebHistory(`/`),\r
  routes: [...],\r
})\r
\`\`\`\r
\r
用户直接打开 /blog/vue3-composition-patterns 时，服务器会去找同名物理文件，找不到就 404。SPA 需要把所有路径回退到 index.html，再由 Vue Router 接管。\r
\r
| 托管方式 | 常见做法 |\r
|----------|----------|\r
| GitHub Pages | 复制 index.html 为 404.html，或 Actions 部署时一并上传 |\r
| Nginx | try_files 回退到 index.html |\r
| Cloudflare Pages | 单页应用回退规则指向 index.html |\r
\r
若用 Hash 模式 createWebHashHistory，URL 带 #，可免去服务器回退，但链接不美观，个人站仍选 History。\r
\r
## base 与子路径\r
\r
vite.config.js 默认 base 为 /，适合用户页 username.github.io 根域名。\r
\r
若仓库名托管，例如 username.github.io/repo-name/，需设：\r
\r
\`\`\`javascript\r
export default defineConfig({\r
  base: '/repo-name/',\r
})\r
\`\`\`\r
\r
否则 JS 与 CSS 会从根路径加载导致 404。`/` 会同步给 Vue Router，路由与资源前缀一致。\r
\r
## GitHub Pages 发布流程\r
\r
以 featherlush.github.io 用户站为例：\r
\r
1. 仓库 Settings，Pages，Source 选 GitHub Actions 或 Deploy from branch\r
2. 分支发布，把 dist 内容推到 gh-pages 分支或 docs 目录\r
3. Actions 发布，workflow 里 npm ci、npm run build，用 upload-pages-artifact 与 deploy-pages\r
\r
Workflow 要点：\r
\r
- permissions 需要 pages write 与 id-token write，构建在 ubuntu-latest，Node 版本与本地一致，产物目录 dist，不要带上 node_modules\r
\r
## 环境变量与密钥\r
\r
个人站评论用 Giscus，仓库 ID 写在 site.json，属于公开配置，可进 Git。若以后接需要密钥的 API，用 GitHub Repository secrets，在 Actions 里注入 env，不要写进 Markdown 或前端 bundle。\r
\r
## 缓存与更新\r
\r
Vite 文件名带 content hash，index.html 引用新 chunk。部署后若读者看到旧版，多半是 CDN 或浏览器缓存了旧 index.html。给 index.html 设较短缓存，静态资源可长期缓存。\r
\r
## 与后端 API 分离\r
\r
竞赛项目里 APK 指向云服务器 API，见 [阿里云部署篇](/blog/jlapp-aliyun-windows-deploy)。个人站纯静态，评论走 Giscus，不占用自建服务器。前后端域名分离时注意 CORS 只影响 API 请求，不影响静态页本身。\r
\r
## 小结\r
\r
静态站上线三件套是 build 产物完整、History 回退、base 与托管路径一致。本地 preview 过关后再推 Actions，比直接在 Pages 上试错省时间。\r
\r
标签：Vue.js, 工程化, 个人网站\r
`;export{n as default};
