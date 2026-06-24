const n=`---
title: 跟练 Unity 塔防，复现之外的几点感触
excerpt: 资源与代码来自课程，我做的主要是搭工程与调配置，诚实记录跟练的价值与边界。
category: 成长随笔
categoryId: career
date: 2026-01-15
author: 徐宁
series: unity-notes
---

2025 年 12 月到 2026 年 1 月，我跟着 Unity 网课把一套 **第三人称塔防 Demo** 在本地跑通。架构与类职责见 [塔防架构篇](/blog/unity-tower-defense-framework)，局内战斗见 [刷怪与索敌篇](/blog/unity-tower-defense-gameplay-loop)，入门与资源见 [Unity 初学](/blog/unity-beginner-first-steps)、[游戏资源管理](/blog/unity-game-asset-management)。这篇不重复代码结构，只记跟练这件事本身，以及它和 portfolio 里 Tetris 课设、产学研 Web 项目的差别。

## 一、先说清楚

课程提供了 **场景、模型、特效、UI 预制体、JSON 表和脚本模板**。我的工作集中在：

- 按章节创建/打开工程，挂组件、拖引用：配置 NavMesh、Layer \`Monster\`、\`MainUI\`、动画事件：本地调试时补了一些 \`Debug.Log\`、碰撞检测容错

\`\`\`csharp
Debug.Log($"Overlap hits: {hits.Length}, layer={LayerMask.GetMask("Monster")}");
\`\`\`

**没有把这套 Demo 写进站点项目列表**：它不适合当作独立工程成果展示，更适合作为 Unity 入门学习记录放在博客里。

诚实区分我写的和课里带的，以后看简历或作品集时心里才不拧巴。

## 二、跟练教会的是编辑器工作流

网课节奏是：先能看见菜单淡入淡出，再能看见怪走过来，最后才扣血。如果一上来就啃 \`NavMeshAgent\` 文档，很容易弃坑。

我印象最深的几步反而是非代码：

1. **Animation Event**：攻击帧上挂 \`KnifeEvent\` 与 \`ShootEvent\`，才理解逻辑不必全堆在 Update 里
2. **Layer 与 Physics**：射线打不到怪，多半是层掩码或碰撞体在子节点
3. **NavMesh Bake**：怪不动，先查地面是否 Static、Agent 是否贴地

这些在 C++ SFML Tetris 里不存在。它们是 Unity 作为编辑器驱动引擎的核心体验。

## 三、单例多，但职责分得清

跟练初期会觉得 \`UIManager\`、\`GameDataMgr\`、\`GameLevelMgr\` 全是单例有点野。跟完一整条选英雄、选关、战斗与结算链路后，分工反而清楚：

- **UI 单例**：跨场景 Canvas，面板生命周期
- **数据单例**：表加存档，无场景依赖
- **关卡单例**：仅战斗场景有意义，返回菜单应 \`Clearinfo\`

若自己从零做塔防，我可能会把关卡改成场景内 \`MonoBehaviour\` 协调器。网课选单例，是为了少讲 DontDestroyOnLoad 与场景切换的细节，教学上合理。

## 四、踩坑清单

| 现象 | 常见原因 |
|------|----------|
| 近战与射击无伤害 | 未建 \`Monster\` 层，或 \`gunPoint\` 未赋值 |
| 主塔不掉血 | 主塔碰撞体 Layer 不是 \`MainUI\`，或 \`AtkEvent\` 检测范围太小 |
| 怪站在原地 | NavMesh 未烘焙，或 Agent 初始位置不在 NavMesh 上 |
| 造塔扣钱但无模型 | \`TowerInfo.res\` 路径与 Resources 目录不一致 |
| 胜利面板不弹出 | 某 \`MonsterPoint\` 波次未结束，或死亡 \`Invoke\` 未完成就清场 |

网课通常会逐步演示这些。自己快进或跳章时，就会撞上整张表里的某一行。

## 五、和 Tetris 课设放一起看

- **Tetris**：CMake、双人对战、自写 AI，强调算法与架构，画面简陋但代码是自己的
- **Unity 塔防网课**：画面完整、玩法成型，强调引擎特性与工具链，代码与资产大半来自课程

两者加在一起，对我意味着：能做规则与 AI，也知道在成熟引擎里怎么接资源、动画和物理。下一步若做原创小游戏，更值得练的是在网课骨架外改机制，例如新塔类型、新波次规则，而不是再跟一遍同款项目。

## 六、还会不会继续跟 Unity

会，但会换目标：更小、可发布的 scope，一个机制、一个关卡，并尽量用自己写的脚本加免费资产，避免整包复现。

这篇博客的定位就是学习轨迹的一页，不夸大，也不删掉。2026 年 1 月合上工程时，至少我能向别人讲清楚：这个塔防 Demo 里，菜单、JSON、刷怪、造塔、动画事件各自在哪一层，以及我实际动手的是哪几步。
`;export{n as default};
