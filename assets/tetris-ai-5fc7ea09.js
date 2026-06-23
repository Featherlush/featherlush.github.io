const n=`---
title: "Tetris AI 双打"
description: "游戏课程设计，C++ 与 SFML 双人俄罗斯方块，启发式评估与穷举落点搜索实现 AI 托管，美术资源由课程提供。"
date: "2025-09-15"
gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(124, 58, 237, 0.36) 100%)"
status: "已完成"
category: "game"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
cover: "/images/projects/tetris-ai/cover.png"
technologies:
  - C++
  - SFML 3
  - CMake
  - 启发式搜索
  - 游戏循环
---

## 项目概述

Tetris AI 是 2025 年 9 月游戏开发课程设计作业，在课程提供的 CMake 与 SFML 俄罗斯方块模板上，为双人对战版加入 AI 托管能力。玩家 1 默认手动 WASD 与 Space，玩家 2 默认由 AI 操作；两侧均可通过 Alt 切换托管。底层玩法包含 Bag7 随机、Hold 交换、硬降、落点阴影、底部缓冲、消行动画等现代方块规则；UI 背景、按钮、方块贴图与布局由助教与课程美术资源提供，本人主要负责架构梳理与 AI 决策模块。

相关笔记见 [Tetris 开发手记](/blog/series/tetris-notes) 中标记 tetris-ai 的篇目。

## 界面与对战

![双人俄罗斯方块玩家 1 手动 vs 玩家 2 AI 托管](/images/projects/tetris-ai/cover.png)

| 区域 | 说明 |
|------|------|
| 双盘面 | 10×20 可见舞台与顶部 4 行缓冲，左右对称布局 |
| Next Hold | 中央预览下一块，Hold 区支持一次交换 |
| 操作说明 | 中部面板列出 P1 P2 键位与托管切换 |
| 皮肤切换 | 左右箭头轮换 4 套背景与方块贴图 |
| 开始暂停 | 鼠标点击底部按钮，结束后可点结束重开 |

| 玩家 | 移动 | 旋转 | 软降 | 硬降 | Hold | 托管 |
|------|------|------|------|------|------|------|
| P1 | WASD | W | S | Space | 左 Ctrl | 左 Alt |
| P2 | 方向键 | ↑ | ↓ | Enter | 右 Ctrl | 右 Alt |

## 代码架构

工程用 CMake 拉取 SFML 3.0.1，核心编译为静态库 GameLib，入口 main 只负责创建 Game 并驱动主循环。

| 模块 | 文件 | 职责 |
|------|------|------|
| 入口 | main.cpp | while window.isOpen gameRun |
| 平台层 | Game.cpp Game.h | SFML 窗口、双 Tetris 实例、输入分发、绘制合成、对局状态 |
| 规则层 | Tetris.cpp Tetris.h | 单玩家场地 Field、碰撞、Bag7、Hold、消行与动画 |
| AI 层 | PD.cpp | 落点穷举、calculate 启发式评分、logicAI 托管步进 |
| 资源 | data/images data/Fonts | 背景、frame、按钮、方块条、胜负贴图、字体 |

Game 管窗口与两个玩家，Tetris 管一块盘面的全部状态。AI 不单独建类，而是 Tetris 在 AI 为 true 时走 logicAI 分支，与手动 traditonLogic 共用同一套 Field 与绘制逻辑。主循环每帧 gameInput，若已开始则 gameLogic，再 gameDraw；gameLogic 里对 player1、player2 分别调用 Logic，两侧计时器独立累加。

\`\`\`cpp
void Game::gameLogic() {
  if (!started) return;
  player1.Logic();
  player2.Logic();
}
\`\`\`

## AI 思路概览

每一颗新方块落地前，AI 在所有合法水平位置与四种旋转上模拟硬降，用六维场地特征加权求和得到评分，取最高分落点并立即硬降落子，托管模式下跳过消行动画以加快节奏。

| 特征 | 含义 | 权重方向 |
|------|------|----------|
| Landing Height | 落点高度 | 负，越低越好 |
| Rows Eliminated | 可消行数 | 正 |
| Row Column Transition | 行列车空满切换次数 | 负，减少锯齿 |
| Hole Num | 空洞数量 | 负 |
| Well Sum | 井深度累加 | 负 |

\`\`\`cpp
float calculate(const Field& field) {
  return -0.51f * landingHeight(field)
       +  0.76f * rowsEliminated(field)
       -  0.36f * rowColTransitions(field)
       -  0.98f * holeCount(field)
       -  0.63f * wellSum(field);
}
\`\`\`

代码中还保留 GAINFO 结构与注释掉的遗传算法种群训练逻辑，当前运行版本使用已训练好的浮点系数；游戏结束时可将盘面写入 test.txt 便于复盘。另有一条硬约束，模拟盘面中心列上方不得被占用，避免 AI 过早把堆叠顶到出生区。

\`\`\`cpp
void Tetris::logicAI() {
  int bestRot = 0, bestCol = 0;
  float bestScore = -1e9f;
  for (int rot = 0; rot < 4; ++rot)
    for (int col = minCol; col <= maxCol; ++col) {
      Field sim = field.clone();
      hardDrop(sim, rot, col);
      float score = calculate(sim);
      if (score > bestScore) { bestScore = score; bestRot = rot; bestCol = col; }
    }
  applyMove(bestRot, bestCol, true);
}
\`\`\`

## 构建与运行

\`\`\`bash
cmake -B build
cmake --build build
\`\`\`

POST_BUILD 会把 data 复制到 build/bin/data，从 build/bin 运行时资源路径与 Game::LoadMediaData 一致。

## 课程分工说明

美术与 UI 布局来自课程提供的背景、按钮、胜负图与坐标常量。双打基础玩法来自课程模板与同学扩展 Hold、Bag7、阴影、缓冲等。本人工作为 AI 特征提取、落点搜索、logicAI 接入与 CMake SFML 3 编译调试。

## 相关博客

- [Game 与 Tetris SFML 游戏循环怎么拆](/blog/tetris-ai-sfml-architecture)
- [俄罗斯方块 AI 六维启发式与落点穷举](/blog/tetris-ai-heuristic-search)
`;export{n as default};
