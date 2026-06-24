const n=`---
title: "旅游 APP"
description: "多媒体竞赛校二等奖。负责 Flask 后端、JWT 鉴权与 Element Plus 管理台，联调队友 Vant 移动端，覆盖景点、行程与社区完整数据体系。"
date: "2025-07-01"
gradient: "linear-gradient(135deg, rgba(20, 184, 166, 0.22) 0%, rgba(15, 118, 110, 0.36) 100%)"
status: "已完成"
category: "app"
tier: "competition"
demoUrl: null
codeUrl: null
featured: true
cover: "/images/projects/travel-app/cover.png"
technologies:
  - Python
  - Flask
  - SQLAlchemy
  - MySQL
  - Vue 3
  - Element Plus
---

## 项目概述

旅游 APP 是团队参加浙江省大学生多媒体作品设计竞赛的第二年作品，延续 [究理 APP](/projects/jiuli-app) 的移动端产品路线。我在 2025 年 7 月负责 Python Flask 后端与后端数据管理前端，为队友开发的 Vue 3 移动客户端提供 REST API、文件上传与行程社区等业务数据支撑。

项目获第二十四届浙江省大学生多媒体作品设计竞赛校二等奖。

移动端由队友完成，Vue 3 与 Vant 四 Tab 壳层，HBuilder 打包 Android APK。我侧交付可联调的后端服务与管理台，覆盖景点、帖子、用户与行程等核心数据的增删改查。

相关笔记见 [Flask 手记](/blog/series/flask-notes) 中标记 travel-app 的篇目。

## 我的职责范围

| 模块 | 内容 |
|------|------|
| Python 后端 | Flask REST API、SQLAlchemy 模型、JWT 鉴权、图片与视频上传 |
| 管理后台 | Vue 3 与 Element Plus 数据管理，用户、景点、帖子、行程 |
| 移动客户端 | 队友开发，我提供接口联调与数据维护 |

## 产品功能

### 移动端队友负责

首页轮播、快捷导航、热门目的地与付费精选推荐；分类按省份筛选景点卡片，进入详情与行程规划；社区帖子流、发帖图文视频、点赞与收藏；我的页面含头像编辑、出行统计、行程管理与设置；行程页区分计划出行与已出行；搜索支持关键词检索景点并记录历史。

### 管理后台我负责

![数据管理前端用户列表](/images/projects/travel-app/admin-dashboard.png)

用户管理支持列表分页、增删改、头像与管理员标识，可查看用户行程详情。景点管理按名称、省份、评分与价格筛选，背景图上传与推荐位开关。景点详情在描述、评论、标签与关联付费项目分 Tab 维护。帖子管理按用户筛选，图文视频预览，增删改完整。行程管理查看用户行程统计、计划日期与出行状态。

## 技术实现

移动客户端用 Vue 3、Vant 与哈希路由，Axios 与 JWT 调用 Flask REST，HBuilder 打包 APK。

管理前端用 Vue 3、Vite、Element Plus，侧栏导航用户、景点与帖子管理，Axios 注入管理端密钥访问管理接口。

Python 后端用 Flask 应用工厂与蓝图拆分 auth、routes 与 users；Flask-SQLAlchemy 与 MySQL 持久化；Flask-JWT-Extended 与 Bcrypt 处理鉴权与密码；图片视频上传与静态文件服务。

\`\`\`python
def create_app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(spots_bp, url_prefix='/spots')
    app.register_blueprint(posts_bp, url_prefix='/posts')
    return app
\`\`\`

\`\`\`python
class Spot(db.Model):
    jq_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False)
    province = db.Column(db.String(32))
    rating = db.Column(db.Float)
\`\`\`

| 类别 | 技术 | 用途 |
|------|------|------|
| 语言 | Python 3 | 后端运行时 |
| 后端框架 | Flask | HTTP 服务与蓝图路由 |
| ORM | SQLAlchemy、Flask-Migrate | 模型与表结构迁移 |
| 数据库 | MySQL | 业务数据持久化 |
| 安全 | JWT、Bcrypt、Admin API Key | 移动端登录态与管理台鉴权 |
| 管理前端 | Vue 3、Element Plus、Vite | 数据 CRUD 与筛选 |
| 跨域 | Flask-CORS | 管理台与移动端联调 |

## 数据模型

主要实体包括用户、景点、评论、付费项目、社区帖子、点赞与收藏关联、帖子评论、用户行程、搜索与浏览历史等。景点主键使用 UUID 字符串 jq_id，便于与前端路由参数对齐。

## API 与鉴权

移动端提供注册登录与当前用户查询；业务接口覆盖景点 CRUD、评论、付费项目、帖子与互动、行程与统计、关键词搜索、图片视频上传等。管理台通过专用请求头与移动端 JWT 两套鉴权并存，装饰器优先校验管理员密钥，否则走 JWT 并识别管理员用户。

\`\`\`python
def admin_or_jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.headers.get('X-Admin-Key') == current_app.config['ADMIN_KEY']:
            return fn(*args, **kwargs)
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper
\`\`\`

## 实现要点

密码在模型 setter 中校验强度并用 bcrypt 哈希；登录签发 JWT，移动端拦截器写入 Authorization。图片与视频分别上传，落盘后通过静态路径访问，管理台与移动端共用 URL。行程 is_planned 字段区分待出行与已出行，移动端与管理台共用接口。列表接口支持分页，景点支持多维度筛选。

\`\`\`javascript
axios.defaults.headers.common.Authorization = \`Bearer \${localStorage.getItem('token')}\`
\`\`\`

## 竞赛背景

第二十四届浙江省大学生多媒体作品设计竞赛校二等奖，2025 年 7 月集中开发。继 2024 年究理 APP 后的第二年竞赛作品，产品主题从科学学习拓展至旅游出行，后端改用 Python Flask，我延续后端与数据管理职责。

技术栈：Python, Flask, SQLAlchemy, MySQL, JWT, Bcrypt, Vue 3, Element Plus, Vite, Axios
`;export{n as default};
