const n=`---
title: "Vuex 与登录态 token 的两套键名"
excerpt: "登录页写 token，拦截器读 Authorization，Vuex 只同步其一。第一次管登录态全链路时，四条 token 线怎样收束成一条。"
category: "前端开发"
categoryId: "frontend"
date: "2024-07-28"
author: "徐宁"
project: jiuli-app
series: vue-notes
---

究理 APP 的状态管理很轻：一个 Vuex store，一个 \`Authorization\` 字段。但登录页写的是 \`localStorage.setItem('token', token)\`，axios 拦截器读的是 \`Authorization\`。这是我第一次做登录态全链路时最典型的不一致。

## Vuex store 结构

\`components/store/index.js\`：

\`\`\`javascript
export default createStore({
  state: {
    Authorization: localStorage.getItem('Authorization') ?? '',
  },
  mutations: {
    changeLogin(state, user) {
      state.Authorization = user.Authorization
      localStorage.setItem('Authorization', user.Authorization)
    },
  },
})
\`\`\`

只有一个 mutation，职责清晰：把 Bearer 字符串同步到内存与本地。

没有 actions、modules、getters，竞赛规模下够用，不必强行上 Pinia。

## 登录成功实际写了什么

\`LoginView.vue\` 密码登录成功后：

\`\`\`javascript
const token = response.data.token
localStorage.setItem('token', token)
this.$router.push('/')
\`\`\`

没有调用 \`changeLogin\`，也没有写 \`Authorization\` 键。

后果：

- \`App.vue\` 守卫读 \`token\`，能进主页
- \`api.interceptors\` 读 \`Authorization\`，部分 POST 不带 Header
- 后端部分路由从 body.token 鉴权；若页面手动传 token 仍能成功，行为不一致

这是联调时有的接口 401、有的正常的常见根因。

## App.vue 的 JWT 过期检查

\`created\` 钩子：

\`\`\`javascript
const token = localStorage.getItem('token')
if (!token || this.tokenExpired(token)) {
  this.$router.push('/login')
}
\`\`\`

\`tokenExpired\` 手动 base64 解 payload 的 \`exp\`，不验签名。与后端 \`jwt.sign({ userId }, secret, { expiresIn: '999999h' })\` 超长有效期配合，竞赛期几乎不会过期。

若统一登录态，应：

1. 登录成功：调用 \`changeLogin({ Authorization: token })\`，或与 \`setItem('token', token)\` 二选一、双写同步
2. 退出：清空 Vuex 与两个 localStorage 键
3. 401 响应：全局 axios 响应拦截 \`push('/login')\`

## 与后端鉴权字段对齐

后端存在两套验证习惯：

- **Header**：\`Authorization: Bearer <jwt>\` \`jwtCheck\` 中间件
- **Body**：\`{ token: '<jwt>' }\` 走 \`getUserId\` 或 \`tokenValidator\`

前端页面发 POST 时往往 Header 与 body 各带一份。GET 错题 \`/wrong/:token\` 甚至把 token 放在路径参数。

第一次做后端时会觉得乱；整理成表就清楚：

| 场景 | 前端携带方式 | 后端解析 |
|------|--------------|----------|
| 登录 | body 里 username 与 password | 返回 \`token\` |
| 发帖 | body.token | \`getUserId(token)\` |
| 部分 GET | path 中的 token | \`getUserId\` |
| 理想统一 | Header Bearer | \`jwt.verify\` |

## Options API 与页面级状态

除登录态外，绝大多数页面数据不进 Vuex，而是：

- \`data()\` 里列表、表单字段
- \`mounted\` 调 \`api.js\` 拉取
- 子组件 props 下发

和图表模板项目一样，是页面自治而非全局 store。只有需要跨 Tab 持久化的认证串才值得放 Vuex。

## 若用 Pinia 重构

若重做可设 \`useAuthStore\`：

- \`token\` getter 统一出口
- \`login()\` 写 storage 并设 state
- \`logout()\` 清空并跳登录

Vuex 4 在 Vue 3 仍可用，不必为重构而重构，但键名与 mutation 必须单一数据源。

## 小结

Vuex 在究理 APP 里不是状态中心，而是登录串的同步点。真正要记的是 token、Authorization、body.token、path token 四条线收束成一条。键名不一致时，401 往往出现在 POST 而不是登录页。

标签：Vue.js, JWT
`;export{n as default};
