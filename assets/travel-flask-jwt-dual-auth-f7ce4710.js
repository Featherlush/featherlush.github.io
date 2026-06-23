const n=`---
title: "移动端 JWT 与管理台密钥怎样并存"
excerpt: "移动端 Bearer Token 与管理台 X-Admin-Key 并存。flask-jwt-extended 签发、admin_or_token_required 装饰器与 identity 类型踩坑。"
category: "后端开发"
categoryId: "backend"
date: "2025-07-12"
author: "徐宁"
project: travel-app
series: flask-notes
---

旅游 APP 有两类调用方：队友的移动端用户登录后发 JWT，和我写的 TravelBackFront 管理台不登录用户账号，用固定管理员密钥调 CRUD。两套鉴权不能打架，也不能让管理接口裸奔。这篇按 auth.py 与 routes.py 里的装饰器讲清楚。

## 两类客户端，两种凭证

| 调用方 | 凭证 | Header | 典型接口 |
|--------|------|--------|----------|
| 移动 APP | JWT | Authorization Bearer token | 发帖、行程、点赞 |
| 管理后台 | API Key | X-Admin-Key 密钥 | 用户列表、删帖、传视频 |

移动端用户也可能 is_admin=True，但管理台为了联调简单，直接用密钥，不必先模拟管理员登录。

## 注册与登录：签发 JWT

auth.py 蓝图前缀 /api/auth。

### 注册

校验手机、邮箱唯一后，\`User password=明文\` 触发 bcrypt，再 \`db.session.commit\`，返回 \`user.to_dict()\`；不在注册响应里带 token，移动端可再调登录。

### 登录

\`\`\`python
user = User.query.filter_by(phone=data['phone']).first()
if not user or not user.verify_password(data['password']):
    return jsonify({"msg": "Invalid credentials"}), 401

access_token = create_access_token(identity=str(user.id))

return jsonify({
    "msg": "Login successful",
    "access_token": access_token,
    "user": user.to_dict()
}), 200
\`\`\`

注意：identity 我传的是 str user.id。flask-jwt-extended 新版本 identity 常为字符串，后面 get_jwt_identity 拿到的是 str，查库时要 int user_id。

### Config 里 JWT 相关项

\`\`\`python
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = 360000
JWT_TOKEN_LOCATION = ['headers']
JWT_HEADER_NAME = 'Authorization'
JWT_HEADER_TYPE = 'Bearer'
\`\`\`

竞赛里过期时间设得很长是为了演示不断线；正式环境应短过期并配合刷新机制。

### 受保护接口示例

\`\`\`python
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))
    return jsonify(user.to_dict())
\`\`\`

移动端 Axios 拦截器在登录成功后：

\`\`\`javascript
localStorage.setItem('token', access_token)
// 请求头：Authorization Bearer + token 字符串拼接
\`\`\`

## 管理员密钥：管理台专用

Config.ADMIN_API_KEY 与请求头比对：

\`\`\`python
api_key = request.headers.get('X-Admin-Key')
if api_key != Config.ADMIN_API_KEY:
    return jsonify({"msg": "Invalid admin key"}), 401
\`\`\`

用于例如 GET /users、GET /admin 拉全量用户列表，只给管理台，不暴露给普通移动用户。

视频上传 POST /upload/video 也要求 Admin Key，防止匿名传大文件。

## admin_or_token_required：一套装饰器兼容两种调用

部分接口既要移动端用户访问，又要管理员密钥 bypass，我写了一个组合装饰器：

\`\`\`python
def admin_or_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        admin_key = request.headers.get('X-Admin-Key')
        if admin_key and admin_key == current_app.config['ADMIN_API_KEY']:
            g.current_user_id = None
            g.is_admin = True
            return f(*args, **kwargs)

        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            g.current_user_id = user_id
            g.is_admin = False
            user = User.query.get(user_id)
            if user and user.is_admin:
                g.is_admin = True
            return f(*args, **kwargs)
        except Exception:
            return jsonify({"msg": "Authentication required"}), 401
    return decorated
\`\`\`

逻辑顺序：

1. 先看 X-Admin-Key 是否正确，视为管理员，无 user_id
2. 否则走 JWT，设 \`g.current_user_id\`；若用户 is_admin 也提升权限
3. 都失败则 401

视图函数里用 g.current_user_id / g.is_admin 分支，避免重复解析 Header。

## 自定义 token_required 与 jwt_required 别混用

项目里还有一层 token_required，内部调 jwt_required 再把 user_id 挂到 request.user_id：

\`\`\`python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        jwt_required()(lambda: None)()
        request.user_id = get_jwt_identity()
        return f(*args, **kwargs)
    return decorated
\`\`\`

踩坑：同一接口如果 jwt_required 和 token_required 叠两层，或 identity 类型 int/str 不一致，会偶发 422。我的做法是：

- 移动端用户接口：统一 jwt_required 与 int get_jwt_identity
- 管理 CRUD：只验 X-Admin-Key
- 少数两者都要：用 admin_or_token_required

## 管理台 Axios 拦截器

TravelBackFront/src/api/index.js：

\`\`\`javascript
api.interceptors.request.use(config => {
  config.headers['X-Admin-Key'] = ({}).VITE_ADMIN_KEY
  return config
})
\`\`\`

每个请求自动带密钥，组件里只写 api.get '/admin'。密钥不要提交到公开仓库；本地用 .env 与 Vite 环境变量注入。

## 安全清单竞赛后应补的

1. ADMIN_API_KEY、JWT_SECRET_KEY、数据库密码全部环境变量
2. 管理接口限制 IP 或加二次登录，密钥仅内网
3. CORS 生产环境改白名单，不用 origins *
4. 上传接口校验 MIME 与大小，视频与图片分开限流
5. is_admin 用户权限变更后，旧 JWT 仍有效直到过期，敏感操作可校验 DB 最新 is_admin

## 小结

旅游 APP 的双轨鉴权本质是：移动用户走 JWT 身份，管理运维走 API Key 角色。create_access_token identity=str user.id 签发，Authorization Bearer 携带；管理台 X-Admin-Key 走另一扇门。用装饰器把分支收拢到一处，路由函数只关心业务，鉴权逻辑不散落在每个 if header 里。

标签：Flask, JWT
`;export{n as default};
