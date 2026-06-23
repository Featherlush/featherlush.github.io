const n=`---
title: "课设通讯录 WinForms 与 MySQL CRUD"
excerpt: "DBtest 课设里连接、查询、增删改与 DataGridView 刷新。ADO.NET 入门用 Connect、Command、Adapter 与 Grid 四条语句覆盖核心分数点。"
category: "后端开发"
categoryId: "backend"
date: "2025-12-10"
author: "徐宁"
project: dbtest
series: desktop-notes
---

2025 年 12 月交数据库应用课设时，仓库里只有一个 Form1.cs 和 Designer 生成的布局，但六颗按钮与一张表已经覆盖课设要求的完整链路。这篇按代码真实结构，说明 WinForms 事件如何驱动 MySQL，方便以后翻仓库时不用重新读一遍。

## 项目是什么技术栈

| 项 | 值 |
|----|-----|
| 语言 | C# .NET 8 |
| UI | Windows Forms |
| 驱动 | MySql.Data 9.5 |
| 窗体标题 | SQLServerTest 课程模板名 |
| 实际数据库 | MySQL classdb.TXL |

课上实验名常带 SQL Server，我交付时改为 MySQL 与本机 classdb，窗体标题没改，截图里仍是 SQLServerTest，标题不等于连接串。

## 连接对象与生命周期

类里持有一个字段：

\`\`\`csharp
MySqlConnection? myconnection;
\`\`\`

**连接** btConnect_Click：

1. 若已 Open，提示勿重复连接
2. \`new MySqlConnection(connetStr)\` 后 \`Open\`
3. label1.Text = 数据库连接成功！绿色状态文案

**断开** btDisConnect_Click：Close 并更新状态。

**前置检查** IsDbConnected：增删改查前统一判断 myconnection.State == Open，否则弹窗请先连接，这是课设里少有的横切逻辑，避免每个按钮重复写 null 判断。

连接字符串格式课设本地配置，密码应放配置文件而非公开文档：

\`\`\`csharp
"server=localhost;port=3306;user=root;password=<从配置读取>;database=classdb;"
\`\`\`

## 查询：条件分支与模糊开关

btQueryAll_Click 根据 cB_tj 查询条件拼 SQL：

| 条件 | 精确查询 | 勾选模糊查询 |
|------|----------|------------------|
| 全部 | select * From TXL | — |
| 姓名 | WHERE name='…' | WHERE name like '%…%' |
| 邮箱或电话 | 同上 | LIKE |
| 性别 | WHERE sex='…' | 无模糊下拉框精确 |

数据绑定套路：

\`\`\`csharp
MySqlDataAdapter adp = new MySqlDataAdapter(strSQL, myconnection);
DataSet ds = new DataSet();
adp.Fill(ds);
dataGridView1.DataSource = ds.Tables[0];
label1.Text = "查询成功！共找到 " + ds.Tables[0].Rows.Count + " 条记录";
\`\`\`

DataGridView 不需要手写列，DataSet 第一张表直接作数据源，适合课设快速出表。

## 插入、修改、删除

**插入**：校验姓名与性别非空，执行 insert into TXL，再 ExecuteNonQuery，最后 select * 刷新表格。

**修改**：以姓名为 WHERE 键，更新 mail、phone 与 sex；affectedRows == 0 时提示未找到该姓名。

**删除**：确认对话框 MessageBoxButtons.YesNo，执行 delete from TXL where name='…'，再刷新。

写操作后都再查全表绑 Grid，保证界面与库一致，而不是只改内存里的 DataSet。

## 与 Web 后端的对比

之前做过 Flask 与 SQLAlchemy、Express 与 mysql2，习惯模型层与 REST。WinForms 课设则是：

| 维度 | Web 后端 | 本课设 |
|------|----------|--------|
| SQL | 多数在 ORM 或参数化查询里 | 按钮事件里 string.Format 拼串 |
| 连接 | 池化、每请求短连接 | 一个长连接手动 Open/Close |
| 结果展示 | JSON | DataGridView 绑 DataSet |
| 错误 | HTTP 状态码 | MessageBox 与 label1 |

课设允许拼 SQL，但姓名里带单引号会炸，这是后来手记里应改参数化的原因，不是当时不知道，而是先跑通 CRUD 再谈规范。

## 若改进一版我会改什么

1. MySqlParameter 参数化全部 SQL  
2. 连接串移到 appsettings 或环境变量  
3. 修改或删除用主键 id，而不是假定姓名唯一  
4. 异步 async/await 避免 UI 线程卡死大表查询时

当前仓库保留课设提交时的写法，作为 ADO 入门快照。

## 小结

DBtest 的技术主线：长连接、事件里拼 SQL 与 Adapter 填表。弄懂 Connect、Command、Adapter 与 DataGridView 四条语句，就覆盖了数据库应用课设的核心分数点。桌面编程侧的第一次感触见同系列另一篇手记。

标签：桌面开发, MySQL
`;export{n as default};
