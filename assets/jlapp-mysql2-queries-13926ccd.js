const n=`---
title: "mysql2 连接池与 SQL 怎么写"
excerpt: "createPool、query 回调与 execute 异步并存。第一次连 MySQL，连接配置、占位符查询和两套连接文件为什么不该长期共存。"
category: "后端开发"
categoryId: "backend"
date: "2024-07-16"
author: "徐宁"
project: jiuli-app
series: express-notes
---

第一次碰后端，最怕的不是 Express，而是数据库连不上。究理 APP 用 MySQL 存用户、帖子、题库、错题与排行；驱动是 mysql2。这篇讲连接池、两种查询 API，以及项目里 mysql.js 与 pool.js 并存的原因。

## MySQL 在本项目里存什么

竞赛场景下的核心表逻辑名：

| 表 | 用途 |
|----|------|
| \`users\` | 用户名、哈希密码、手机号 |
| \`posts\` | 社区动态内容与 userid |
| \`comments\` | 评论 |
| \`groups\` 与成员表 | 学习群组 |
| \`wrong\` | 错题记录 |
| \`ranking\` | 答题统计与排行 |
| \`answer\` | 题库题目 |
| 历史表 | 文章或群组搜索历史 |

具体字段在联调时对照 SQL 建表脚本；博客不写生产密码，连接配置应放在环境变量或本地 config，勿提交仓库。

## mysql2 两种引入方式

**1. 回调池 mysql.js**

\`\`\`javascript
const mysql = require('mysql2')
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: ({}).DB_PASSWORD,
  database: 'jlapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
module.exports = db
\`\`\`

用法：\`db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => { ... })\`

**2. Promise 池 pool.js**

\`\`\`javascript
const mysql = require('mysql2/promise')
const db = mysql.createPool({ /* 同上 */ })
module.exports = db
\`\`\`

用法：\`const [rows] = await db.execute('SELECT * FROM posts', [])\`

execute 对预编译参数更友好，能防基础 SQL 注入占位符 \`?\`。

## 为什么项目里有两套连接文件

早期路由 login、register、article 用 \`mysql.js\` 与 query 回调；社区、错题等新路由改用 \`pool.js\` 与 execute。

这不是最佳实践，而是迭代痕迹。统一时应：

- 只保留 mysql2/promise 一个池
- 全项目 async/await
- 配置从 config.js 或 .env 读取一份

我第一次没意识到重复池会占双倍连接数，本地开发不明显，部署时要注意 connectionLimit。

## 查询模式实录

**登录查用户**回调：

\`\`\`javascript
db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
  if (results.length === 0) return res.status(404).json({ error: 'User not found' })
  const user = results[0]
  const ok = await bcrypt.compare(password, user.password)
  // ...
})
\`\`\`

**发帖插入**async：

\`\`\`javascript
await db.execute(
  'INSERT INTO posts (userid, content) VALUES (?, ?)',
  [userId, content]
)
\`\`\`

**错题按用户查**：

\`\`\`javascript
const [results] = await db.execute('SELECT * FROM wrong WHERE userid = ?', [userId])
\`\`\`

参数化查询是入门第一课：不要把用户输入拼进 SQL 字符串。

## 错误处理习惯

回调写法常在 if error 里 console.error 与 res.status 500。async 路由用 try/catch 包一层，失败返回 JSON success false 方便前端 alert 或 Vant Toast。

我没有单独抽 Repository 层，竞赛规模下路由即 DAO。数据表变复杂后应拆 service。

## 与前端全表 GET 的配合

部分接口 SELECT * 无 WHERE，前端再 filter。数据库侧简单，传输浪费。改进：

- 列表分页 LIMIT
- 按 userid 索引过滤
- 详情 WHERE id = ?

## 小结

mysql2 入门：createPool 复用连接、占位符查询、回调与 promise 二选一并统一。库表连通后，鉴权与业务接口才有落脚点。

标签：Express.js, MySQL
`;export{n as default};
