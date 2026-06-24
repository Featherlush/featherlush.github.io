const n=`---
title: 旅游 APP 的 SQLAlchemy 模型与 REST 设计
excerpt: jq_id 字符串主键、标签多对多、点赞关联表与 to_dict 序列化，旅游 APP 数据层和 routes 里 CRUD 的固定套路。
category: 后端开发
categoryId: backend
date: 2025-07-08
author: 徐宁
project: travel-app
series: flask-notes
---

接上篇 Flask 骨架。应用能跑之后，旅游 APP 的核心是十几张表怎么建模、REST 怎么返回 JSON。这篇按 models.py 与 routes.py 讲我当时的做法：景点用字符串主键、多对多标签、帖子点赞关联表、行程挂用户与景点。

## 技术栈角色

| 组件 | 作用 |
|------|------|
| **Flask-SQLAlchemy** | 模型类 ↔ MySQL 表 |
| **Flask-Migrate** | \`flask db migrate\` 与 \`upgrade\` 改表结构 |
| **SQLAlchemy relationship** | 一对多、多对多、反向引用 |
| **jsonify 与 to_dict** | ORM 对象转前端可用的 JSON |

## User：密码不进库、强度在 setter 里校验

\`\`\`python
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    avatar = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
\`\`\`

密码用 property setter，明文只出现在赋值瞬间：

\`\`\`python
@password.setter
def password(self, password):
    if not self._is_strong_password(password):
        raise ValueError("Weak password")
    self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(self, password):
    return bcrypt.check_password_hash(self.password_hash, password)
\`\`\`

注册接口里 User password=data['password'] 会自动哈希；永远不要 password_hash = 明文。

to_dict 只返回安全字段，不带 password_hash：

\`\`\`python
def to_dict(self):
    return {
        'id': self.id,
        'name': self.name,
        'phone': self.phone,
        'email': self.email,
        'is_admin': self.is_admin,
        'avatar': self.avatar,
        'created_at': self.created_at.isoformat(),
        'updated_at': self.updated_at.isoformat()
    }
\`\`\`

## Attraction：字符串主键 jq_id

移动端路由是 /travel-detail/:jq_id，后端主键跟前端对齐：

\`\`\`python
class Attraction(db.Model):
    __tablename__ = 'attractions'
    jq_id = db.Column(db.String(50), primary_key=True,
                      default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    province = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Float, default=0.0)
    is_recommended = db.Column(db.Boolean, default=False)
    # bg_image, description, weather_temp, weather_range, price…
\`\`\`

为什么不用自增 id：详情页、评论、付费项目、行程都引用 jq_id，URL 与库表一致，少一层映射。

### 标签多对多

中间表 attraction_tags：

\`\`\`python
attraction_tags = db.Table('attraction_tags',
    db.Column('attraction_id', db.String(50), db.ForeignKey('attractions.jq_id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'))
)

class Attraction(db.Model):
    tags = db.relationship('Tag', secondary=attraction_tags,
                           backref=db.backref('attractions', lazy='dynamic'))
\`\`\`

to_dict 里 tags: tag.name for tag in self.tags，移动端直接展示标签数组。

### 动态 comment_count

不在表里存计数，查询时算：

\`\`\`python
@property
def comment_count(self):
    return Comment.query.filter_by(attraction_jq_id=self.jq_id).count()
\`\`\`

竞赛数据量小可以接受；量大时应缓存或 SQL COUNT 聚合。

## Post 与互动：关联表建模点赞与收藏

帖子主体 Post；点赞、收藏用复合主键关联表，避免重复点赞：

\`\`\`python
class PostLike(db.Model):
    __tablename__ = 'post_likes'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)
\`\`\`

Post 上通过 secondary 暴露 liked_by，to_dict 里 like_count = self.liked_by.count()。

帖子评论 PostComment 带 parent_id，同一表实现回复树：

\`\`\`python
parent_id = db.Column(db.Integer, db.ForeignKey('post_comments.id'))
replies = db.relationship('PostComment',
    backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
\`\`\`

## TravelItinerary：行程状态

\`\`\`python
class TravelItinerary(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    attraction_jq_id = db.Column(db.String(50),
                                 db.ForeignKey('attractions.jq_id'), nullable=False)
    is_planned = db.Column(db.Boolean, default=False)  # 待出行或已出行
    planned_date = db.Column(db.Date)
    notes = db.Column(db.Text)
\`\`\`

to_dict 嵌套景点摘要，移动端列表不用再查一次景点表：

\`\`\`python
'attraction': {
    'jq_id': self.attraction_jq_id,
    'name': self.attraction.name,
    'bg_image': self.attraction.bg_image,
    'province': self.attraction.province
}
\`\`\`

## routes 里的 CRUD 套路

### 列表 GET

\`\`\`python
@routes_bp.route('/attractions', methods=['GET'])
def get_attractions():
    attractions = Attraction.query.all()
    return jsonify([a.to_dict() for a in attractions]), 200
\`\`\`

景点量大时改分页；用户列表已用：

\`\`\`python
users = User.query.order_by(User.created_at.desc()).paginate(
    page=page, per_page=per_page, error_out=False)
return jsonify({
    'items': [u.to_dict() for u in users.items],
    'total': users.total,
    'pages': users.pages,
    'current_page': users.page
})
\`\`\`

### 创建 POST

\`\`\`python
@routes_bp.route('/attractions', methods=['POST'])
def create_attraction():
    data = request.get_json()
    attraction = Attraction(name=data['name'], province=data['province'], ...)
    db.session.add(attraction)
    db.session.commit()
    return jsonify(attraction.to_dict()), 201
\`\`\`

事务：先 add 再 commit；异常时 \`db.session.rollback()\`，避免半条数据。

### 更新 PUT

按 jq_id 查记录，set 字段或逐个赋值后 commit。

### 删除 DELETE

\`\`\`python
db.session.delete(attraction)
db.session.commit()
\`\`\`

有外键关联时要注意级联；我部分表靠应用层先删子记录。

## 文件上传与静态访问

图片 POST \`/upload\`：校验扩展名，生成 uuid 文件名，存 \`uploads/\`，返回 JSON url。

\`\`\`python
return jsonify({
    "msg": "File uploaded successfully",
    "url": f"{Config.SERVER_URL}/uploads/{filename}"
}), 201
\`\`\`

静态读取：

\`\`\`python
@routes_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
\`\`\`

管理台头像、景点背景图、帖子配图都走这条链路；返回的 url 写进模型字段，库表里只存路径或完整 URL。

视频上传单独 POST /upload/video，扩展名白名单 mp4 avi mov mkv，目录 uploads/videos/。

## Flask-Migrate 使用习惯

模型改字段后：

\`\`\`bash
flask db migrate -m "add is_recommended to attractions"
flask db upgrade
\`\`\`

比 create_all 安全，不会默默丢表。竞赛前期我用 create_all 快跑，表稳定后切 Migrate。

## 小结

旅游 APP 后端的数据层可以概括成：模型里写好关系与 to_dict，路由里只做校验、ORM 操作、jsonify。jq_id 贯穿详情与行程；关联表管点赞收藏；上传接口与业务字段解耦。接口鉴权见 JWT 与管理员密钥篇。

标签：Flask, REST API, MySQL
`;export{n as default};
