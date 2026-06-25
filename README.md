# 个人作品集 · 静态站点部署包

本目录是 `npm run build` 生成的**生产环境静态文件**，可直接上传到任意静态托管服务（GitHub Pages、Nginx、Cloudflare Pages 等）。

> **请勿在本目录手改业务内容。** 页面、博客、项目与简历文案均在源码仓库的 `content/` 与 `src/` 中维护，修改后重新构建并覆盖部署。

---

## 目录说明

```
dist/
├── index.html          # 站点入口（首页）
├── 404.html            # SPA 兜底页（与 index.html 相同，供托管平台回退）
├── logo.svg            # 站点图标
├── assets/             # 打包后的 JS、CSS（文件名含 content hash）
├── images/             # 图片等静态资源
├── resume/             # 简历 PDF 等下载文件
├── about/              # 一级路由实体页（History 模式直链用）
├── experience/
├── projects/           # 含各项目 slug 子目录
├── blog/               # 含各文章 id 与 series 子目录
├── contact/
├── resume/
└── README.md           # 本说明
```

构建脚本 `scripts/postbuild-github-pages.mjs` 会在打包后为已知路由生成 `{path}/index.html`，避免用户直接打开深层链接时出现 404。

---

## 如何生成

在源码仓库根目录执行：

```bash
npm install
npm run build
```

流程说明：

1. `prebuild`：生成博客与项目清单（`src/generated/*-manifest.json`）
2. `vite build`：输出本目录
3. `postbuild`：写入 `404.html` 与各路由 `index.html`

本地预览构建结果：

```bash
npm run preview
```

---

## 部署方式

### 1. GitHub Pages（推荐）

源码仓库已配置 Actions（`.github/workflows/deploy-github-pages.yml`）：

- 推送到 `main` / `master` 分支后自动构建并发布
- 产物目录为本 `dist` 文件夹

若**手动**将本目录推送到 Pages 仓库或 `gh-pages` 分支：

```bash
# 在 dist 目录内（示例）
git add .
git commit -m "deploy: update site"
git push origin master
```

仓库 Settings → Pages 中选择对应分支与根目录即可。

当前站点默认 `base: '/'`，适用于 **username.github.io** 根域名。若改为子路径托管（如 `/repo-name/`），需在源码 `vite.config.js` 设置 `base` 后重新构建。

### 2. Nginx

将本目录内容放到站点根目录，并配置 History 路由回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. Cloudflare Pages / 其他静态托管

- **构建命令**：在源码仓库执行 `npm run build`（或在 CI 中构建）
- **输出目录**：`dist`
- **SPA 回退**：将所有未匹配路径指向 `/index.html`（Cloudflare Pages 可选「Single Page Application」模式）

---

## 部署检查清单

发布前建议确认：

- [ ] 首页、介绍、经历、项目、博客、简历、联系页均可打开
- [ ] 直接访问深层链接（如 `/blog/xxx`、`/projects/xxx`）返回 200 而非 404
- [ ] 夜间模式、简历 PDF 下载、Giscus 评论（联系页）正常
- [ ] 浏览器无 JS/CSS 404（尤其子路径部署时检查 `base`）

---

## 缓存说明

- `assets/` 内文件名带 hash，可长期缓存
- `index.html` 与各路由 `index.html` 建议较短缓存，便于发布后尽快生效
- 若更新后仍看到旧版，清除 CDN 或浏览器缓存后再试

---

## 技术概要

| 项目 | 说明 |
|------|------|
| 框架 | Vue 3 + Vue Router（History 模式） |
| 构建 | Vite 4 |
| 内容 | Markdown 驱动，构建时打入 JS chunk |
| 评论 | Giscus（GitHub Discussions，配置见源码 `content/profile/site.json`） |
| 后端 | 无；纯静态站点 |

---

## 常见问题

**Q：可以直接改 dist 里的 HTML 吗？**  
A：下次 `npm run build` 会覆盖。请在源码修改后重新构建。

**Q：为什么有很多重复的 index.html？**  
A：为支持 History 路由直链。每个文件内容相同，由 Vue Router 在浏览器端解析真实页面。

**Q：需要上传 node_modules 吗？**  
A：不需要。部署包仅包含本目录内的静态文件。

---

## 源码仓库

开发与内容维护请回到 PersonalIntroduction 源码项目，参见根目录 `README.md`。
