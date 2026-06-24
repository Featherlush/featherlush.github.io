const n=`---
title: MySQL 数据库管理与维护
excerpt: Workbench 建库导表、演示前备份恢复、对照后端路由查行。第一次管库时 utf8mb4、种子数据和 userid 对齐比背语法重要。
category: 后端开发
categoryId: backend
date: 2024-07-18
author: 徐宁
project: jiuli-app
series: express-notes
---

连上 MySQL 之后，后端代码只是读写接口；表从哪来、数据怎么备份、演示前怎么恢复，是另一套技能。2024 年 7 月做全栈 APP 时，我主要在 Windows 与 MySQL Workbench 上完成这些操作，本机开发与阿里云服务器上流程相同。这篇记管理侧习惯，不涉及真实密码与公网地址。

## 用什么工具

| 工具 | 用途 |
|------|------|
| **MySQL Installer** | Windows 安装 Server 与可选组件 |
| **MySQL Workbench** | 图形化建库、导表、查数据、备份 |
| 命令行 mysql | 脚本化导入、远程机快速执行 |
| **VS Code** | 编辑 SQL 文件、对照后端路由改表结构 |

第一次不必追求命令行熟练；能导出、能导入、能看清表里的行，比背语法更重要。

## 建库与字符集

在 Workbench 里新建 Schema 数据库：

- 名称与后端 database 配置一致项目里为 jlapp：字符集选 utf8mb4，排序规则 utf8mb4_unicode_ci 或默认 utf8mb4，避免中文昵称、帖子内容乱码：不要用已废弃的 utf8 三字集 emoji 和部分汉字会出问题

建好后，在 Workbench 左侧选中该库，后续所有表都落在这个 Schema 下。

## 建表：脚本导入 vs 手工

竞赛项目常见两种方式：

1. 执行建表 SQL 文件：Workbench 菜单 File 选 Run SQL Script，或打开 \`.sql\` 粘贴执行：适合一次性初始化 users、posts、answer、wrong、ranking 等全套表
2. 从本机导出再导入服务器见下文备份恢复

表设计当时偏能跑：主键 id、业务字段、userid 外键逻辑靠应用层保证，没有严格 ER 图。第一次管库时要对照后端路由看每张表被哪条 SELECT 或 INSERT 用到，改列名前先搜代码。

## 核心表与业务对应

| 表逻辑 | 主要字段思路 | 对应功能 |
|------------|--------------|----------|
| users | username, password 哈希, phone_number | 注册登录 |
| posts | userid, content | 社区动态 |
| comments | 帖子/用户关联 | 评论 |
| groups 与成员 | 群组与 userid | 讨论区 |
| answer | 题干、选项、source 年级, name 题库 | 闯关题库 |
| wrong | userid, 题目快照字段 | 错题集 |
| ranking | userid, 答题数、正确率等 | 排行榜 |
| 历史相关表 | 用户与搜索关键词或文章 id | 浏览与搜索记录 |

联调接口 200 但页面空时，第一步往往是 Workbench 里 \`SELECT *\` 看有没有行，第二步看 userid 是否与当前 token 解出的 id 一致。

## 种子数据与测试账号

演示前建议准备：

- 1～2 个测试用户已知用户名密码，密码走 bcrypt 入库，不要手改哈希列：少量帖子、题目行，保证首页、讨论区、闯关不全空：年级或题库筛选用的 source、name 与前端 filter 字符串完全一致，如三年级

在 Workbench 里可直接改某行做联调，但改密码列应通过注册接口或 bcrypt 生成哈希，不要填明文。

## 备份与恢复演示前必做

### 导出备份

Workbench：Server 菜单 Data Export：选中 jlapp 库：导出为 SQL 文件，含结构与数据：竞赛前一天导出一份，现场崩了可快速恢复

或命令行在服务器上：

\`\`\`bash
mysqldump -u root -p jlapp > jlapp_backup.sql
\`\`\`

### 导入恢复

Workbench：Server 菜单 Data Import，选刚才的 \`.sql\`。

或：

\`\`\`bash
mysql -u root -p jlapp < jlapp_backup.sql
\`\`\`

导入前若库已脏，可先删库重建再导入仅演示环境；生产慎用。

## 用户与权限

本机开发常用 root 直连；服务器上更稳妥的做法：

- 为应用建专用账号如 jlapp_app，只授 jlapp 库上的 SELECT, INSERT, UPDATE, DELETE：root 仅本机维护用：不要在阿里云安全组对外开放 3306；MySQL 只给同机 Node 或内网访问

在 Workbench 的 Server 菜单 Users and Privileges 可图形化添加用户。后端 \`mysql.js\` 改为专用账号后，记得同步改配置并重启 Node。

## 日常维护操作

| 场景 | 做法 |
|------|------|
| 看某用户有没有发帖 | \`SELECT * FROM posts WHERE userid = ?\` |
| 清空测试动态 | \`DELETE FROM posts WHERE userid = 测试 id\`，演示库再用 |
| 接口报重复键 | 看唯一索引；或删冲突测试行 |
| 连接池爆满 | 检查 Node 是否泄漏连接；调 connectionLimit；重启 MySQL 服务 |
| 迁移到云服务器 | 本机 Export 再远程 Import，见阿里云部署篇 |

改表结构 ALTER TABLE 前先备份；后端若写死列名，改表后必须同步改路由里的 SQL。

## 与后端两套连接文件的提醒

项目里曾有 mysql.js 回调池与 pool.js promise 池配置重复。管库时两边密码、库名应一致；合并为一个池后，只需维护一份连接配置，减少 Workbench 能连、Node 报 Access denied 因配置文件不一致导致的问题。

## 小结

数据库管理对我第一次做后端来说，就是四件事：utf8mb4 建库、脚本或导出导入表、演示前备份、用 Workbench 对照接口查行。把数据和 JWT 用户 id 对齐之后，很多前端空白其实不是 Vue 问题，而是表里没行或 userid 对不上。

标签：MySQL, Express.js
`;export{n as default};
