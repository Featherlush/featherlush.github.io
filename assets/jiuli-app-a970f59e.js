const n=`---
title: "究理 APP"
description: "面向科学学习的移动端应用，含课程资料、闯关答题、学习社区与积分体系，Vue 3 与 Express 全栈交付并打包 Android。"
date: "2024-08-01"
gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.36) 100%)"
status: "已完成"
category: "app"
tier: "competition"
demoUrl: null
codeUrl: null
featured: true
cover: "/images/projects/jiuli-app/cover.png"
---

## 项目概述

究理 APP 是一款面向中小学生的科学学习移动应用，为浙江省大学生多媒体作品设计竞赛团队项目。我担任负责人，在 2024 年 7 至 8 月完成产品规划、前后端架构设计与核心功能开发，并用 HBuilder 打包为 Android APK 发布。

系列笔记见 [Vue.js 手记](/blog/series/vue-notes) 与 [Express.js 手记](/blog/series/express-notes)。

应用围绕学、练、交流设计，首页内容聚合、分类浏览、学习讨论区与个人中心四大模块由底部 Tab 导航串联；支持学生与教师身份及年级选择，JWT 登录态贯穿答题、发帖与积分等业务。

线上演示后端已关停，仓库保留完整前端与 Express 和 MySQL 后端代码，可供结构与实现参考。

## 产品功能

### 主页

轮播、头条与课程推荐；快捷入口覆盖课程资料、文章精选、经典题目与趣味拓展；闯关入口提供六关挑战模式，可进入答题、错题集与排行榜；支持全局搜索与搜索结果页。

### 分类

顶部 Tab 在课程、分享文章与最新动态间切换，每类下有多级子页面，统一头部搜索与导航结构。

### 讨论学习交流区

按群组筛选帖子，支持最新、最热与精华排序；发帖、评论、点赞与浏览记录完整；群组搜索、加入群组与搜索历史可用；帖子详情与发表动态独立成页。

### 我的

头像、昵称、个性签名可编辑；积分与任务涵盖签到、答题、分享等待办；学习情况展示答题数、正确率、错题入口与排名；个人动态、点赞记录、浏览记录与设置等入口齐全。

### 闯关与题库

按关卡进入答题流程，答错记录写入错题集；排行榜支持按正确率或答题数排序；题库按年级与题库名称筛选；注册后选择身份与年级，个性化学习内容。

## 技术实现

HBuilder 打包 Android APK，WebView 承载前端页面。前端用 Vue 3、Vite 5、Vue Router 哈希模式与 Vuex；Axios 统一封装并在拦截器注入 JWT；Vant 4 与 Element Plus 承担移动 UI 与分类导航，Swiper 负责轮播。

\`\`\`javascript
axios.interceptors.request.use(config => {
  const token = store.state.auth.token
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})
\`\`\`

后端 Express 4 提供 REST API，模块化路由拆分业务；jsonwebtoken 与 bcrypt 完成登录注册与接口鉴权；MySQL2 存储用户、内容、社区、题库与排行数据。

\`\`\`javascript
router.post('/login', async (req, res) => {
  const user = await db.findByUsername(req.body.username)
  const ok = await bcrypt.compare(req.body.password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'invalid credentials' })
  res.json({ token: jwt.sign({ id: user.id }, ({}).JWT_SECRET) })
})
\`\`\`

| 类别 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Vue 3、Vite | 组件化开发与构建 |
| 移动 UI | Vant、Element Plus | Tabbar、表单与分类菜单 |
| 状态通信 | Vuex、Axios | 全局状态与 API 请求 |
| 服务端 | Express.js | REST 接口与中间件 |
| 数据库 | MySQL | 业务数据持久化 |
| 安全 | JWT、bcrypt | 登录态与密码加密 |
| 发布 | HBuilder | Android 安装包 |

## 后端 API 概览

Express 服务挂载于根路径，主要模块包括用户登录注册与身份年级、文章与拓展阅读、动态评论与群组、题库错题与排行榜、点赞浏览与积分、浏览与搜索历史等。前端在 api 模块集中封装请求，拦截器自动附加 Authorization Bearer token。

\`\`\`javascript
const routes = [
  '/users', '/articles', '/posts', '/groups',
  '/quiz', '/wrong-book', '/rank', '/points'
]
routes.forEach(path => app.use(path, require(\`./routes\${path}\`)))
\`\`\`

## 职责与成果

- 制定产品功能模块与迭代里程碑，划分前端页面与 API 接口
- 设计前后端分离架构，REST 与 JWT 鉴权，MySQL 存储业务数据
- 实现主页、分类、讨论区、个人中心及闯关答题完整链路
- 完成群组社区、积分任务、错题集与排行榜等游戏化学习功能
- 使用 HBuilder 打包移动端，支持模拟器与真机安装体验

## 竞赛背景

项目为 2024 年多媒体竞赛 APP 前端部分团队作品。第二年团队作品为 [旅游 APP](/projects/travel-app)。

技术栈：Vue 3, Vite, Vant, Element Plus, Vue Router, Vuex, Axios, Swiper, Express.js, MySQL, JWT, HBuilder
`;export{n as default};
