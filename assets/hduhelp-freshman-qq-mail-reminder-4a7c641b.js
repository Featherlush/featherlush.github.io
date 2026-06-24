const n=`---
title: Todo 服务里接 QQ 邮件与 cron 定时提醒
excerpt: 杭助招新 Todo 小任务里，SMTP、gomail 与 cron 怎样和 Gin REST 同进程跑，后台任务不阻塞 HTTP 请求。
category: 后端开发
categoryId: backend
date: 2023-10-08
author: 徐宁
project: hduhelp-freshman-todo
series: go-notes
---

2023 年 10 月做杭助后端招新 Todo 时，REST CRUD 和 JSON 持久化很快就跑通了；真正花时间的是每天提醒我还没做完的事。QQ 邮箱自带 SMTP，配合 Go 的 gomail 和 cron，可以在不引入额外消息服务的前提下，把提醒逻辑嵌进同一个 Gin 进程。

## 整体思路

启动 main 后：loadDataFromFile 读 todos.json，go startMailCron 挂后台定时任务，gin.Run 对外 REST API。cron 触发时遍历 todos 筛选 Done == false，拼邮件正文，gomail.DialAndSend 走 QQ SMTP。

API 与提醒共享同一份内存切片或同一份 todos.json，这样创建、完成 Todo 后，下一次定时扫描就能看到最新状态。

## 第一步：开启 QQ 邮箱 SMTP 并拿授权码

QQ 邮箱不能直接用登录密码发 SMTP，需要在网页邮箱里开启服务并生成授权码16 位，当作 SMTP 登录密码。

操作路径大致为 QQ 邮箱、设置、账户、开启 SMTP 服务，再按提示发短信生成授权码。官方说明见 [QQ 邮箱帮助：开启 SMTP](https://service.mail.qq.com/cgi-bin/help?subtype=1&&no=1001256&&id=28)。

需要准备三个配置项，不要写进仓库：

| 配置 | 含义 |
|------|------|
| 发件地址 | 你的 QQ 邮箱 |
| 授权码 | 开启 SMTP 后生成的 16 位码，不是 QQ 密码 |
| 收件地址 | 提醒发给自己或指定邮箱 |

我用环境变量读取，避免提交到 GitHub：

\`\`\`go
var (
    mailFrom   = os.Getenv("MAIL_FROM")
    mailAuth   = os.Getenv("MAIL_AUTH")   // SMTP 授权码
    mailTo     = os.Getenv("MAIL_TO")
)
\`\`\`

## 第二步：用 gomail 发一封测试邮件

go.mod 里引入：

\`\`\`bash
go get gopkg.in/gomail.v2
\`\`\`

核心发送函数：

\`\`\`go
import (
    "crypto/tls"
    "fmt"
    "strings"

    "gopkg.in/gomail.v2"
)

func sendReminder(undone []Todo) error {
    if len(undone) == 0 {
        return nil
    }

    lines := make([]string, 0, len(undone))
    for _, t := range undone {
        lines = append(lines, fmt.Sprintf("- %s", t.Content))
    }
    body := "以下 Todo 尚未完成：\\n\\n" + strings.Join(lines, "\\n")

    m := gomail.NewMessage()
    m.SetHeader("From", mailFrom)
    m.SetHeader("To", mailTo)
    m.SetHeader("Subject", "Todo 未完成提醒")
    m.SetBody("text/plain", body)

    // QQ 常用：465 + SSL，或 587 + STARTTLS
    d := gomail.NewDialer("smtp.qq.com", 465, mailFrom, mailAuth)
    d.TLSConfig = &tls.Config{ServerName: "smtp.qq.com"}

    return d.DialAndSend(m)
}
\`\`\`

几点经验：

- From 与 Dialer 用户名建议都用完整 QQ 邮箱地址，否则部分客户端会拒收。：若 465 连不上，可试 587 端口并去掉自定义 TLSConfig，让 gomail 走 STARTTLS。：第一次建议只发给自己，确认能进收件箱也看看垃圾箱。

## 第三步：cron 定时扫描未完成 Todo

\`\`\`bash
go get github.com/robfig/cron/v3
\`\`\`

在 main 里 API 启动前挂后台 goroutine：

\`\`\`go
import "github.com/robfig/cron/v3"

func startMailCron() {
    c := cron.New()
    // 每天 08:00
    _, err := c.AddFunc("0 8 * * *", func() {
        var undone []Todo
        for _, t := range todos {
            if !t.Done {
                undone = append(undone, t)
            }
        }
        if err := sendReminder(undone); err != nil {
            log.Println("send mail:", err)
        }
    })
    if err != nil {
        log.Fatal(err)
    }
    c.Start()
}

func main() {
    loadDataFromFile()
    go startMailCron()

    r := gin.Default()
    // ... 注册 /todo 路由
    r.Run()
}
\`\`\`

robfig/cron 默认解析 5 段表达式分时日月周，上面 0 8 * * * 表示每天 8:00。若需要秒级调度，要用 cron.New cron.WithSeconds 并写 6 段表达式。

## 与 REST API 的协作注意点

1. **并发读写切片**：cron 遍历 todos 的同时，HTTP 处理器可能在 append 或切片删除。招新体量可以用 sync.RWMutex 包一层，或定时任务里先 copy 一份快照再发邮件。
2. **空列表不发**：没有未完成项时直接 return，避免每天收到一封空邮件。
3. **失败只打日志**：邮件 SMTP 偶发超时不应拖垮整个 API；log 记录错误，下次 cron 再试。
4. **授权码泄露**：若误提交到仓库，立刻在 QQ 邮箱里作废并重新生成授权码。

## 本地验证流程

1. 设置环境变量 MAIL_FROM、MAIL_AUTH、MAIL_TO。
2. go run main.go 启动服务。
3. POST /todo 创建几条 done false 的 Todo。
4. 临时把 cron 改成 */1 * * * * 每分钟或写个 POST /debug/mail 手动触发 sendReminder，确认收件箱收到列表。
5. 改回正式调度时间后再提交。

## 小结

杭助招新 Todo 的邮件提醒，本质是共享内存数据、定时筛选与 SMTP 发信。QQ 邮箱的优势是零额外账号成本；gomail 把 MIME 和 TLS 封装好了；cron 让提醒与 Gin 路由同进程、免部署第二个调度服务。实践里值得记住的两点：后台任务不要阻塞 HTTP 请求，以及 SMTP 授权码不要写进仓库。

标签：
`;export{n as default};
