const n=`---
title: "从 Web 项目到 WinForms 桌面数据库"
excerpt: "2025 年 12 月数据库课设，Visual Studio 里第一次写窗体、Click 事件和 MySQL 连接，和以往 Vue 与 Flask 项目节奏有什么不同。"
category: "成长随笔"
categoryId: "career"
date: "2025-12-20"
author: "徐宁"
project: dbtest
series: desktop-notes
---

2025 年 12 月做数据库应用课设之前，我写的能跑的项目几乎都是浏览器与后端 API：Vue 调 Flask，Vant 调 Express。课设要求在 Windows 桌面程序里直连数据库完成通讯录管理。虽然仓库是 C# WinForms 不是 C++ Qt 或 MFC，但在 Visual Studio 里拖按钮、写 Click、看 DataGridView 刷数据，对我来说同样是第一次离开 Web 壳层、第一次亲手管数据库连接对象。

## 为什么窗体标题叫 SQLServerTest

打开程序，标题栏是 SQLServerTest，绿字数据库连接成功！，和实验指导书截图一致。代码里却是 MySqlConnection 连 classdb。

这是课里常见的模板遗留：早期实验按 SQL Server 与 ODBC 或 ADO 讲，大作业允许换 MySQL。我只改了连接串和 NuGet 包，窗体 Text 属性没改。答辩时若被问，如实说即可：驱动与库已换，UI 标题未同步。

对我自己的提醒：产品对外名称、连接配置、实际依赖三处要对齐，否则维护的人包括三个月后的自己会误解。

## 事件驱动：比写 API 更碎

Web 里一个接口对应一个路由函数；WinForms 里每个按钮一个 Click，里面从取文本框到弹 MessageBox 全写在一起。Form1.cs 三百多行，逻辑全在窗体类里，没有 Controller、没有 Service。

刚开始不习惯：

- 忘记先连接就点插入，要靠 IsDbConnected 兜底
- 改完数据要记得再查询一遍才能刷新 Grid
- 状态既要 label1，又要 MessageBox，重复但直观

桌面课设教的是用户操作顺序，Web 教的是请求边界。数据库课设分数点往往在连接是否关闭、CRUD 是否完整、查询条件是否生效，顺序感比架构分层更重要。

## 和 C++ 课设的边界

同学期前后也在学 C++ 算法、图形学 VS 里 .vcxproj、控制台或 SDL。数据库课设选 WinForms 是因为：

- 课程示例与批改环境以 Visual Studio 与窗体设计器为主
- MySql.Data 文档与 NuGet 一键引用，比纯 C++ 接 MySQL Connector 省时间
- 课设截止在 12 月，能稳定演示 CRUD 优先

若用 C++ 写 Qt 或 MFC 与 ODBC，学习曲线更陡，但 SQL 与连接生命周期的概念相同。这篇记的是 C# 实现；第一次在原生桌面栈里管数据库的体感，和语言无关。

## 拼 SQL 的羞耻感与课设现实

string.Format insert into TXL values 在 Web 项目里我会立刻改成参数化。课设里仍用拼接，原因很现实：

1. 教材示例就是字符串 SQL  
2. 数据量小、姓名无怪字符，演示不会炸  
3. 时间花在把六个按钮都接上而不是抽象 Repository  

交作业后自己的结论：课设代码可以是快照，博客和项目页要写清已知问题，连接串进源码、SQL 注入风险、姓名作唯一键，而不是假装已是生产质量。

## DataGridView：最爽的一步

写完 \`adp.Fill(ds); dataGridView1.DataSource = ds.Tables[0]\`，表立刻出来，比前端自己画表格省事得多。这也是桌面数据课设的经典卖点：控件绑定比 HTML 表格与分页组件快。

代价是定制弱：列宽、排序、编辑模式要再学 Grid 事件；课设没要求，就没深入。

## 若再选一次技术栈

| 选项 | 优点 | 我当时的取舍 |
|------|------|----------------|
| WinForms 与 ADO | 快、教材对齐 | 已选 |
| WPF 或 MVVM | 结构更清晰 | 学习成本 |
| C++ Qt 与 MySQL | 与系统课统一 | 驱动与部署更麻烦 |
| Web 管理页 | 我最熟 | 不符合课设桌面客户端要求 |

## 小结

DBtest 价值不在窗体多漂亮，而在亲手走完 Connect、CRUD 与 Disconnect，并体会长连接、同步 SQL、控件绑定这套与 Web ORM 完全不同的节奏。标题仍是 SQLServerTest，库里已是 MySQL，这个小错位，反而比满分更能记住配置与命名要对齐。

代码路径见 WinForms 与 MySQL CRUD 手记；项目说明见数据库通讯录客户端。

标签：
`;export{n as default};
