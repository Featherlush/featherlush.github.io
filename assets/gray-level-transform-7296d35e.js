const n=`---
title: "灰度点运算实验"
description: "图像处理课程作业，Python 与 NumPy 实现对数、幂律、根指数与负片等灰度点变换，Matplotlib 六宫格对比展示。"
date: "2024-10-15"
gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.36) 100%)"
status: "已完成"
category: "image"
tier: "other"
demoUrl: null
codeUrl: null
featured: false
technologies:
  - Python
  - NumPy
  - Pillow
  - Matplotlib
  - 点运算
---

## 项目概述

灰度点运算实验是 2024 年 10 月图像处理课程作业，对单幅灰度图做点运算，每个像素的输出灰度只由该像素输入灰度决定，不涉及邻域。作业用 Python 在 NumPy 数组上实现五种经典灰度变换，并用 Matplotlib 以 2×3 子图对比原图与结果。

这是我从调库画图转向理解灰度映射公式的一次小作业，没有 GUI，没有深度学习，核心是读图、逐像素公式、归一化到 0–255 与可视化。

相关笔记见 [图像处理手记](/blog/series/ip-notes) 中标记 gray-level-transform 的篇目。

## 实现的变换

| 变换 | 公式思路 | 课设参数 | 视觉效果 |
|------|----------|----------|----------|
| 原图 | — | 灰度 L | 基准 |
| 对数变换 | 见下方代码 | c 由 max 归一化 | 暗区细节拉开 |
| 逆对数变换 | 对数结果的指数还原 | 验证可逆性 | 应接近原图 |
| 幂律伽马 | 见下方代码 | γ = 2.2 | 整体偏暗、对比压缩 |
| 根指数 | 见下方代码 | n = 2 即 γ=0.5 | 提亮、类似反伽马 |
| 负片 | 见下方代码 | — | 明暗反转 |

常数 c 均按当前图像最大值缩放，使输出落在 uint8 可显示范围。对数变换对输入加微小量，避免零值取对数。

\`\`\`python
def log_transformation(r, c):
    r = r.astype(np.float64)
    s = c * np.log1p(r)
    return np.clip(s, 0, 255).astype(np.uint8)

def power_law_transformation(r, gamma, c):
    r_norm = r.astype(np.float64) / 255.0
    s = c * np.power(r_norm, gamma)
    return np.clip(s, 0, 255).astype(np.uint8)

def negative_transformation(r):
    return 255 - r
\`\`\`

## 代码结构

单脚本组织，load_image 用 PIL 读图转灰度 ndarray；log_transformation、inverse_log_transformation、power_law_transformation、root_transformation、negative_transformation 各自实现映射；display_images 用 2×3 subplot 与中文标题展示。主流程读入测试图、依次变换、plt.show 弹出对比窗。

\`\`\`python
def load_image(path):
    return np.array(Image.open(path).convert('L'))

def display_images(images, titles):
    fig, axes = plt.subplots(2, 3, figsize=(12, 8))
    for ax, img, title in zip(axes.flat, images, titles):
        ax.imshow(img, cmap='gray', vmin=0, vmax=255)
        ax.set_title(title)
        ax.axis('off')
    plt.tight_layout()
    plt.show()
\`\`\`

依赖 Pillow 读图、NumPy 向量化运算、Matplotlib 展示，未使用 OpenCV，点运算在作业规模下手写公式更贴合课程要求。

## 与后续课程的关系

2024 年 12 月 [场景漫游](/projects/scene-roaming) 做三维软光栅，本作业是二维灰度域的入门。之后可视化项目大量用 Canvas 与 ECharts，本质仍是数据到像素或图形属性的映射。若接深度学习，点运算里的归一化与伽马校正会出现在数据预处理里。

## 运行方式

\`\`\`bash
pip install numpy pillow matplotlib
python 1.py
\`\`\`

将待测图片放在脚本同目录或修改 image_path。Windows 下若中文标题乱码，需系统有中文字体或把 plt.rcParams 改为本机已有字体。

## 相关博客

- [灰度点运算公式与 NumPy 实现](/blog/ip-gray-level-point-ops)
- [图像处理课作业点运算的一点感触](/blog/ip-homework-reflections)
`;export{n as default};
