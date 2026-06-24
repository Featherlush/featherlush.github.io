const n=`---
title: 究理 APP 的 Express 应用骨架
excerpt: app.js 中间件顺序、body-parser 与 cors、routes 按业务拆分挂载。第一次写 Node 后端，从空目录到能联调的第一条接口。
category: 后端开发
categoryId: backend
date: 2024-07-08
author: 徐宁
project: jiuli-app
series: express-notes
---

2024 年 7 月，我为究理 APP 搭了第一个可联调的后端。之前只会写 Vue 调接口，不懂 \`app.listen\` 背后发生了什么。这篇按 \`backend/app.js\` 与 \`routes/index.js\` 讲清 Express 4 的骨架。

## 我当时的后端技术栈

| 技术 | 作用 | 第一次接触时的理解 |
|------|------|-------------------|
| **Node.js** | 运行 JS 的服务端运行时 | 不再只是浏览器里的 Vue |
| **Express 4** | 极简 HTTP 框架 | 路由与中间件 |
| **body-parser** | 解析 JSON 或表单 body | POST 能读到 \`req.body\` |
| **cors** | 跨域响应头 | 本地 Vite 能访问 API |
| **mysql2** | MySQL 驱动 | 连接池与 SQL 查询 |
| **jsonwebtoken** | JWT 签发与校验 | 见鉴权篇 |
| **bcrypt 或 bcryptjs** | 密码哈希 | 明文不进库 |
| **dotenv** | 环境变量可选 | 密钥不进仓库 |

\`package.json\` 启动脚本：\`node app.js\`。

## app.js：中间件顺序

\`\`\`javascript
const express = require('express')
const app = express()
const routes = require('./src/routes')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/', routes)

app.listen(port, () => {
  console.log(\`Server listening\`)
})
\`\`\`

要点：

1. body-parser 与 express.json 项目里叠用了，Express 4.16+ 自带 \`express.json()\`，保留 body-parser 是迁移习惯，实际可只留一种
2. cors 通配 \`*\` 适合竞赛演示；生产应白名单前端域名
3. 所有业务路由挂在 \`/\` 与 routes 模块，没有 \`/api\` 前缀，前端 baseURL 直接对根路径

中间件顺序原则：先解析 body、再跨域、再进路由。若在解析前读 \`req.body\` 会得到 undefined。

## routes/index.js：路由汇总器

不是把逻辑全写在一个文件，而是按业务拆文件再 \`router.use\` 挂载：

\`\`\`javascript
router.use('/register', register)
router.use('/login', login)
router.use('/article', article)
router.use('/post', post)
router.use('/wrong', wrong)
router.use('/ranking', ranking)
router.use('/group', group)
// … 共二十余条
\`\`\`

根路径 GET / 在 index 里直接查 users 表返回列表，调试时用来确认数据库连通。

这种结构与前端 \`api.js\` 的函数名镜像对应，联调时两边对着表查最快。

## 单文件路由的典型形态

每个 \`src/routes/*.js\` 一般是：

\`\`\`javascript
const express = require('express')
const router = express.Router()
const db = require('../db/mysql') // 或 pool

router.get('/', ...)
router.post('/', ...)

module.exports = router
\`\`\`

Router 实例导出后，被 index 挂到 \`/login\` 等路径下，因此 login.js 里 POST / 实际对外是 POST /login。

## 同步回调与 async/await

项目里两代写法并存：

- register.js、login.js：\`db.query\` 回调与 \`bcrypt.hash\` 回调：posts.js、wrong.js：async 与 \`db.execute\` promise 池

我第一次写后端时从回调起步，后期新接口改用 async，读起来更接近前端 await axios。

## 和框架式后端的粗对比

| 维度 | 究理 Express | 典型 Spring Boot |
|------|--------------|-------------------|
| 入口 | app.js 手动 use | 注解启动类 |
| 路由 | router.use 手动挂载 | RestController |
| 分层 | routes 直写 SQL 居多 | Controller、Service、Mapper |

Express 更扁，适合第一次理解 HTTP 到处理函数、再到 SQL 与 JSON 的全链路。

## 小结

Express 入门记住三件事：中间件链、Router 模块化、与前端路径表对齐。把 HTTP 进到 SQL 的链路走通后，再拆连接池与鉴权会容易很多。

标签：Express.js, REST API
`;export{n as default};
