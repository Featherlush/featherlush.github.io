const n=`---
title: "究理 APP 登录鉴权踩坑记录"
excerpt: "三套验签、两套 secret、前端 token 与 Authorization 各写各的。第一次折腾 JWT，按排查顺序把 401 从随机变成可预期。"
category: "后端开发"
categoryId: "backend"
date: "2024-07-24"
author: "徐宁"
project: jiuli-app
series: express-notes
---

注册、登录、带 token 调接口，是我第一次做后端时耗时最久的一段：代码能跑通登录，但发帖、错题、个人中心随机 401。问题很少是 JWT 原理不懂，而是签发、存储、携带、校验四步里各用了一套习惯。这篇按我当时的排查顺序写。

## bcrypt：注册与登录必须同一套库

register.js 用 bcrypt 原生，login.js 用 bcryptjs 做 compare，两者算法兼容，但混用两个包容易在 salt 轮数、编码上踩坑。统一做法：

1. 只保留一个包推荐 bcryptjs，纯 JS 免编译
2. 注册：\`bcrypt.hash(password, 10)\` 入库
3. 登录：\`bcrypt.compare(明文, 库中哈希)\`，永远不要把明文密码写进 JWT

我遇到过注册成功、登录永远密码错误：其实是测试库里存了旧明文数据，compare 对不上。删掉用户重注册才好。

## JWT 签发：payload 里只放身份

\`\`\`javascript
const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '999999h' })
return res.status(200).json({ token })
\`\`\`

- payload 只放 userId，不放用户名、密码
- jwtSecret 必须来自单一配置文件或环境变量，全项目共用一个来源
- 竞赛里 \`expiresIn\` 设得很长是为了演示不断线；正式环境应短过期并配合刷新 token。

## 坑 1：三套验 token，secret 还不一致

项目里同时存在：

| 位置 | 读 token 的方式 | 密钥 |
|------|------------------|------|
| util/jwt.js | Header Authorization Bearer | config.jwtSecret |
| util/tokenValidator.js | 函数参数 token 字符串 | config.jwtSecret |
| mid/auth.js 遗留 | Header x-auth-token | 硬编码 secretToken |

若某条路由挂了 auth.js，即使用正确账号登录，也会永远 401，因为签发用 A 密钥、校验用 B 密钥。

排查：在 jwt.verify 失败分支 console.error err.message，若是 invalid signature，先查 secret 是否一致，而不是怀疑前端没传 token。

整理原则：只保留 Header Bearer 与一个 \`jwtSecret\`；删掉未使用的中间件文件。

## 坑 2：前端存 token，拦截器读 Authorization

登录成功：

\`\`\`javascript
localStorage.setItem('token', token)
\`\`\`

axios 拦截器：

\`\`\`javascript
const token = localStorage.getItem('Authorization')
config.headers.Authorization = \`Bearer \${token}\`
\`\`\`

结果是：登录能进首页 App.vue 读 token，但 POST 不带 Header 拦截器读空。部分接口靠 body.token 碰巧能过，表现成有的接口好、有的坏。

修法二选一，不要混：

- 登录后 \`localStorage.setItem('Authorization', token)\`，并与 Vuex \`changeLogin\` 同步
- 或拦截器改为读 localStorage.getItem token

## 坑 3：body.token、Header、路径参数三种携带

| 接口风格 | 示例 | 后端解析 |
|----------|------|----------|
| Body | POST /post token content | getUserId token |
| Header | Authorization Bearer | jwtCheck 中间件 |
| Path | GET /wrong/:token | 从 req.params 取串再 verify |

联调时要对着 Network：这一条请求到底带没带、带在哪一层。我曾在前端只改了 Header，忘了 POST 体里的 token，后端仍报缺少参数。

理想形态：Header 统一鉴权，body 不再重复传 token；路径里带 token 应尽量避免，泄露在日志与 Referer 里。

## 坑 4：verify 异步与错误被吞掉

jwt.verify 有同步和回调两种写法。tokenValidator 里用同步 jwt.verify token jwtSecret，抛错后进 catch 再 throw new Error TokenInvalidError。

路由里若写成：

\`\`\`javascript
const userId = await getUserId(token) // 没 try/catch
\`\`\`

未捕获时 Express 可能直接 500，前端只看到网络错误。应在路由层统一：

\`\`\`javascript
try {
  const userId = await getUserId(token)
} catch {
  return res.status(401).json({ message: '令牌无效或过期' })
}
\`\`\`

## 坑 5：前端自己解 exp，与后端不同步

App.vue 用 atob 解 payload 看 exp，不验证签名，只判断是否过期。后端若改了 expiresIn 或时钟偏差，会出现前端认为有效、后端已拒的情况。最终以接口 401 为准，前端应加全局响应拦截跳转登录。

## JWT 排查清单

1. 登录响应里是否真有 token 字段不是 data.data.token 多包一层
2. localStorage 里键名与拦截器、业务代码是否一致
3. Network 里失败请求的 Header 是否含 Authorization Bearer eyJ
4. POST 体是否仍要求 token 字段与 Header 是否重复、是否漏传
5. 后端 jwtSecret 是否只有一处定义，签发与 verify 是否同一值
6. 是否误挂 mid/auth.js 等遗留中间件
7. bcrypt.compare 是否因库中旧数据失败换测试账号
8. MySQL 连上后 userId 写入业务表是否与解出的 id 类型一致，字符串与数字要统一

## choose / changekey 等旁路

- POST /choose：登录后写身份年级，与 JWT 并行，不替代登录
- changekey / checkkey：改本地密钥习惯，别和 JWT secret 混为一谈

## 安全备忘

- 生产用 HTTPS；secret 与数据库密码进环境变量，不进 Git
- 缩短 token 有效期；敏感列表接口按 userId 过滤，禁止全表返回再由前端 filter
- 云服务器部署时 secret 在服务器上单独配置，与本地 config.js 分离

## 小结

JWT 折腾久，多半不是算法难，而是签发一条线、前端三条线、后端两套 secret 叠在一起。把 secret 收成一处、token 收成一种存储与携带方式之后，401 会少一大半。bcrypt 则记住：哈希进库、compare 验密、明文永不进 token。

标签：Express.js, JWT
`;export{n as default};
