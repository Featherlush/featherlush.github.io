const n=`---
title: "数据库通讯录客户端"
description: "数据库应用课设，Visual Studio WinForms 与 MySQL，通讯录表的连接、查询、增删改与 DataGridView 展示。"
date: "2025-12-01"
gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(2, 132, 199, 0.36) 100%)"
status: "已完成"
category: "desktop"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
cover: "/images/projects/dbtest/cover.png"
technologies:
  - C#
  - .NET 8
  - WinForms
  - MySQL
  - ADO.NET
  - Visual Studio
---

## 项目概述

数据库通讯录客户端是 2025 年 12 月数据库应用课程设计作业。这是我第一次在 Visual Studio 里独立完成 Windows 桌面窗体与数据库的程序，用 C# WinForms 与 .NET 8 写界面与事件，用 MySql.Data 连接本地 MySQL，对课程示例库中的通讯录表做增删改查。

窗体标题沿用课程示例名 SQLServerTest，早期实验多为 SQL Server 模板，本仓库实际接入的是 MySQL。界面含姓名、邮箱、电话、性别录入，查询条件与模糊查询，底部 DataGridView 展示结果，顶部绿色状态条提示连接成功。

相关笔记见 [桌面开发手记](/blog/series/desktop-notes) 中标记 dbtest 的篇目。

## 界面与功能

![SQLServerTest 主界面连接成功与 CRUD 按钮](/images/projects/dbtest/cover.png)

| 控件 | 功能 |
|------|------|
| 连接与断开连接 | 打开或关闭 MySqlConnection，状态写入 label |
| 查询 | 按全部、姓名、邮箱、电话或性别条件查询，支持模糊 LIKE |
| 插入 | 将四个字段写入通讯录表，刷新表格 |
| 修改 | 按姓名定位，更新邮箱、电话、性别 |
| 删除 | 按姓名删除，带 Yes No 确认框 |
| DataGridView | MySqlDataAdapter 与 DataSet 绑定数据源 |

所有写操作前通过 IsDbConnected 检查连接状态，避免空连接抛异常。

## 数据表

课设使用课程示例库中的通讯录表，字段与界面一致，含姓名、邮箱、电话与性别。插入为四列值顺序写入；查询使用 select 与带条件的 WHERE。姓名在修改与删除时作为定位键。

\`\`\`sql
SELECT name, email, phone, gender
FROM contacts
WHERE name LIKE @keyword OR email LIKE @keyword
\`\`\`

## 技术实现

WinForms Designer 拖拽布局按钮与表格；Form1.cs 写六个按钮事件与连接状态封装；MySQL 8 与 MySql.Data 9.5 通过连接字符串配置 server、port、user 与 database；MySqlCommand 与 MySqlDataAdapter 同步 ExecuteNonQuery 与 Fill DataSet；.NET 8 Windows WinExe 运行时。

\`\`\`csharp
private string connectionString =
  "server=127.0.0.1;port=3306;user=root;password=***;database=course_demo;";

private bool IsDbConnected() => connection?.State == ConnectionState.Open;
\`\`\`

\`\`\`csharp
private void btnQuery_Click(object sender, EventArgs e) {
  if (!IsDbConnected()) return;
  var sql = "SELECT * FROM contacts WHERE name LIKE @kw";
  using var cmd = new MySqlCommand(sql, connection);
  cmd.Parameters.AddWithValue("@kw", $"%{txtKeyword.Text}%");
  var adapter = new MySqlDataAdapter(cmd);
  var ds = new DataSet();
  adapter.Fill(ds);
  dataGridView1.DataSource = ds.Tables[0];
}
\`\`\`

与后来写的 Flask 或 Express 后端相比，这是直连数据库、拼 SQL 字符串的 ADO 风格，没有 ORM，也没有分层，课设目标是熟悉连接生命周期与 CRUD 闭环。

## 开发体会摘要

事件驱动是第一次写 Click 回调里串 SQL，理解界面状态与连接状态要分开管。模板标题与真实库不一致时，迁移要注意连接串与驱动包。课设代码的诚实问题包括连接串写在源码里、SQL 用 string.Format 拼接，手记里写了应如何改进，但保留了当时作业的真实写法。

详见 [WinForms 与 MySQL CRUD 手记](/blog/dbtest-winforms-mysql-crud) 与 [第一次做桌面数据库程序](/blog/dbtest-first-desktop-app)。

## 本地运行

环境为 Visual Studio 2022、.NET 8 SDK、本地 MySQL，已创建课程示例库与通讯录表。

\`\`\`bash
dotnet restore
dotnet run --project DBtest
\`\`\`

或在 VS 中打开解决方案直接 F5。首次运行前在 Form1.cs 的连接字符串中改为本机 MySQL 账号，勿将密码提交到公开仓库。

## 安全说明

当前课设版本将数据库口令写在源代码中，仅适合本地实验。若继续迭代，应改为配置文件或用户输入，并对 SQL 使用参数化查询以防注入。
`;export{n as default};
