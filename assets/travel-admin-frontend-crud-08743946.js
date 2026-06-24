const n=`---
title: 旅游管理台的用户与景点 CRUD 联调
excerpt: TravelBackFront 侧栏三块、表格分页、弹窗表单与头像上传，Element Plus 管理台和 Flask 管理接口怎样对上。
category: 后端开发
categoryId: backend
date: 2025-07-18
author: 徐宁
project: travel-app
series: flask-notes
---

Flask 接口就绪后，我同期写了 TravelBackFront，给旅游 APP 用的数据库管理系统。Vue 3 与 Element Plus，侧栏进用户、景点、帖子，表格里增删改查，弹窗里编表单、传头像。这篇结合实际页面截图，讲布局、Axios 和管理接口怎么对上。

![数据管理前端：用户列表](/images/projects/travel-app/admin-dashboard.png)

## 页面结构

App.vue 固定顶栏、侧栏与内容区：

- 顶栏标题：数据库管理系统：侧栏：首页用户管理、景点管理、帖子管理：router-view 渲染各业务组件

路由在 \`main.js\` 里注册：\`/home\` 对应 \`Home.vue\`，\`/attractions\` 对应 \`AttractionManagement.vue\`，\`/posts\` 对应 \`PostManagement.vue\`。用户行程详情 \`/users/:id/itineraries\` 对应 \`ItineraryManagement.vue\`。

这种单页管理壳和竞赛里常见的 Element Admin 模板一致，但只保留本项目需要的三块，不引入整套权限框架。

## Axios 实例：baseURL 与 Admin Key

\`\`\`javascript
const api = axios.create({
  baseURL: ({}).VITE_API_BASE,  // 开发时由 Vite 注入环境变量
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  config.headers['X-Admin-Key'] = ({}).VITE_ADMIN_KEY
  return config
})
\`\`\`

所有管理请求共享同一实例；不要在每个组件里手写密钥。Vite 用 .env.local：

\`\`\`
VITE_API_BASE=...
VITE_ADMIN_KEY=...
\`\`\`

与 Flask Config.ADMIN_API_KEY 保持一致。

## 用户管理 Home.vue

截图中的首页即用户表格，列：ID、用户名、手机号、邮箱、头像、是否管理员、操作。

### 拉列表

\`\`\`javascript
async fetchUsers() {
  const response = await api.get('/admin')
  this.users = response.data
}
\`\`\`

后端 GET /admin 在验证 X-Admin-Key 后返回 User.to_dict 数组。空表时 Element Plus 显示 No Data，与截图一致。

分页版接口是 \`GET /users?page=1&per_page=10\`，返回 items、total、pages；首页竞赛用全量 \`/admin\` 够用，用户多了再切分页接口。

### 表格与弹窗 CRUD

el-table 绑定 users。添加用户打开 el-dialog，add 模式展示密码框。编辑时回填行数据，password 留空表示不改。el-switch 绑定 is_admin。

保存逻辑：

\`\`\`javascript
if (this.dialogType === 'add') {
  await api.post('/users', userData)
} else {
  await api.put(\`/users/\${this.formData.id}\`, userData)
}
\`\`\`

删除：api.delete \`/users/\${id}\`。

### 头像上传

Element el-upload 设 before-upload 拦截默认行为，改用手动 FormData：

\`\`\`javascript
async uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  this.formData.avatar = response.data.url
}
\`\`\`

Flask POST /upload 返回 url 后写入用户表 avatar 字段；表格列用 img :src="row.avatar" 预览。

### 跳转行程

查看行程：router.push \`/users/\${userId}/itineraries\`，进入 ItineraryManagement.vue 拉 api/admin/users/:id 与行程统计。

## 景点管理 AttractionManagement.vue

比用户页多筛选行：

| 控件 | 作用 |
|------|------|
| 搜索框 | 景点名称 |
| 省份输入 | provinceFilter |
| 价格范围 | 本地过滤 |
| 评分下拉 | 4 分以上、3 至 4 分、3 分以下 |

列表 GET /attractions，前端 filteredAttractions 做组合过滤，减少后端改接口。

表格列：省份、名称、背景图缩略图、el-rate 展示评分、价格、距离、天气、是否推荐。

详情进 AttractionDetail.vue，el-tabs 分四块：

1. 景区描述：富文本/多行编辑 description
2. 评论管理：拉 GET /attractions/:jq_id/comments，可删评论
3. 标签管理：维护多对多 Tag
4. 付费项目：PaidItem CRUD，关联当前景点

一个详情页收拢子资源，避免侧栏菜单爆炸。

## 帖子管理 PostManagement.vue

支持按标题或内容搜索、按发布者 el-select 筛选。表格展示缩略图与视频图标，可点击预览。POST /posts 新增、PUT /posts/:id 编辑、DELETE 删除。媒体字段 image 与 video 先 upload 再写 URL。

社区数据在移动端产生，管理台主要负责审核、修正、删除违规内容。

## 与移动端的边界

| 能力 | 管理台 | 移动 APP |
|------|--------|----------|
| 用户注册 | 管理员代建账号 | 用户自助 POST /api/auth/register |
| 景点数据 | 全量 CRUD 与推荐位 | 只读列表、详情、搜索 |
| 帖子 | 任意删改 | 用户发帖、点赞、收藏 |
| 行程 | 查看全用户统计 | api/users/me/itineraries 仅本人 |

管理台不走用户 JWT，避免把管理员密钥和用户 token 混在同一套登录态里。

## 联调顺序

1. Flask python run.py，浏览器访问根路径有欢迎文案
2. 管理台 npm run dev，用户页能出表或 No Data
3. 添加用户 POST 成功，表格刷新
4. 上传头像，URL 入库且图片可访问
5. 景点、帖子页同样走一遍 CRUD
6. 队友移动端改 baseURL 对接 JWT 接口

## 小结

TravelBackFront 不是花哨的后台，而是 Element Plus 表格、弹窗与统一 Axios 拼出来的数据维护工具。侧栏三块覆盖用户、景点、帖子；密钥放拦截器；图片走 Flask \`/upload\` 再写库。和 Flask 骨架、SQLAlchemy 模型、双轨鉴权合在一起，构成旅游 APP 我负责的完整后端链路。

标签：Vue.js, Flask
`;export{n as default};
