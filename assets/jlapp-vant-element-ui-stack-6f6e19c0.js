const n=`---
title: Vant、Element Plus 与 Swiper 怎么混用
excerpt: 登录表单走 Vant，分类 Tab 借 Element Plus，首页轮播用 Swiper。K12 学习 APP 里三套 UI 库各管一块，选型理由和踩坑都在这里。
category: 前端开发
categoryId: frontend
date: 2024-07-12
author: 徐宁
project: jiuli-app
series: vue-notes
---

究理 APP 前端不是纯 Vant 移动应用。分类导航用了 Element Plus，首页轮播用 Swiper 11，登录注册与个人页几乎全是 Vant 4。这篇记录 2024 年 7 月选型理由与踩坑。

## 依赖一览

\`package.json\` 里与 UI 相关的核心包：

| 包 | 版本思路 | 用途 |
|----|----------|------|
| \`vant\` | 4.x | Tabbar、Form、Field、Button、BackTop |
| \`element-plus\` | 2.x | 分类页横向 Tab、部分桌面化导航 |
| \`swiper\` 与 \`vue-awesome-swiper\` | 11 与 5 | 首页轮播 |
| \`@element-plus/icons-vue\` | 随 Element | 图标全局注册 |
| \`crypto-js\` | 4.x | 本地加解密辅助设置页等 |
| \`@vitejs/plugin-legacy\` | 5.x | 旧 WebView 兼容可选链路 |

\`main.js\` 里整包注册：

\`\`\`javascript
app.use(Vant)
app.use(ElementPlus)
app.use(VueAwesomeSwiper)
\`\`\`

Element 图标循环 \`app.component\` 全局挂载，页面里可直接 \`<Edit />\` 而不逐个 import。

## Vant：移动交互的主战场

**登录页** \`LoginView.vue\` 典型组合：

- \`van-tabs\` 切换手机号与密码登录
- \`van-field\` 与 \`rules\` 做手机号正则、必填校验
- \`van-checkbox\` 勾用户协议
- \`van-button block\` 提交

表单校验在 Vant 里与移动端键盘、清空按钮已经打通，比手写 \`@blur\` 省事。

**全局壳** \`App.vue\`：

- \`van-back-top\` 固定在 Tabbar 上方 \`bottom: 65px\`，避免挡住底部导航

讨论区、发帖、积分等页面大量使用 \`van-list\`、\`van-cell\`、\`van-action-sheet\` 模式，按页面略有差异。

## Element Plus：分类页的横向后台感

\`/category\` 下 \`Nav1\`、\`Nav2\`、\`Nav3\` 用 Element 的 Tab 或 Menu 风格做一级切换，下面再进 Vant 列表。原因是：

- 设计稿分类区更像多栏目门户，Element Tab 切换动画与样式成熟：同一屏要挂 4 个子列表页，用 Vue Router children 比 Vant Tab 内嵌路由更清晰

注意样式体积：Element 全量 CSS 在移动包里偏大。当时优先交付功能，未做按需引入；若重构可用 \`unplugin-vue-components\` 减包。

## Swiper：首页轮播

首页头条与课程推荐用 \`vue-awesome-swiper\` 包一层 Swiper 11。在 \`main.js\` 单独 \`import 'swiper/css'\`。

轮播图数据来自后端文章或拓展接口或本地占位图。APK 内图片路径走 \`src/assets\` 或接口 URL，需与 \`base: './'\` 打包策略一致。

## crypto-js：设置与安全相关

修改密码、校验密钥等场景用 \`crypto-js\` 做客户端辅助处理，具体算法按页面实现。这不是替代 HTTPS，而是竞赛项目里对敏感字段的额外处理习惯。密钥与接口仍必须走后端校验，见 Express 系列里的 \`changekey\` 与 \`checkkey\` 路由。

## mockjs 与联调

依赖里含 \`mockjs\`，部分页面开发期可本地造数据。和图表模板项目类似，先 Mock 跑通 UI，再切真实 API。正式联调后 Mock 应关闭，避免与 axios 真请求混用。

## 样式与布局习惯

- 登录页大量 inline style，竞赛赶进度时的真实写法，后期可收进 scoped 或 CSS 变量
- Vant 主题色通过 plain type primary 与 CSS 变量统一
- Element 与 Vant 同屏时注意 z-index 弹层、BackTop、Tabbar

## 小结

究理 APP 的 UI 策略是手感与表单归 Vant，复杂栏目归 Element，动效轮播归 Swiper。不追求全家桶统一，按页面选最省时间的组件库。混用时 z-index 和样式体积是主要代价。

标签：Vue.js
`;export{n as default};
