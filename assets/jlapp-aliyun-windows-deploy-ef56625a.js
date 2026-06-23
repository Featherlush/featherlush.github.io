const n=`---
title: "阿里云 Windows 服务器部署 Express 与 MySQL"
excerpt: "租 ECS、远程桌面装 MySQL 与 Node、安全组放行应用端口。第一次把后端从 localhost 搬到云服务器，按实际操作顺序记下来的坑。"
category: "后端开发"
categoryId: "backend"
date: "2024-08-10"
author: "徐宁"
project: jiuli-app
series: express-notes
---

2024 年 8 月，为了让 APK 和队友手机能访问后端，我在阿里云租了一台 Windows 云服务器，把 Express 与 MySQL 部署上去。之前只在本机 localhost 联调，第一次接触远程机、防火墙、安全组时踩了不少坑。这篇按实际操作顺序记，不写公网地址与密码。

## 为什么选 Windows 与远程桌面

当时团队更熟悉 Windows：远程桌面连上去就像操作本机，MySQL Installer、VS Code 都有图形界面，改 config.js、看报错、导入数据库比纯 SSH 更直观。Linux 上 Docker 部署是更优解，但第一次后端交付以能演示为先。

## 1. 购买与登录 ECS

- 阿里云控制台创建云服务器 ECS，系统选 Windows Server
- 记下公网 IP，仅自己保存，不要写进公开仓库
- 安全组先放行远程桌面 RDP，以及后端应用监听端口与 app.js 里 listen 一致
- 本机远程桌面连接输入公网 IP 与管理员账号登录

## 2. 在服务器上装运行环境

### Node.js

从 Node 官网下载 Windows 安装包，装完后 PowerShell 执行 node -v、npm -v 确认。

### MySQL

用 MySQL Installer for Windows：

1. 安装 MySQL Server 与 Workbench，可选，方便看表
2. 设置 root 密码，仅保存在服务器，勿提交 Git
3. 新建数据库与项目里 database 名一致，如 jlapp
4. 用 Workbench 或命令行导入建表 SQL 或备份文件，竞赛前在本机导出的结构与种子数据

后端 \`mysql.js\` 与 \`pool.js\` 里的 host 在服务器上一般为 localhost，MySQL 与 Node 同机；user、password、database 改成服务器本地配置，不要把带密码的文件推送到公开仓库。

### VS Code

在服务器上安装 VS Code，打开 backend 目录：

- 改数据库连接、jwtSecret 等配置
- 终端里 npm install、node app.js 试跑
- 服务器本机浏览器访问本地端口或调试路由，确认能查用户表

## 3. 把代码弄到服务器上

常见几种方式我混用过：

- Git 克隆：服务器装 Git 后 clone 私有仓库凭据勿泄露
- 压缩包：本机打包 backend 排除 node_modules，远程桌面里解压，再 npm install
- VS Code Remote 若后来配置：本地连远程开发；当时主要 RDP 与服务器上的 VS Code

node_modules 应在服务器上重新 install，避免 Windows 路径差异导致原生模块如 bcrypt 编译不一致。

## 4. 让 Node 持续跑

竞赛演示不能关远程桌面就断服务。当时做法：

- 测试阶段：PowerShell 窗口开着 node app.js
- 演示前：可用 pm2 for Windows 或任务计划程序保活
- 确认崩溃后日志写到哪里 console.error 在终端里直接看

## 5. 安全组与 Windows 防火墙

两层都要放行应用端口：

1. 阿里云安全组 inbound 规则：允许 TCP 端口仅演示可临时放宽来源；长期应限制 IP
2. Windows 防火墙：高级设置里添加入站规则，允许 Node 监听端口

只开 RDP 不开应用端口，手机 APK 永远连不上；只开应用端口不开 RDP，则无法远程维护。我曾在安全组漏规则上卡了半天。

## 6. 前端与 APK 如何指向服务器

- 静态资源路径见 HBuilder 篇：Vite base './'，与 API 地址无关
- API 地址：APK 里必须写可访问的 HTTP 或 HTTPS 服务地址，公网 IP 或域名加端口，或反代后的域名，不能用 \`./\`

本机开发时 api.js 曾硬编码公网地址，部署服务器后地址不变则只需保证端口与安全组正确。更稳妥：VITE_API_BASE 构建前改环境变量，不要把真实地址写进公开博客或 Git。

## 7. 数据库与备份

- 演示前在服务器导出一份 MySQL 备份，竞赛现场可快速恢复
- root 仅内网使用；若开放 MySQL 端口到公网风险极大，一般不要在安全组放行 3306

## 8. 常见问题

| 现象 | 可能原因 |
|------|----------|
| 本机 Node 正常、手机不行 | 安全组或防火墙未放行；或 API 仍指向 localhost |
| ECONNREFUSED 连数据库 | MySQL 服务未启动；密码库名不对 |
| 登录成功、写入失败 | 服务器上 JWT secret 与本地不一致；重新登录拿新 token |
| bcrypt 安装失败 | 在服务器上 npm rebuild bcrypt 或改用 bcryptjs |

## 小结

阿里云 Windows 部署的本质是远程桌面当本机、MySQL 与 Node 同机、安全组放行应用端口、配置与密钥只留在服务器。图形界面降低了第一次部署的心理门槛；后续若再上 Linux 与 Nginx 反代，只要把进程监听、防火墙、前端 baseURL 三件事理顺，迁移会容易很多。

标签：Express.js, MySQL, 部署
`;export{n as default};
