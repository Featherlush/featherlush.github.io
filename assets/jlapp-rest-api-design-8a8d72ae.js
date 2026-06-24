const n=`---
title: REST 业务模块与接口设计
excerpt: post、group、wrong、ranking 按业务域拆路由，第一次设计能被前端 api.js 直接对照的接口地图。
category: 后端开发
categoryId: backend
date: 2024-08-06
author: 徐宁
project: jiuli-app
series: express-notes
---

Express 骨架与数据库连通后，我把剩余工作按业务域拆成十几个小路由文件。这篇是 2024 年 8 月前后的接口地图，也是我第一次设计能被前端直接对照的 REST 表。

## 模块划分思路

| 域 | 路由前缀 | 核心能力 |
|----|----------|----------|
| 账户 | \`/register\`、\`/login\`、\`/choose\` | 注册登录、身份年级 |
| 内容 | \`/article\`、\`/expand\`、\`/guess\` | 文章、拓展阅读、猜你想搜 |
| 社区 | \`/post\`、\`/comment\`、\`/group\`、\`/group/member\` | 动态、评论、群组与成员 |
| 互动 | \`/postlike\`、\`/post/click\`、\`/point\` | 点赞、浏览、积分 |
| 学习 | \`/answer\`、\`/wrong\`、\`/ranking\` | 题库、错题、排行榜 |
| 历史 | \`/history/article\`、\`/history/group\` | 搜索历史 |
| 用户资料 | \`/user/id\`、\`/user/detail\` | 解 token、改签名 |
| 安全 | \`/changekey\`、\`/checkkey\` | 修改或校验密钥 |

routes/index.js 只做挂载与一条调试用的 GET /，不写业务逻辑。

## 社区：post 与 comment

posts.js：

- GET \`/post\` 对应 \`SELECT * FROM posts\`，返回动态列表：POST \`/post\` 在 body 带 token、content，\`getUserId\` 后 INSERT

评论 comments.js 结构类似。前端讨论区 \`Chat.vue\`、\`Publish.vue\` 组合列表与发帖 API。

点赞 postlike.js 提供 GET 全量、POST 点赞、POST /unlike 取消；浏览 clickhistory.js 挂在 /post/click 路径下，记录用户浏览轨迹，供我的-浏览记录使用。

## 群组 group 与 member

- GET/POST /group 创建与列出群组
- /group/member 加入群组、查询用户已加群组

前端 Group.vue、Launch.vue 与 api.allgroup 过滤当前用户成员关系。数据关联靠 userid 字段，没有复杂 JOIN 时用多次查询与内存 filter。

## 学习：answer、wrong、ranking

**题库** answer.js：GET 返回题目行含 source 年级、name 题库名、选项与解析字段。前端按年级与题库名 filter，支撑闯关与练习。

**错题** wrong.js：

- GET /wrong 全量调试：GET /wrong/:token 按 token 解 userId 后 WHERE userid = ?：POST /wrong 答题错误时写入题目快照

**排行** ranking.js：接收答题统计 POST，GET 拉榜单；前端按正确率或答题数排序展示 Rank.vue。

这三条构成闯关、错题集与排行榜的游戏化闭环。

## 积分 point

POST /point 与签到、任务待办联动，前端 Integral.vue 展示积分与任务列表。积分规则写在路由或简单 SQL 更新，未单独抽积分服务。

## 用户详情 userdetail

POST /user/detail 更新昵称、个性签名等。与注册表字段分离，避免登录接口过重。

## 接口风格上的第一次后端特征

1. 路径即模块，很少嵌套资源 ID 如 /post/:id 多用前端全表 find
2. token 在 body 出现频率高，与 Header 并存
3. 成功码有 200 JSON、也有 res.send rows 直接数组
4. 错误混用英文 error 与中文 message

这些不影响竞赛演示，但重构时应统一响应壳 code data message。

## 与前端 api.js 的联调顺序

我当时的迭代顺序：

1. login 与 register 通
2. article 与 expand 首页能刷
3. post 与 comment 讨论区
4. answer、wrong 与 ranking 闯关
5. point 与 history 个人中心

每步只开前后端各一个模块，减少 404 排查范围。

## 小结

REST 模块化的要点是让路由文件名、业务词、前端函数前缀三者对齐。扁平 Express 把 K12 学习的五条业务线跑通，是我第一次全栈交付的落脚点。

标签：Express.js, REST API, MySQL
`;export{n as default};
