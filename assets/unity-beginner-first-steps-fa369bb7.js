const n=`---
title: "开 Unity 网课前，编辑器与生命周期笔记"
excerpt: "2025 年 12 月开 Unity 网课前的入门笔记，Scene、Prefab、MonoBehaviour 生命周期，以及从 Web 开发视角理解组件化思路。"
category: "游戏开发"
categoryId: "game"
date: "2025-12-05"
author: "徐宁"
series: unity-notes
---

2025 年 12 月初，我几乎没有正经写过 Unity 项目。此前最接近游戏引擎的经历，是同年秋天用 C++/SFML 做的 [Tetris 课设](/blog/tetris-ai-sfml-architecture)——手写主循环、自己管资源路径，和 Unity 的编辑器驱动完全是两套手感。这篇单独记编辑器在干什么、脚本挂在哪、一帧里谁先跑，不涉及具体战斗逻辑。

**说明** — 工程与讲义来自网课，我在 Unity **2022.3 LTS** 上复现。下文是通用 Unity 知识加上跟练时的个人对照，不是官方教程复述。

## 一、从 Web 到 Unity

| Web 与后端 | Unity |
|------------|--------|
| 页面 DOM 树 | **Hierarchy** 里的 GameObject 树 |
| CSS 与组件样式 | **Inspector** 里挂的 Component |
| \`npm run dev\` 热更新 | Play 模式，改脚本会重新编译，部分 Inspector 值可保留 |
| 路由换页 | **Scene** 切换，\`SceneManager\` |
| 可复用 React 组件 | **Prefab** 预制体 |
| \`index.html\` 入口 | 场景里某个 GameObject 上的启动脚本 |

类比不完美，但帮我少问这个按钮在哪。一切可运行内容，最终都是场景里的对象加组件。

## 二、编辑器四块窗口

跟练时天天碰这四块：

1. **Hierarchy** — 当前场景对象列表。父子关系意味着变换继承，子物体跟着父物体动。
2. **Scene 与 Game** — Scene 用来编辑摆放，Game 是摄像机看到的画面。Play 时操作手感以 Game 为准。
3. **Inspector** — 选中对象的组件与序列化字段。讲义里大量把 xxx 拖到 public 字段，都在这里完成。
4. **Project** — 资产库，脚本、模型、贴图、预制体、\`.meta\` 都在这。

另外还有 **Console**，看 \`Debug.Log\` 和报错栈；**Animation** 窗口用来绑动画事件，后面战斗逻辑会用到。

## 三、GameObject 与 Component

Unity 不是一个类写一个角色。一个 GameObject 是空容器，上面可以挂多种组件：

- **Transform** — 位置、旋转、缩放，每个对象必有
- **MeshRenderer 与 MeshFilter** — 看得见
- **Collider 与 Rigidbody** — 碰撞，可选
- **Animator** — 动画，可选
- **NavMeshAgent** — 寻路，可选
- **你的 MonoBehaviour 脚本** — 逻辑

同一个预制体可以挂不同脚本组合出不同行为。塔防 Demo 里怪物预制体在场景里只有模型，运行时 \`MonsterPoint\` 才 \`AddComponent<MonsterObject>()\`。逻辑组件可以代码动态加，不必全在 Prefab 里固化。

## 四、MonoBehaviour 生命周期

讲义和踩坑都围绕这条链，跟练时值得背下来：

- **Awake** — 对象实例化后，无论是否激活都会跑。常做 GetComponent、单例注册。
- **OnEnable** — 对象变为 active 时。
- **Start** — 第一帧 Update 之前，所有 Awake 执行完后。常做 Init、Invoke 首开。
- **FixedUpdate** — 固定物理步长，本 Demo 几乎没用。
- **Update** — 每帧逻辑，输入、索敌、UI 淡入淡出。
- **LateUpdate** — 本帧所有 Update 之后，相机跟随放这里。
- **OnDisable 与 OnDestroy** — 清理、CancelInvoke。

网课 Demo 里的典型分工：

| 脚本 | 用的阶段 | 原因 |
|------|----------|------|
| \`MainTower.Awake\` | 注册单例 | 别的脚本 Start 里就要访问 Instance |
| \`MonsterObject.Awake\` | 取 Agent、Animator | 保证 InitInfo 前组件就绪 |
| \`MonsterPoint.Start\` | \`Invoke\` 第一波 | 等 GameLevelMgr 等管理器可用 |
| \`CameraMove.LateUpdate\` | 跟拍主角 | 主角 Update 转完再摆相机 |
| \`BasePanel.Update\` | CanvasGroup 渐变 | 与游戏逻辑同帧即可 |

我第一次把相机跟拍写在 \`Update\` 里，画面轻微抖动。换成 \`LateUpdate\` 就稳了，这是初学里很有体感的一课。

\`\`\`csharp
void LateUpdate() {
    transform.position = target.position + offset;
    transform.LookAt(target);
}
\`\`\`

相机跟随应放在主角本帧 \`Update\` 旋转完成之后，否则跟拍会错一帧。

## 五、Scene 与 DontDestroyOnLoad

塔防 Demo 至少两个场景：

- **BeginScene** — 主菜单、选角、选关，相机动画、\`HeroPos\` 展示位
- **GameScene1 与 GameScene2** — 战斗地图，\`HeroBornPos\`、刷怪点、塔位、NavMesh、主塔

\`SceneManager.LoadSceneAsync\` 异步加载战斗场景。UI 的 Canvas 在 \`UIManager\` 构造时用 \`DontDestroyOnLoad\`，避免切场景把界面根删掉。

初学容易忘的一点 — 场景里叫 \`HeroBornPos\` 的空物体必须存在。否则 \`GameObject.Find\` 返回 null，讲义下一行 \`Instantiate\` 直接炸。

## 六、Prefab

Prefab 是资产里的对象模板。运行时用：

\`\`\`csharp
GameObject obj = Instantiate(Resources.Load<GameObject>("Role/1"), pos, rot);
\`\`\`

实例和 Prefab 已断开链接，除非显式 Prefab Variant。改场景里的实例不会回写资产。选角界面预览英雄时会故意 \`Destroy(PlayerObject)\`，避免预览模型响应战斗输入。Prefab 复用加按需剥组件，是讲义里的小技巧。

## 七、输入、物理与 Layer

- **输入** — \`Input.GetAxis\`、\`GetKeyDown\`、\`GetMouseButtonUp\`，旧输入系统，网课统一用它。
- **物理检测** — \`OverlapSphere\`、\`RaycastAll\`，依赖 Collider 和 LayerMask。Layer 没建或没赋给物体，检测永远 0 命中，且不一定报错。

\`\`\`csharp
int mask = LayerMask.GetMask("Monster");
Collider[] hits = Physics.OverlapSphere(origin, radius, mask);
\`\`\`
- **NavMesh** — 怪物用 \`NavMeshAgent.SetDestination\` 走向主塔。地图要 Bake NavMesh，否则 Agent 不动。

初学阶段只要记住 — 表现和判定经常通过动画事件桥接，具体在后面的战斗逻辑里展开。

## 八、跟练第一周检查清单

1. Unity Hub 装 **LTS**，工程版本与讲义一致，2022.3。
2. 打开工程先等 **Library 导入**完成，别急着 Play。
3. 脚本报错先看 Console 第一条，别同时改十处。
4. 场景是否保存，Build Settings 里是否加了 BeginScene 为首个场景。
5. \`public\` 字段是否在 Inspector 拖了引用，\`gunPoint\`、按钮等。
6. Animation 窗口里事件是否绑到正确 **public 方法名**。

## 九、和 SFML 课设的对比

Tetris 课设里，主循环、事件轮询、资源拷贝路径全靠自己写。Unity 把场景树、组件生命周期、预制体实例化都交给引擎管。从 Web 后端转过来，Hierarchy 像 DOM，Inspector 像 props，Prefab 像可复用组件 — 这套类比帮我少在菜单里迷路。接下来跟网课，会把资源分层和塔防架构单独记几篇。
`;export{n as default};
