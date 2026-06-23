const n=`---
title: "杭助后端招新 Todo"
description: "2023 年杭助后端招新小任务，Gin 实现的 Todo REST API，JSON 文件持久化，并探索定时邮件提醒未完成事项。"
date: "2023-10-08"
gradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(3, 105, 161, 0.35) 100%)"
status: "已完成"
category: "app"
tier: "other"
demoUrl: null
codeUrl: "https://github.com/Featherlush/backend_2023_freshman_task"
featured: false
---

## 项目概述

这是 2023 年 9 至 10 月参加杭助后端招新时完成的小任务。招新流程是 fork 官方提交仓库，在根目录新建与 GitHub 用户名同名的文件夹放入代码并提 Pull Request，由 GitHub Actions 校验通过后即视为提交成功。

我用 Go 与 Gin 写了一个 Todo 清单 REST 服务，内存切片承载数据，变更后写回本地 todos.json；每条 Todo 用 google/uuid 生成唯一标识。go.mod 里还引入了 gomail 与 cron，用于在服务启动后定时扫描未完成事项并通过 SMTP 发提醒，实现思路见博客 [Go 手记定时邮件提醒未完成 Todo](/blog/hduhelp-freshman-qq-mail-reminder)。

相关笔记见 [Go 手记](/blog/series/go-notes) 中标记 hduhelp-freshman-todo 的篇目。

## 技术栈

| 技术 | 作用 |
|------|------|
| Go 1.21 | 语言与运行时 |
| Gin | HTTP 路由与 JSON 绑定 |
| google/uuid | Todo 唯一 ID |
| JSON 文件 | 无数据库场景下的轻量持久化 |
| gomail.v2 | 通过 SMTP 发送邮件 |
| robfig/cron | 定时触发提醒任务 |

## REST 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /todo | 创建 Todo，服务端生成 uuid |
| GET | /todos | 分页列表，查询参数 page、pageSize |
| GET | /todo/:uuid | 按 UUID 查询单条 |
| PUT | /todo/:uuid | 更新整条 Todo |
| DELETE | /todo/:uuid | 删除指定 Todo |

Todo 结构体核心字段为 uuid、content 与 done 布尔标记。

\`\`\`go
type Todo struct {
    UUID    string \`json:"uuid"\`
    Content string \`json:"content"\`
    Done    bool   \`json:"done"\`
}
\`\`\`

## 数据持久化

启动时 loadDataFromFile 从 todos.json 反序列化到内存切片；每次增删改后 saveDataToFile 整表写回。适合招新体量的小数据量场景，也便于本地调试时直接查看 JSON 内容。分页逻辑按 page 与 pageSize 计算起始索引，对切片做区间截取，起始索引超出长度时返回空数组。

\`\`\`go
func saveDataToFile() error {
    data, err := json.MarshalIndent(todos, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile("todos.json", data, 0644)
}
\`\`\`

## 路由与定时提醒

\`\`\`go
r := gin.Default()
r.POST("/todo", createTodo)
r.GET("/todos", listTodos)
r.GET("/todo/:uuid", getTodo)
r.PUT("/todo/:uuid", updateTodo)
r.DELETE("/todo/:uuid", deleteTodo)

c := cron.New()
c.AddFunc("@every 1h", sendPendingReminders)
c.Start()
r.Run(":8080")
\`\`\`

## 招新仓库与提交结构

仓库 [Featherlush/backend_2023_freshman_task](https://github.com/Featherlush/backend_2023_freshman_task) 按招新要求，在与 GitHub 用户名同名的文件夹内放置 main.go、go.mod 与 go.sum，根目录含 PR 校验 workflow。

这是我第一次用 Go 写可运行的 HTTP 服务，也是第一次把定时任务与邮件通知和 REST API 放在同一个进程里跑。
`;export{n as default};
