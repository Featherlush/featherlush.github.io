const n=`---
title: 竞赛全栈哪些模块适合 Vibe Coding
excerpt: 究理 APP 与旅游 APP 联调复盘。CRUD 与样式可 vibe，鉴权、部署与 APK 路径要人盯。
category: 成长随笔
categoryId: career
date: 2026-06-23
author: 徐宁
series: vibe-coding-notes
project: jiuli-app
---

2024 到 2025 年两届浙江省多媒体竞赛，我分别带队做完究理 APP 与旅游 APP，前端是 Vue 移动壳或管理台，后端是 Express 或 Flask，还要 MySQL、打包 APK。2026 年 6 月用 Vibe Coding 维护个人站时，我反复想起竞赛交付里哪些模块适合 AI 扫，哪些一旦 vibe 就会在答辩现场爆雷。这篇按模块对照两个作品，接 [入门篇](/blog/vibe-coding-first-encounter) 与 [审查篇](/blog/vibe-coding-review-ai-diff)。

## 两个作品的技术轮廓

| 项目 | 前端 | 后端 | 部署 |
|------|------|------|------|
| 究理 APP | Vue 3、Vant、Hash 路由、HBuilder APK | Express、mysql2、JWT | 阿里云 Windows，见 [部署篇](/blog/jlapp-aliyun-windows-deploy) |
| 旅游 APP | Vue 3、Element Plus 管理台 | Flask 蓝图、SQLAlchemy | 本机与演示环境联调 |

竞赛节奏是两周到一个月出可演示全栈，和个人站慢慢补博客不同，联调与演示路径比代码优雅更重要。

## 适合 Vibe Coding 的模块

### 管理台 CRUD 与表格页

旅游管理台的用户、景点增删改查，字段多、表单重复。让 AI 按已有页面复制列表、对话框、axios 调用模式，人只改字段名与 API 路径，比从零敲 Element Plus 快。见 [管理台 CRUD 篇](/blog/travel-admin-frontend-crud)。

前提：REST 路径与响应格式你先定好，见 [REST 设计篇](/blog/jlapp-rest-api-design)。

### 样式、布局、组件排列

竞赛 UI 常改评委反馈，间距、卡片圆角、首页模块顺序。这类 diff 可 vibe，验收靠真机与评委视角，不靠读每一行 CSS。

个人站夜间模式是同一逻辑，见 [夜间模式 Vibe 实战](/blog/vibe-coding-personal-site-night-mode)。

### 接口层样板代码

api.js 封装、axios 实例、按模块 export 函数，结构固定。AI 生成后你只要核对 baseURL、token 头、错误提示是否接 [请求层篇](/blog/jlapp-api-axios-layer) 的约定。

### 博客式文档与答辩稿

作品说明、接口表、部署 checklist，规格清晰时适合 vibe 出初稿，人改数字与路径。和个人站 [内容规模化篇](/blog/vibe-coding-content-at-scale) 同类。

## 必须手写或强审查的模块

### 鉴权与 token 生命周期

究理 APP 里 Vuex 存 token、路由守卫、axios 拦截器，键名不一致会导致登录成功但下一页 401。见 [Vuex 与 token 篇](/blog/jlapp-vuex-auth-tokens)、[JWT 踩坑篇](/blog/jlapp-jwt-bcrypt-auth)。

旅游 APP 移动端 JWT 与管理台密钥双轨，见 [双轨鉴权篇](/blog/travel-flask-jwt-dual-auth)。

这三处我坚持自己写第一版或逐行读 diff。secret 不能进仓库，逻辑错在演示时比 UI 丑更致命。

### 数据库模型与迁移

SQLAlchemy 模型关系、外键、级联删除，AI 容易写得看起来合理但和真实表结构不符。见 [模型设计篇](/blog/travel-flask-sqlalchemy-models)。

竞赛前表结构以你导出的 SQL 为准，不要让 AI 凭空加列。

### 部署、安全组、APK 路径

[阿里云部署篇](/blog/jlapp-aliyun-windows-deploy) 里安全组、防火墙、API 公网地址，错一位手机就连不上。[HBuilder 打包篇](/blog/jlapp-hbuilder-apk-packaging) 里 base 与资源相对路径，vibe 改 vite.config 可能连带破坏 APK 内资源加载。

这类环境绑定问题，AI 没有你的阿里云控制台画面，只能你操作或口述逐步验收。

### 核心业务规则

究理答题判分、旅游行程推荐逻辑，评委会问细节。若答没细看实现细节，直接减信任。算法与规则人定 spec，AI 填实现，且要自己跑用例。

## 分工表可当队规

| 模块 | Vibe 程度 | 人必须做的事 |
|------|-----------|--------------|
| 列表表单 CRUD | 高 | 对 API 字段、权限 |
| 主题与动效 | 高 | 真机演示、性能 |
| Express/Flask 路由骨架 | 中 | 蓝图边界、错误码 |
| JWT 与登录 | 低 | 手写或逐行审 |
| SQL 与模型 | 低 | 对照真实表 |
| 部署与打包 | 低 | 自己点通手机访问 |
| 答辩核心流程 | 低 | 自己演练 |

## 和课堂个人作业的差异

课堂作业 vibe 一整份可能就能交。竞赛是多人、多端、演示日不可改代码：

- vibe 产出要提前一周冻结，留联调缓冲，演示账号、种子数据禁止让 AI 随机生成后直接用，仓库里不要把公网 IP、数据库密码 vibe 进 config.js

## 小结

竞赛全栈不是能不能用 AI，而是哪条链路崩了会不会当场演示失败。CRUD 与样式多 vibe；鉴权、数据、部署、演示主路径手写或当 PR 严审。分工边界见 [协作分工篇](/blog/vibe-coding-interview-storytelling)。

标签：工程化, Vue.js, 成长
`;export{n as default};
