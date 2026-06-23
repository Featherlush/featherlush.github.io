const n=`---
title: "场景漫游"
description: "计算机图形学课设，C++ 与 SDL2 软光栅管线，OBJ 加载、MVP 变换、裁剪与 Phong 光照，WASD 第一人称漫游。"
date: "2024-12-01"
gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.36) 100%)"
status: "已完成"
category: "graphics"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
technologies:
  - C++
  - SDL2
  - 软光栅化
  - Phong 光照
  - OBJ/MTL
  - Visual Studio
---

## 项目概述

场景漫游是 2024 年 12 月计算机图形学原理课程大作业，在课程 hducg 软渲染框架接口上，用 SDL2 在 CPU 上完成三维场景的可视化与交互漫游，不使用 OpenGL 或 DirectX 等现成三维渲染库，从矩阵、裁剪、光栅化到光照自己走一遍管线。

SDL 主循环驱动窗口与输入，绘制模块负责 MVP 变换与光栅化，Camera 封装取景与投影。支持 OBJ 与 MTL 模型、透视投影、背面剔除、Phong 光照与 WASD、空格和 Shift 相机平移。渲染效果并不理想，深度冲突、光照方向与资源加载方式都有问题，但作为把图形学流水线手写一遍的课设，代码脉络和踩坑比画面更有价值。

课设要求核心图形算法自实现；老师下发的官方示例仅作接口与周练参考，不是成品提交。相关笔记见 [图形学手记](/blog/series/cg-notes) 中标记 scene-roaming 的篇目。

## 功能概览

| 模块 | 说明 |
|------|------|
| 场景加载 | OBJ_Loader 读网格，自写 LoadMaterials 解析 MTL |
| 变换管线 | 模型矩阵、视图矩阵、透视投影、NDC、视口 |
| 裁剪 | 相机系近远平面裁剪与标准视景体 Sutherland-Hodgman |
| 光栅化 | 线段 Bresenham、多边形扫描线填充 |
| 光照 | color.h 中 Phong 环境光、漫反射与镜面高光 |
| 交互 | WASD 平移、Space Shift 升降，鼠标左右键前后，每帧 drawScene 重绘 |
| 多视口 | 设计上支持四视口，实现上主要绘制其中两块 |

## 一帧渲染流程

初始化单位立方体与单位球后，drawScene 加载 OBJ 与 MTL，清屏为灰底，对每个视口调用 drawTriangles。三角形经背面剔除、world2eye、clipNearFar、eye2ndc、clipPolygon、ndc2viewport、phongLighting 后 fillPolygon 写像素，最后 SDL 把 pixels 贴到 Texture 显示。与课程讲义一致的经典软件渲染器路径；细节与已知缺陷见博客 [光栅化与深度](/blog/cg-rasterization-depth-phong) 与 [课设复盘](/blog/cg-scene-roaming-lessons)。

\`\`\`cpp
void drawScene() {
  clearScreen(128, 128, 128);
  for (auto& viewport : viewports) {
    for (auto& tri : mesh.triangles) {
      if (backfaceCull(tri)) continue;
      auto clipped = clipNearFar(world2eye(tri));
      auto ndc = eye2ndc(clipped);
      auto screen = ndc2viewport(ndc, viewport);
      auto lit = phongLighting(screen, material, light);
      fillPolygon(screen, lit);
    }
  }
  SDL_UpdateTexture(texture, nullptr, pixels, pitch);
}
\`\`\`

\`\`\`cpp
Color phongLighting(const Vec3& normal, const Vec3& viewDir, Material m) {
  Vec3 lightDir = normalize(light.position - fragmentPos);
  float diff = std::max(dot(normal, lightDir), 0.0f);
  Vec3 reflect = reflectVec(-lightDir, normal);
  float spec = pow(std::max(dot(viewDir, reflect), 0.0f), m.shininess);
  return m.ambient + m.diffuse * diff + m.specular * spec;
}
\`\`\`

## 构建与运行

Visual Studio 与 SDL2，平台 x64 生成可执行文件。将 OBJ 与 MTL 放在程序能找到的相对路径。运行后 WASD 漫游，确认模型与材质能正确加载。依赖 SDL2 窗口与显示，以及课程提供的矩阵、OBJ 加载与读图头文件。

\`\`\`cpp
while (running) {
  handleInput();
  drawScene();
  SDL_RenderCopy(renderer, texture, nullptr, nullptr);
  SDL_RenderPresent(renderer);
}
\`\`\`

## 课设结论

做对了的是跟完 MVP、裁剪、填充整条链，相机类封装视图与投影，能加载外部模型并键盘漫游。没做好的包括 Z-buffer 在填色中未真正参与像素写入，Phong 里光源方向写法有误，绘制循环中留有调试输出，四视口只画了两块，纹理加载了但未接到着色。若重做会优先单一全局 depth buffer、片元级插值法向与 UV、资源相对路径与更清晰的模块拆分。

## 相关博客

- [软光栅与课程约束](/blog/cg-scene-roaming-repo-map)
- [hducg 软渲染框架与 SDL 主循环](/blog/cg-hducg-sdl-framework)
- [裁剪、扫描线填充与深度缓冲](/blog/cg-rasterization-depth-phong)
- [课设复盘效果不理想从哪来](/blog/cg-scene-roaming-lessons)
`;export{n as default};
