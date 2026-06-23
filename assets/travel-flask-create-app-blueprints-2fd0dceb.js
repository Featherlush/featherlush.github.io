const n=`---
title: "旅游后端从 create_app 到蓝图拆分"
excerpt: "旅游 APP 后端从空目录到能跑，create_app 工厂、扩展 init 顺序、蓝图 url_prefix 与 run.py 启动，第一次写 Flask 时的目录约定。"
category: "后端开发"
categoryId: "backend"
date: "2025-07-03"
author: "徐宁"
project: travel-app
series: flask-notes
---

2025 年 7 月做旅游 APP 时，我第一次用 Python Flask 写竞赛后端。究理 APP 那年是 Express，这次换栈，但目标一样：让队友的 Vue 移动端和我的 Element Plus 管理台都能稳定调接口。这篇从 TavelBackData 的目录与 create_app 讲起，把 Flask 应用工厂与蓝图这套骨架理顺。

## 为什么用应用工厂，而不是一个巨大的 main.py

Flask 官方推荐 Application Factory：用函数 \`create_app\` 创建应用实例，而不是在全局直接 \`app = Flask(__name__)\`。

好处在我这个项目里很具体：

1. 扩展 db、jwt、bcrypt 可以在 init_app 时绑定，测试或迁移脚本也能复用同一套配置
2. 蓝图延迟导入：注册路由时模型、数据库已初始化，避免循环导入
3. 配置集中：Config 类管数据库 URI、JWT 密钥、管理员 API Key，不散落在各个文件

目录结构：

\`\`\`
TavelBackData/
├── run.py                 # 入口：create_app() 后 app.run()
├── app/
│   ├── __init__.py        # create_app、扩展实例、蓝图注册
│   ├── config.py          # Config 类
│   ├── database.py        # SQLAlchemy db 实例
│   ├── models.py          # 模型在蓝图之后导入
│   ├── auth.py            # auth_bp：注册 / 登录
│   ├── routes.py          # routes_bp：景点 / 帖子 / 行程…
│   └── users.py           # users_bp：用户相关
└── migrations/            # Flask-Migrate
\`\`\`

## 扩展实例：先创建，后 init_app

app/__init__.py 里把扩展放在模块顶层，不要在 create_app 里 new 多次：

\`\`\`python
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate

jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()
\`\`\`

database.py 单独导出 db：

\`\`\`python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
\`\`\`

这样 models.py 可以 from app.database import db，而 __init__.py 里再 db.init_app app，避免模型文件 import 时应用还未创建。

## create_app 的标准顺序

\`\`\`python
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        from app.routes import routes_bp
        from app.auth import auth_bp
        from app.users import users_bp

        app.register_blueprint(routes_bp, url_prefix='/')
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(users_bp, url_prefix='/api/users')

        from app.models import User
        db.create_all()

    CORS(app, resources={r"/*": {"origins": "*"}})
    return app
\`\`\`

要点：

| 步骤 | 原因 |
|------|------|
| 先 config 再 init_app | 扩展读 SQLALCHEMY_DATABASE_URI 等配置 |
| 蓝图在 app_context 里导入 | 部分路由会 touch db / Model |
| register_blueprint 带 url_prefix | auth_bp 内写 /login，对外是 /api/auth/login |
| CORS 放最后 | 管理台 Vite 与移动端都要跨域访问 |
| db.create_all | 竞赛赶工可用；正式更推荐 Migrate |

我踩过的坑：在 init_app 之前就 from app.models import User，有时会在没有 app context 时触发 metadata 注册异常。放进 with app.app_context 后稳定了。

## 蓝图：按业务拆文件

### auth_bp auth.py

专注注册、登录、JWT 签发，前缀 /api/auth：

\`\`\`python
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    ...

@auth_bp.route('/login', methods=['POST'])
def login():
    ...
\`\`\`

### routes_bp routes.py

体量最大：景点、评论、帖子、点赞、行程、上传、管理员接口。挂在根路径 /：

\`\`\`python
routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/attractions', methods=['GET'])
def get_attractions():
    ...
\`\`\`

### users_bp users.py

用户维度的补充接口，前缀 /api/users，与 routes 里管理员 CRUD 分工。

规则：一个蓝图文件对应一类 URL 空间；函数名用动词加资源，路径用 REST 风格，方便和前端 \`api.get('/attractions')\` 对齐。

## config.py：环境相关集中管理

\`\`\`python
class Config:
    BCRYPT_LOG_ROUNDS = 12
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # 本地 travelapp 库
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = 360000
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    ADMIN_API_KEY = os.getenv('ADMIN_API_KEY')  # 管理台 X-Admin-Key
    BASE_DIR = ...
    SERVER_URL = os.getenv('SERVER_URL')  # 上传文件返回 URL 的前缀
\`\`\`

竞赛项目里我曾把密钥写在类里赶进度；提交仓库前应改为环境变量，管理台 API Key 也不要硬编码在前端。

## run.py：入口

\`\`\`python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
\`\`\`

开发时 \`python run.py\`；生产可换 gunicorn：\`gunicorn -w 4 'run:app'\`。

## 与 Express 骨架的对比

| 概念 | Flask 本项目 | Express 常见写法 |
|------|----------------|------------------|
| 入口 | create_app 工厂 | const app = express |
| 路由模块 | Blueprint 与 register_blueprint | express.Router 与 app.use |
| 配置 | app.config.from_object Config | dotenv 与 process.env |
| ORM | Flask-SQLAlchemy | 手写 SQL 或 mysql2 |

第一次写 Flask 时，把 Blueprint 当成 Express 的 Router 子应用理解，上手会快很多。

## 第一个可验证接口

蓝图注册完成后，访问根路径应返回字符串：

\`\`\`python
@routes_bp.route('/')
def home():
    return 'Welcome to the homepage!'
\`\`\`

管理台 axios 能连上、移动端能拿到 JSON，说明工厂、扩展、蓝图与 CORS 整条链通了。下一步在 \`models.py\` 定义表结构。

## 小结

旅游 APP 后端的骨架是 db、jwt、bcrypt 单例，经 create_app 按序 init，再蓝图分文件，用 url_prefix 拼出最终路径。把这套固定下来之后，后面加景点、帖子、行程接口都是在 \`routes.py\` 里照同样套路写，不用再动应用工厂。

标签：Flask
`;export{n as default};
